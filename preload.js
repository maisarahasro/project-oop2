const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    name: "Solah Tracker", 
    createNote: (data) => ipcRenderer.invoke('create-file', data),
    readFile: (name) => ipcRenderer.invoke('read-file', name),
    deleteFile: (name) => ipcRenderer.invoke('delete-file', name)
});
