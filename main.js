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

    // Create and add new model based on file extension
    const modelSrc = `assets/${item.model}`;
    const fileExtension = item.model.split('.').pop().toLowerCase();

    let modelEl;

    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      modelEl = document.createElement('a-gltf-model');
      modelEl.setAttribute('src', modelSrc);
    } else if (fileExtension === 'obj') {
      modelEl = document.createElement('a-obj-model');
      modelEl.setAttribute('src', modelSrc);
      // Convention: Look for an .mtl file with the same name for materials
      const mtlSrc = modelSrc.replace(/\.obj$/, '.mtl');
      modelEl.setAttribute('mtl', mtlSrc);
    } else {
      console.error(`Unsupported model format: .${fileExtension}`);
      itemNameEl.textContent = "Error";
      itemDescriptionEl.textContent = `Unsupported model format: .${fileExtension}. Please use .glb, .gltf, or .obj.`;
      return;
    }

    modelEl.setAttribute('position', '0 0.5 0');
    modelEl.setAttribute('scale', '0.1 0.1 0.1');
    modelEl.setAttribute('rotation', '0 0 0');

    // glTF models can have animations, but other formats usually don't via this component
    if (fileExtension === 'glb' || fileExtension === 'gltf') {
      modelEl.setAttribute('animation-mixer', '');
    }

    targetEntity.appendChild(modelEl);
    currentModel = modelEl;
  };

  // Add a start button
  const startButton = document.createElement('button');
  startButton.textContent = 'Start AR';
  startButton.classList.add('start-button');
  startButton.onclick = () => {
    // Show the menu UI immediately for a responsive feel.
    document.querySelector('.menu-overlay').style.display = 'flex';
    startButton.style.display = 'none';

    // Then, try to start the AR system.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') !== 'true') {
      sceneEl.systems['mindar-image'].start().catch(error => {
        // Handle cases where camera access is denied or fails.
        console.error("MindAR starting failed:", error);
        const details = document.getElementById('item-details');
        details.innerHTML = `<p style="color: red;">Could not start AR camera. Please check camera permissions and refresh the page.</p>`;
      });
    }
  };
  document.body.appendChild(startButton);

  // Hide menu until AR starts
  document.querySelector('.menu-overlay').style.display = 'none';

  fetchMenuData();
});
