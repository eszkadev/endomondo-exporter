require('cross-fetch/polyfill');
const fs = require('fs');
const { Api } = require('endomondo-api-handler');
const { app, ipcMain, BrowserWindow } = require('electron');
const { DateTime } = require('luxon');

const api = new Api();
const dir = 'workouts'

function createWindow () {
    const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true
    }
    })

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

ipcMain.on('perform-action', (event, args) => {
    if (!args || !args.action)
        return;

    switch (args.action)
    {
        case 'login':
            api.login(args.login, args.password).then(() => {
                event.reply('asynchronous-reply', {action: 'login_success'})
            }).catch((error) => {
                console.log(error);
                event.reply('asynchronous-reply', {action: 'error'})
            });
            break;

        case 'download':
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            const filter = {};// if needed: {after: DateTime.fromObject({year: 2020, month: 10, day: 25})};
            api.processWorkouts(filter, async (workout) => {
                if (workout.hasGPSData()) {
                    event.reply('asynchronous-reply', {action: 'workout_downloaded'})
                    fs.writeFileSync(`./${dir}/${workout.getId()}.gpx`, await api.getWorkoutGpx(workout.getId()), 'utf8');
                }
            }).catch((error) => {
                console.log(error);
                event.reply('asynchronous-reply', {action: 'error'})
            });
            break;
    }
})
