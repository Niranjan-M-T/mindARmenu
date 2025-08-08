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

  let currentModel = null;
  let menuData = [];
  let currentIndex = -1;

  const fetchMenuData = async () => {
    try {
      const response = await fetch('assets/menu.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      menuData = await response.json();
      await createMenuUI();

      if (menuData.length > 0) {
        showItem(0);
      }

      loadingOverlay.style.opacity = '0';
      menuOverlay.style.opacity = '1';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 500);

    } catch (e) {
      console.error("Failed to load menu data:", e);
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
      itemNameEl.textContent = "Error";
      itemDescriptionEl.textContent = "Could not load item details.";
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
      console.error(`Unsupported model format: .${fileExtension}`);
      itemNameEl.textContent = "Error";
      itemDescriptionEl.textContent = `Unsupported model format: .${fileExtension}.`;
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

  startButton.onclick = () => {
    // Hide UI elements for an unobstructed AR view
    menuItemsContainer.style.display = 'none';
    itemDetailsPanel.style.display = 'none';
    startButton.style.display = 'none';

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') !== 'true') {
      sceneEl.systems['mindar-image'].start().catch(error => {
        console.error("MindAR starting failed:", error);
        // Bring back the UI if AR fails to start
        menuItemsContainer.style.display = 'flex';
        itemDetailsPanel.style.display = 'block';
        itemDetailsPanel.innerHTML = `<p style="color: red;">Could not start AR camera. Please check permissions.</p>`;
      });
    }
  };

  // --- Swipe Navigation ---
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
    if (startButton.style.display === 'none') return; // Don't swipe if in AR mode
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

  fetchMenuData();
});
