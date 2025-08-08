# WebAR Restaurant Menu

Welcome to your new Augmented Reality restaurant menu! This project allows you to showcase your dishes as interactive 3D models in AR, right on your customers' phones.

This guide will walk you through setting up and customizing your menu. No coding experience is required!

## How to Use the AR Menu

To see your AR menu in action, you'll need to run a simple local web server from this folder. This is because modern web browsers have security rules that prevent websites from loading files directly from your computer.

### Quick Start with a Local Server

The easiest way to run a local server is using Python. If you have Python installed, follow these steps:

1.  Open a terminal or command prompt in this project folder.
2.  Run the following command:
    ```bash
    # For Python 3
    python -m http.server
    ```
3.  Open your web browser and go to `http://localhost:8000`.
4.  On your phone, connect to the same Wi-Fi network as your computer and access the same address.

### Viewing the AR Experience

1.  Once the page is loaded, you'll see a "Start AR" button. Click it to begin.
2.  Point your phone's camera at the image target below. You can print this image out and place it on your tables.

**Default Image Target:**

![Default Marker Image](https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png)

## Customizing Your Menu

All your menu content is stored in the `assets` folder. Customizing the menu is as simple as editing files in this folder.

### Folder Structure

Inside the `assets` folder, you'll find:
-   `menu.json`: A list of all your menu items.
-   `.glb`, `.obj` files: These are your 3D models. We recommend using `.glb` for best performance.
-   `.mtl` files: Optional material files for `.obj` models.
-   `.txt` files: These hold the name and description for each dish (e.g., `burger.txt`).

### How to Add a New Dish

Let's say you want to add a new "Taco" dish.

1.  **Add your 3D model:** Place your `taco.glb` (or `taco.obj`) file into the `assets` folder.
    -   **For `.obj` models:** If you have a material file, add the corresponding `.mtl` file to the `assets` folder as well (e.g., `taco.mtl`). The app will automatically find and use it.
2.  **Add your description:** Create a new text file named `taco.txt` in the `assets` folder. The first line of this file is the dish name, and the rest is the description.
    ```
    Delicious Taco
    A crispy taco shell filled with seasoned beef, cheese, and fresh salsa.
    ```
3.  **Update `menu.json`:** Open `assets/menu.json` with a text editor and add a new entry for your taco.

    *Before:*
    ```json
    [
      { "model": "burger.glb", "text": "burger.txt" },
      { "model": "pizza.glb", "text": "pizza.txt" }
    ]
    ```

    *After:*
    ```json
    [
      { "model": "burger.glb", "text": "burger.txt" },
      { "model": "pizza.glb", "text": "pizza.txt" },
      { "model": "taco.glb", "text": "taco.txt" }
    ]
    ```
    **Important:** Notice the comma (`,`) after the pizza entry!

### How to Modify or Remove a Dish

-   **To change a dish's name or description:** Simply edit its `.txt` file.
-   **To change a dish's 3D model:** Replace the `.glb` file in the `assets` folder with a new one (make sure the filename is the same).
-   **To remove a dish:** Open `menu.json` and delete its entry. Remember to remove the comma from the previous item.

## Using a Custom Image Target

You can use your own image as the AR marker (e.g., your restaurant's logo or a picture from your menu).

1.  **Choose a good marker image:** A good marker has sharp corners, high contrast, and lots of unique detail. Avoid blurry or repetitive patterns.
2.  **Compile your marker:** Go to the official **[MindAR Image Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)**.
3.  Upload your image. The tool will give you a `.mind` file. Download it.
4.  **Add the file to your project:** Place the new `.mind` file (e.g., `mymarker.mind`) into the `assets` folder.
5.  **Update the project to use your marker:** Open `index.html` with a text editor and find this line:
    ```html
    <a-scene mindar-image="imageTargetSrc: https://.../card.mind; ...">
    ```
    Change the `imageTargetSrc` to point to your new file:
    ```html
    <a-scene mindar-image="imageTargetSrc: assets/mymarker.mind; ...">
    ```

And that's it! You now have a fully customized AR menu.
