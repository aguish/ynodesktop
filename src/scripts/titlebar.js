export default function (win) {
  win.webContents
    .executeJavaScript(
      `
        function checkForTitleBar() {
            if (document.querySelector('#ynod-titlebar')) {
                return true;
            }
            return false;
        }
        checkForTitleBar();
    `
    )
    .then((hasTitleBar) => {
      if (!hasTitleBar) {
        createTitleBar();
      }
    });

  function createTitleBar() {
    win.webContents.executeJavaScript(`
        document.body.insertAdjacentHTML('afterBegin', \`

        <div id="ynod-titlebar">
            <div id="ynod-titlebar-drag">
                <span id="ynod-titlebar-title">Yume Nikki Online Project</span>
            </div>
            <div id="ynod-titlebar-buttons">
                <div id="ynod-titlebar-minimize" class="ynod-titlebar-button" onclick="window.electronAPI.minimize()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-dash-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
                    </svg>
                </div>
                <div id="ynod-titlebar-maximize" class="ynod-titlebar-button" onclick="window.electronAPI.maximize()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-dash-square" viewBox="0 0 16 16">
                        <path d="M3 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/>
                        <path d="M.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H.5ZM1 5V2h14v3H1Zm0 1h14v8H1V6Z"/>
                    </svg>
                </div>
                <div id="ynod-titlebar-close" class="ynod-titlebar-button" onclick="window.close()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(194, 146, 200, 1)" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                </div>
            </div>
        </div>
        
        <style>
            #ynod-titlebar {
                position: sticky;
                top: 0;
                left: 0;
                width: 100%;
                height: 30px;
                background-color: #000000;
                z-index: 9999;
                display: flex;
                flex-direction: row;
            }
            #ynod-titlebar-drag {
                flex-grow: 1;
                display: flex;
                align-items: center;
                -webkit-app-region: drag;
            }
            #ynod-titlebar-buttons {
                display: flex;
                flex-direction: row;
            }
            .ynod-titlebar-button {
                width: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .ynod-titlebar-button:hover {
                background-color: #333333;
            }
            #ynod-titlebar-title {
                font-size: 14px;
                padding-left: 10px;
                color: rgba(194, 146, 200, 1);
            }
            body::-webkit-scrollbar {
                display: none;
            }  
        </style>

        \`)
        `);

    win.webContents.executeJavaScript(`
            function updateTitle() {
                document.querySelector('#content')?.scrollTo(0,0)
                if (document.title != "YNOproject" && document.title.includes("YNOproject")) {
                    if (document.querySelector('div.notice.version')) {
                        document.getElementById("ynod-titlebar-title").innerHTML = document.querySelector('div.notice.version').innerText;
                    } else {
                        document.getElementById("ynod-titlebar-title").innerHTML = document.title.split(" - ")[0];
                    }
                }
            }
            updateTitle();
            setInterval(updateTitle, 1000);
        `);
  }
};
