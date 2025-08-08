document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const menuItemsContainer = document.getElementById('menu-items');
  const itemNameEl = document.getElementById('item-name');
  const itemDescriptionEl = document.getElementById('item-description');
  const targetEntity = document.getElementById('target-entity');
  const loadingOverlay = document.getElementById('loading-overlay');
  const menuOverlay = document.getElementById('menu-overlay');
  const startButton = document.getElementById('start-ar-button');
  const itemDetailsPanel = document.getElementById('item-details');
  const debugLog = document.getElementById('debug-log');

  const log = (message) => {
    const p = document.createElement('p');
    p.textContent = `> ${message}`;
    debugLog.appendChild(p);
    debugLog.scrollTop = debugLog.scrollHeight;
  };

  log('DOM content loaded. Script starting.');
  startButton.disabled = true;

  let currentModel = null;
  let menuData = [];
  let currentIndex = -1;

  const fetchMenuData = async () => {
    try {
      log('Fetching menu data...');
      const response = await fetch('assets/menu.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      menuData = await response.json();
      log('Menu data fetched. Creating UI...');
      await createMenuUI();
      log('UI Created.');

      if (menuData.length > 0) showItem(0);

      loadingOverlay.style.opacity = '0';
      menuOverlay.style.opacity = '1';
      setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500);
      log('Loading complete. Menu is visible.');

    } catch (e) {
      log(`Error in fetchMenuData: ${e.message}`);
      loadingOverlay.style.display = 'none';
    }
  };

  const createMenuUI = async () => {
    const promises = menuData.map((item, index) => {
      const button = document.createElement('button');
      button.onclick = () => showItem(index);
      menuItemsContainer.appendChild(button);

      return fetch(`assets/${item.text}`)
        .then(response => response.text())
        .then(text => {
          const [name] = text.split('\n');
          button.textContent = name || `Item ${index + 1}`;
        });
    });
    await Promise.all(promises);
  };

  const showItem = async (index) => {
    if (index < 0 || index >= menuData.length) return;
    currentIndex = index;

    const buttons = menuItemsContainer.querySelectorAll('button');
    buttons.forEach((btn, btnIndex) => {
      btn.classList.toggle('active', btnIndex === currentIndex);
    });

    const item = menuData[currentIndex];
    if (!item) return;

    if (currentModel) {
      targetEntity.removeChild(currentModel);
      currentModel = null;
    }

    try {
      const response = await fetch(`assets/${item.text}`);
      const text = await response.text();
      const [name, ...descriptionParts] = text.split('\n');
      itemNameEl.textContent = name || 'No name';
      itemDescriptionEl.textContent = descriptionParts.join('\n').trim() || 'No description available.';
    } catch (e) {
      log(`Error showing item details: ${e.message}`);
    }

    const modelSrc = `assets/${item.model}`;
    const fileExtension = item.model.split('.').pop().toLowerCase();
    let modelEl;

    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      modelEl = document.createElement('a-gltf-model');
      modelEl.setAttribute('src', modelSrc);
    } else if (fileExtension === 'obj') {
      modelEl = document.createElement('a-obj-model');
      modelEl.setAttribute('src', modelSrc);
      const mtlSrc = modelSrc.replace(/\.obj$/, '.mtl');
      modelEl.setAttribute('mtl', mtlSrc);
    } else {
      log(`Unsupported model format: .${fileExtension}`);
      return;
    }

    modelEl.setAttribute('position', '0 0.5 0');
    modelEl.setAttribute('scale', '0.1 0.1 0.1');
    modelEl.setAttribute('rotation', '0 0 0');

    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      modelEl.setAttribute('animation-mixer', '');
    }

    targetEntity.appendChild(modelEl);
    currentModel = modelEl;
  };

  startButton.onclick = async () => {
    log('Start AR button clicked.');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      log('Test mode enabled. Skipping camera start.');
      return;
    }

    // Hide UI for AR view
    menuItemsContainer.style.display = 'none';
    itemDetailsPanel.style.display = 'none';
    startButton.style.display = 'none';

    // 1. Pre-flight check for camera permissions
    try {
      log('Attempting pre-flight camera check...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      log('Pre-flight check successful. Camera is accessible.');
      // Stop the stream immediately, we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      log(`Pre-flight check failed: ${err.name} - ${err.message}`);
      log('Aborting AR start. Please check browser/OS camera permissions.');
      itemDetailsPanel.innerHTML = `<p style="color: red;">Camera permission denied. Please check your browser and system settings.</p>`;
      itemDetailsPanel.style.display = 'block';
      return;
    }

    // 2. Attempt to start MindAR with a timeout
    log('Attempting to start MindAR camera...');
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MindAR start timed out after 10 seconds.')), 10000)
      );

      await Promise.race([
        sceneEl.systems['mindar-image'].start(),
        timeoutPromise
      ]);

      log('MindAR camera started successfully.');

    } catch (error) {
      log(`MindAR starting failed: ${error}`);
      menuItemsContainer.style.display = 'flex';
      itemDetailsPanel.style.display = 'block';
      itemDetailsPanel.innerHTML = `<p style="color: red;">Could not start AR camera. Error: ${error.message}</p>`;
    }
  };

  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;

  menuOverlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  menuOverlay.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (startButton.style.display === 'none') return;
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) < swipeThreshold) return;

    if (swipeDistance < 0) {
      const nextIndex = (currentIndex + 1) % menuData.length;
      showItem(nextIndex);
    } else {
      const prevIndex = (currentIndex - 1 + menuData.length) % menuData.length;
      showItem(prevIndex);
    }
  }

  sceneEl.addEventListener('loaded', () => {
    log('A-Frame scene loaded. AR system should be ready.');
    startButton.disabled = false;
    log('Start AR button enabled.');
  });

  fetchMenuData();
});
