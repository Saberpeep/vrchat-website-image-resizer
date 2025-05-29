# VRChat Website Image Resizer

Browser extension to automatically resize images to be <= 2048px before before uploading to VRChat. 

This works by replacing the file picker (html input tag) with our own that first resizes the image using a canvas, and then passes that result to the original file input.

## Firefox

The Firefox extension will be published at [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/vrchat-image-resizer/).

### Installing Manually / Testing

1. Clone this repo
2. Open Firefox
3. Enter "[about:debugging](about:debugging)" in the URL bar
4. Click "This Firefox"
4. Expand "Temporary Extensions"
5. Click "Load Temporary Add-on"
6. Open the [extension's directory](/Extension/) and select any file inside the extension.

This will unfortunately unload once you close firefox, so the published version is recommended.

## Chromium

The Chromium extension is not published because I don't want the hassle.

### Installing Manually / Testing

1. Clone this repo
2. Open the Chromium browser of your choice
3. Enter [chrome://extensions/](chrome://extensions/) in the URL bar
4. Turn on "Developer Mode"
5. Click "Load Unpacked"
6. Select [manifest.json](/Extension/manifest.json)

Unlike Firefox this should stay active even after you close your browser. If it does not you can navigate back to [chrome://extensions/](chrome://extensions/) and toggle the extension back on. If you move the repo directory you will need to remove the extension and add it again using the steps above.
