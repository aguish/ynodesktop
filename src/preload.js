import { contextBridge, ipcRenderer, webFrame } from 'electron';

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
});

ipcRenderer.on("zoomin" , () => {
  webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
});

ipcRenderer.on("zoomout" , () => {
  webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
}); 

ipcRenderer.on('log-app-version', (event, version) => {
  console.log(`------------------------------`);
  console.log(`ynodesktop version: ${version}`);
  console.log(`------------------------------`);
});