# WebAR Restaurant Menu

Welcome to your new Augmented Reality restaurant menu! This project allows you to showcase your dishes as interactive 3D models in AR, right on your customers' phones.

This guide will walk you through setting up and customizing your menu. No coding experience is required!

## How to Run & Test

You will need to run a local web server to view the application.

### For Desktop/Laptop Testing

This is useful for quickly checking the UI and menu functionality (but not the AR camera).

1.  Open a terminal in this project folder.
2.  Run the command: `python -m http.server 8000`
3.  Open your browser and go to `http://localhost:8000`.

### For Mobile AR Testing (Required)

To use the camera for Augmented Reality, you **must** access the website via a secure `https://` connection. Mobile browsers will not allow camera access over an insecure `http://` connection.

The easiest way to do this is using a free tool called **ngrok**, which creates a secure public URL for your local server.

**Step-by-step guide:**

1.  **Download ngrok:** Go to the [ngrok website](https://ngrok.com/download) and download the version for your operating system. Unzip the file.

2.  **Start your local server:** In a terminal window, start the basic server from the project folder:
    ```bash
    python -m http.server 8000
    ```

3.  **Start ngrok:** Open a **new, separate terminal window**. Navigate to where you unzipped ngrok and run the following command to create a secure tunnel to your local server:
    ```bash
    ./ngrok http 8000
    ```

4.  **Get your secure URL:** Ngrok will display a "Forwarding" URL that looks something like `https://<random-characters>.ngrok-free.app`. This is your temporary, secure public URL.

5.  **Test on your phone:** Open the camera on your mobile phone and scan the QR code that ngrok displays in the terminal, or simply type the `https://` URL into your mobile browser. The AR experience should now work correctly!

### Viewing the AR Experience

1.  After a brief loading screen, the menu will appear, and the camera will start automatically.
2.  You can **swipe left or right** to browse through the different menu items.
3.  Point your phone's camera at the default image target below to see the 3D model appear.
4.  Click the "Start AR" button to hide the menu UI for a clear view.

**Default Image Target (T-Rex):**

![Default Marker Image](https://raw.githack.com/AR-js-org/AR.js/master/aframe/examples/image-tracking/nft/trex/trex-image-big.jpeg)

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

You can use your own image as the AR marker (e.g., your restaurant's logo or a picture from your menu). AR.js uses a different marker system than the previous version.

1.  **Choose a good marker image:** A good marker has lots of unique detail. Avoid blurry images or simple geometric patterns. A regular, colorful photograph works well.
2.  **Generate your marker files:** Go to the official **[AR.js NFT Marker Creator](https://ar-js-org.github.io/NFT-Marker-Creator/)**.
3.  Upload your image. The tool will generate and download **three** files (e.g., `mymarker.fset`, `mymarker.iset`, `mymarker.fset3`).
4.  **Add the files to your project:** Place all three new files into the `assets` folder.
5.  **Update the project to use your marker:** Open `index.html` with a text editor and find the `<a-nft>` tag. Change the `url` property to point to the **base name** of your new files (without the extension).

    *Change this:*
    ```html
    <a-nft url="https://arjs-cors-proxy.herokuapp.com/.../trex" ...>
    ```
    *To this:*
    ```html
    <a-nft url="assets/mymarker" ...>
    ```

And that's it! You now have a fully customized AR menu.








