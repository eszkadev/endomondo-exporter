const { ipcRenderer } = require('electron')

window.onload = function() {
    document.getElementById('login_button').onclick = function() {
        document.getElementById('error').style.display = 'none';

        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        ipcRenderer.send('perform-action', {action: 'login', login: login, password: password});
    }
    
    document.getElementById('download_button').onclick = function() {
        document.getElementById('spinner').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('counter').innerText = 0;

        ipcRenderer.send('perform-action', {action: 'download'});
    }
}

ipcRenderer.on('asynchronous-reply', (event, args) => {
    if (!args || !args.action)
        return;

    switch (args.action) {
        case 'login_success':
            document.getElementById('download_button').disabled = false;
            document.getElementById('error').style.display = 'none';
            break;

        case 'error':
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            break;

        case 'workout_downloaded':
            document.getElementById('upload_button').disabled = false;
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('error').style.display = 'none';

            const count = parseInt(document.getElementById('counter').innerText);
            document.getElementById('counter').innerText = count+1;
            break;
    }
})