const { app, BrowserWindow,ipcMain,Menu,Notification } = require('electron')
const settings = require('electron-settings');
const path = require('path')
const fs = require('fs')

const axios = require('axios')
const {print} = require('unix-print');

settings.set('printOnDemand', '1');
const {download} = require('electron-dl');

let settingsWindow;
let mainWindow;


function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 800,
    icon: path.join(__dirname, '/Logo.png'),
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  settingsWindow.loadFile('settings.html');
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

const NOTIFICATION_TITLE = 'Portugal Memories'
const NOTIFICATION_BODY = 'A Imprimir Fotografia'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

function showNotificationSucess () {
  new Notification({ title: "Portugal Memories", body: "Imprimido com Sucesso" }).show()
}


const createWindow = async () => {
  mainWindow = new BrowserWindow({
    webPreferences:{
      nodeIntegration:true,
    },
    fullscreen:true,
    autoHideMenuBar:true,
    icon: path.join(__dirname, '/Logo.png') 
  });
  //  mainWindow.maximize()

  //  mainWindow.webContents.openDevTools()
   mainWindow.loadURL('http://206.189.0.49:4002/pictureslist/?barcode=999123111')
   let enter = false;
  setInterval(async () => {
   const url = mainWindow.webContents.getURL()
    if(url.includes("sucessPictures")){
      if(!enter){
        const ids = decodeURIComponent(url.replace(`http://206.189.0.49:4002/sucessPictures/?ids=`,""))
        axios.defaults.headers.common.Authorization =
        'Bearer 7a6ad75415e78361db186110cac0541d0d4417117721ceb1e0d3baf0cfec4802cbbf6b441ffcfcfad59b636bb7b1002a5577317ca13190c1cbc89c43f636f1bcd67ae2649a888eb7d9593a8d911ffbe40f790ba1740e2c3742f88358c0d4b5ee5c06b20bd08096fc3904f64702ab078c2a04022e4704b6b1fc4257158a91465c';
       
        const result = await axios.get(
          `http://206.189.0.49:1337/api/fotos`
        );
  
        const images = result.data.data.filter(x=>ids.includes(x.id));
        enter = true
        let imagesPath =  []
        for (let index = 0; index < images.length; index++) {
          const element = images[index];
           const photosToPrint = await download(mainWindow, `http://206.189.0.49:4000/${element.attributes.Url}`)
           const imageSrc = photosToPrint.getSavePath()
           let win = null;
           win = new BrowserWindow({fullscreen:true, show: false });
           win.once('ready-to-show', () => win.hide())
           win.loadURL(imageSrc);
           win.webContents.on('did-finish-load', () => {
             win.webContents.print({
              silent: true,
              printBackground: true,
              landscape: true,
              marginsType: 1,
            });
           });
        }
      }
    }else{
      enter = false
    }
    
  }, 1000);
   mainWindow.webContents.getURL()
}
  
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        click: () => {
          if (!settingsWindow) {
            createSettingsWindow();
          }
        }
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];


app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

