async function fetchLog() {
    try {
        const response = await fetch('/log');
        if (!response.ok) {
            throw new Error('Failed to fetch log');
        }
        const log = await response.text();
        const consoleOutput = document.getElementById('consoleOutput');
        if (consoleOutput) {
            consoleOutput.innerText = log;
        } else {
            console.error('Element with id "consoleOutput" not found');
        }
    } catch (error) {
        console.error('Error fetching log:', error);
    }
}

async function updateServer(name, description) {
    try {
        const response = await fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
            throw new Error('Failed to update server information');
        }

        const serverNameElement = document.getElementById('serverName');
        const serverDescriptionElement = document.getElementById('serverDescription');

        if (serverNameElement) {
            serverNameElement.innerText = name;
        }

        if (serverDescriptionElement) {
            serverDescriptionElement.innerText = description;
        }
    } catch (error) {
        console.error('Error updating server information:', error);
        alert('Failed to update server information');
    }
}

async function sendCommand(command) {
    try {
        const response = await fetch('/command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command }),
        });

        if (!response.ok) {
            throw new Error('Failed to send command');
        }

        fetchLog();
    } catch (error) {
        console.error('Error sending command:', error);
        alert('Failed to send command');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLog();
    setInterval(fetchLog, 2000); // Fetch log every 2 seconds

    document.getElementById('startButton').addEventListener('click', async () => {
        await fetch('/start');
        fetchLog();
    });

    document.getElementById('stopButton').addEventListener('click', async () => {
        await fetch('/stop');
        const consoleOutput = document.getElementById('consoleOutput');
        consoleOutput.innerText = ""
        fetchLog();
    });

    document.getElementById('statusButton').addEventListener('click', async () => {
        const response = await fetch('/status');
        if (!response.ok) {
            throw new Error('Failed to fetch server status');
        }
        const status = await response.text();
        alert(status);
    });

    document.getElementById('updateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value;
        const description = document.getElementById('descriptionInput').value;
        await updateServer(name, description);
    });

    document.getElementById('commandForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const command = document.getElementById('commandInput').value;
        await sendCommand(command);
        document.getElementById('commandInput').value = '';
    });
});