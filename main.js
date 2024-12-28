const {app, BrowserWindow, Menu, shell, ipcMain}= require("electron");
const { spawn } = require('child_process');
const path = require("path");

const menuItems = [
  {
    label: "Menu",
    submenu: [
      {
      label: "About",
      }
    ]
  },
  {
    label: "File",
    submenu: [
      {
      label: "Learn More",
      click: async () => {
        await shell.openExternal('https://youtube.com/');
      }
      },
      {
        type: "separator",
      },
      {
        label: "Exit",
        click: () => (app.quit()),
      }
    ]
  },
  {
    label: "Window",
    submenu:[
      {
        role: "Minimize",
      },
      {
        role: "Close",
      },
      {
        label: "New Window",
        click: async  () => {
          const win2 = new BrowserWindow({
            width: 600,
            height: 400,
          });
          win2.loadFile("index2.html");
        }
      },
      {
        label: "Open Git",
        click: async  () => {
          // await shell.openExternal('https://github.com/');
          const win2 = new BrowserWindow({
            width: 600,
            height: 400,
            show: false,
            backgroundColor: "red",
            // movable: false,
          });
          win2.loadURL("https://github.com/");
          win2.once("ready-to-show", () => win2.show());
        }
      }
    ]
  },
  {
    label: "Camera",
    submenu: [
      {
        label: "Open Camera",
        click: async () => {
          const win2 = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
              preload: path.join(__dirname, 'cameraPreload.js')
            }
          });


          // for closing camera window
          ipcMain.on("close-Window-2", () => {
            win2.close();
          })



          // win2.webContents.openDevTools();
          win2.loadFile("camera.html");
        }
      }
    ]
  }

];

const menu = Menu.buildFromTemplate(menuItems);
Menu.setApplicationMenu(menu);


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });


    // here we define ipc main
   ipcMain.on("set-image", (event, data) => {
    win.webContents.send("get-image", data);
    console.log(data)
  })

  
    // win.webContents.openDevTools();
    win.loadFile("index.html");

    win.on('close', (event) => {
      // Prevent window from closing if you want to minimize instead
      event.preventDefault();
      win.hide(); // Minimize to system tray
    });
}

app.whenReady().then(() => {

  serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    detached: true,
  });
  serverProcess.unref();



  createWindow();




  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on('will-quit', () => {
  // Kill the server process when the app is quitting
  if (serverProcess) {
    serverProcess.kill();
  }
});