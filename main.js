document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const menuItemsContainer = document.getElementById('menu-items');
  const itemNameEl = document.getElementById('item-name');
  const itemDescriptionEl = document.getElementById('item-description');
  const targetEntity = document.getElementById('target-entity');
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
  menuOverlay.style.opacity = '1'; // Show the menu UI by default

  let currentModel = null;
  let menuData = [];
  let currentIndex = -1;

  const fetchMenuData = async () => {
    try {
      log('Fetching menu data...');
      const response = await fetch('mindARmenu/assets/menu.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      menuData = await response.json();
      log('Menu data fetched. Creating UI...');
      await createMenuUI();
      log('UI Created.');

      if (menuData.length > 0) showItem(0);
      log('Default item loaded.');
    } catch (e) {
      log(`Error in fetchMenuData: ${e.message}`);
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

  // With AR.js, the camera starts automatically. The button just hides the UI.
  startButton.onclick = () => {
    log('Start AR button clicked. Hiding UI for AR view.');

    // Forcibly hide the loader in case AR.js fails to do so
    const loader = document.querySelector('.arjs-loader');
    if (loader) loader.style.display = 'none';

    menuItemsContainer.style.display = 'none';
    itemDetailsPanel.style.display = 'none';
    startButton.style.display = 'none';
  };

  // --- Swipe Navigation ---
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;

  menuOverlay.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  menuOverlay.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });

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

  // --- AR.js Event Listeners ---
  sceneEl.addEventListener('camera-init', (data) => {
    log('AR.js camera-init event fired.');
    startButton.disabled = false;
    log('Start AR button enabled.');
  });

  sceneEl.addEventListener('camera-error', (error) => {
    log(`AR.js camera-error event fired: ${error.detail.error}`);
  });

  // --- AR.js Marker Events ---
  targetEntity.addEventListener('markerFound', () => {
    log('Marker Found!');
  });

  targetEntity.addEventListener('markerLost', () => {
    log('Marker Lost.');
  });

  fetchMenuData();
});
