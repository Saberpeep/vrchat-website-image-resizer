(() => {

    const modalSelector = ".modal.show .modal-body div";
    const uploadPagePath = "/home/uploadPhoto";
    const uploadPageSelector = `#app .home-content`;
    const markerClass = "lackofbindings";
    let container, origInput, newInput;
    const dataUrls = [];

    function imageLoadUrlAsync(img, url)
    {
        return new Promise((resolve, reject)=>{
            img.addEventListener("load", evt=>{
                resolve(evt);
            });
            img.addEventListener("error", evt=>{
                reject(evt);
            });
            img.src = url;
        })
    }

    function canvasToBlobAsync(canvas)
    {
        return new Promise((resolve, reject)=>{
            try {
                canvas.toBlob(blob=>{
                    if(!blob) return reject(blob);
                    return resolve(blob);
                })
            } catch (error) {
                return reject(error);
            }
        })
    }

    function fileReaderLoadAsDataUrlAsync(file)
    {
        return new Promise((resolve, reject)=>{
            let reader = new FileReader();
            reader.addEventListener("load", ()=>{
                resolve(reader.result);
            });
            reader.addEventListener("error", error=>{
                reject(error);
            });
            reader.readAsDataURL(file);
        });
    }

    async function resizeImage(dataUrl)
    {
        try {
            var img = new Image();

            await imageLoadUrlAsync(img, dataUrl);

            // Resizing code based on https://stackoverflow.com/a/39637827
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext("2d"),
                oc = document.createElement('canvas'),
                octx = oc.getContext('2d');

            // Exit early if no need
            if(Math.max(img.height, img.width) <= 2048)
            {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                return await canvasToBlobAsync(canvas);
            }

            // determine output resolution
            let newWidth, newHeight;
            if (img.width > img.height) 
                {
                newWidth = 2048;
                newHeight = 2048 * img.height / img.width;
            } else {
                newHeight = 2048;
                newWidth = 2048 * img.width / img.height;
            }

            canvas.width = newWidth; // destination canvas size
            canvas.height = newHeight;

            var cur = {
                width: Math.floor(img.width * 0.5),
                height: Math.floor(img.height * 0.5)
            }

            oc.width = cur.width;
            oc.height = cur.height;

            octx.drawImage(img, 0, 0, cur.width, cur.height);

            // loop multiple times to approximate bicubic sampling
            while (cur.width * 0.5 > newWidth) {
                cur = {
                    width: Math.floor(cur.width * 0.5),
                    height: Math.floor(cur.height * 0.5)
                };
                octx.clearRect(0, 0, canvas.width, canvas.height);
                octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
            }

            ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);

            return await canvasToBlobAsync(canvas);

        } catch (error) {
            throw error;
        }
    }

    async function onNewInputChange(evt)
    {
        try {
            if(evt.target.files.length < 1) return;
            let newInputFile = evt.target.files[0];
            let dataUrl = await fileReaderLoadAsDataUrlAsync(newInputFile);
            dataUrls.push(dataUrl);
            let resizedBlob = await resizeImage(dataUrl);
            let newOutputFile = new File([resizedBlob], newInputFile.name, {type: newInputFile.type, lastModified: newInputFile.lastModified});
            let container = new DataTransfer();
            container.items.add(newOutputFile);
            origInput.files = container.files;
            origInput.dispatchEvent(new Event('change', { 'bubbles': true }))
    
            // ev.target.value = '';
        } catch (error) {
            throw error;
        }
    }

    function tryAddButton()
    {
        try {
            // Look for input on upload modal
            container = document.querySelector(modalSelector);
            if(!container && new URL(document.URL).pathname.startsWith(uploadPagePath))
            {
                // If on upload page, look for input on main page
                container = document.querySelector(uploadPageSelector);
                console.log("On Upload Page, container:", container);
            }
            if(!container) return;
    
            origInput = container.querySelector(`input[type="file"]:not(.${markerClass})`);
            if(!origInput) return;
            origInput.style.setProperty("display", "none");
    
            newInput = container.querySelector(`input.${markerClass}`);
            if(newInput) return;
            newInput = document.createElement("input");
            newInput.type = "file";
            newInput.accept = ".png,.jpg,.jpeg";
            newInput.classList.add(markerClass);
            newInput.addEventListener("change", onNewInputChange);
            // modal.appendChild(newInput);
            origInput.parentNode.insertBefore(newInput, origInput.nextSibling);
            
        } catch (error) {
            cleanUp();
            throw error;
        }
    }

    function cleanUp()
    {
        try {
            if(newInput)
            {
                newInput.remove();
                newInput = null;
            }
            if(origInput)
            {
                origInput.style.removeProperty("display");
                origInput = null;
            }
            while(dataUrls.length)
            {
                URL.revokeObjectURL(dataUrls.pop());
            }
        } catch (error) {
            console.error("During Cleanup:", error);
        }
    }

    function doPageModify()
    {
        let cropPreview = document.querySelector("img.reactEasyCrop_Image");
        if(cropPreview){
            cleanUp();
        }else{
            tryAddButton();
        }
    }


    // Immediately modify page.
    // Also set up an observer to re-modify page every time page elements change.
    const observer = new MutationObserver((mutationList, observer) => doPageModify());
    observer.observe(document.body, { childList: true, subtree: true, attributes: false });
    doPageModify();

})();