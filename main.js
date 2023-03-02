var { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron")
var path = require("path")

const { spawn } = require('child_process');
function runExeAndGetBattery() {
  const exeProg = spawn('./main.exe');

  exeProg.stdout.on('data', function(data) {
    const output = data.toString();
    const status_charging = output.split("|");
    const percent_bettery = output.split("|");
    status_mouse = status_charging[0];
    percent_bettery_mouse = percent_bettery[1];

    if (percent_bettery_mouse >= 0 && percent_bettery_mouse <= 100) {
      headphonesData = percent_bettery_mouse;
      console.log(status_mouse)
      if(status_mouse = 'Charging') {
        console.log('Batterycharg')
        imagePathPrefix = 'Batterycharg';
      }else if(status_mouse = 'Discharging') {
        imagePathPrefix = 'Battery';
      } 
    } else {
      console.log("Battery percentage is outside the valid range of 0-100.");
    }
    // callback(status_mouse, percent_bettery_mouse);
  });

  // Handle any errors that occur during the process
  exeProg.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  // When the process exits, log the percent_battery list to the console
  exeProg.on('exit', function(code) {
    // Do something with the output variables (status_mouse and percent_bettery_mouse)
  });
}

let win, tray
async function init() {
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { label: 'Quit', click: () => {
      app.isQuiting = true
      app.quit()
    }},
  ])
  tray = new Tray(path.join(__dirname, "icons/disconnect.png"))
  tray.setToolTip('Prime Mouse Battery.')
  tray.setContextMenu(contextMenu)

  win = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js")
    }
  })
  win.hide()
  win.setMenu(null)
  win.loadFile(path.join(__dirname, "index.html"))
  win.on('minimize', e => {
    e.preventDefault()
    win.hide()
  })

  ipcMain.on("get-battery", () => {  
    runExeAndGetBattery()
    try { headphonesData} 
    catch (e) { return }
    console.log(imagePathPrefix)
    if(headphonesData > 75 && headphonesData < 100) {
      tray.setImage(path.join(__dirname, `icons/${imagePathPrefix}_100.png`));
    } else if(headphonesData > 50 && headphonesData <= 75) {
      tray.setImage(path.join(__dirname, `icons/${imagePathPrefix}_75.png`));
    } else if(headphonesData > 25 && headphonesData <= 50) {
      tray.setImage(path.join(__dirname, `icons/${imagePathPrefix}_50.png`));
    } else if(headphonesData > 0 && headphonesData <= 25) {
      tray.setImage(path.join(__dirname, `icons/${imagePathPrefix}_25.png`));
    }
    
    win.webContents.send("send-battery", JSON.stringify(headphonesData));

  })
}

app.on("ready", init)