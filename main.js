document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const menuItemsContainer = document.getElementById('menu-items');
  const itemNameEl = document.getElementById('item-name');
  const itemDescriptionEl = document.getElementById('item-description');
  const targetEntity = document.getElementById('target-entity');

  let currentModel = null;
  let menuData = [];

  const fetchMenuData = async () => {
    try {
      // In a real scenario, this would be the only file the user needs to edit.
      // To add/remove items, they just edit menu.json
      // To change details, they edit the corresponding .txt file.
      const response = await fetch('assets/menu.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      menuData = await response.json();
      createMenuUI();
    } catch (e) {
      console.error("Failed to load menu data:", e);
      itemNameEl.textContent = "Error";
      itemDescriptionEl.textContent = "Could not load menu.json. Please ensure it's in the 'assets' folder and correctly formatted.";
    }
  };

  const createMenuUI = () => {
    menuData.forEach((item, index) => {
      const button = document.createElement('button');
      button.textContent = `Item ${index + 1}`; // Placeholder name
      button.onclick = () => showItem(index);
      menuItemsContainer.appendChild(button);

      // Fetch text to update button name
      fetch(`assets/${item.text}`)
        .then(response => response.text())
        .then(text => {
          const [name] = text.split('\n');
          button.textContent = name || `Item ${index + 1}`;
        });
    });
  };

  const showItem = async (index) => {
    const item = menuData[index];
    if (!item) return;

    // Remove previous model
    if (currentModel) {
      targetEntity.removeChild(currentModel);
      currentModel = null;
    }

    // Fetch and display text details
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

    // Create and add new model
    const modelEl = document.createElement('a-gltf-model');
    modelEl.setAttribute('src', `assets/${item.model}`);
    modelEl.setAttribute('position', '0 0.5 0');
    modelEl.setAttribute('scale', '0.1 0.1 0.1');
    modelEl.setAttribute('rotation', '0 0 0');
    modelEl.setAttribute('animation-mixer', ''); // if the model has animations
    targetEntity.appendChild(modelEl);
    currentModel = modelEl;
  };

  // Add a start button
  const startButton = document.createElement('button');
  startButton.textContent = 'Start AR';
  startButton.classList.add('start-button');
  startButton.onclick = () => {
    // In a test environment, we might not have a camera.
    // This allows us to bypass the AR start and test the UI.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') !== 'true') {
      sceneEl.systems['mindar-image'].start();
    }
    document.querySelector('.menu-overlay').style.display = 'flex';
    startButton.style.display = 'none';
  };
  document.body.appendChild(startButton);

  // Hide menu until AR starts
  document.querySelector('.menu-overlay').style.display = 'none';

  fetchMenuData();
});
