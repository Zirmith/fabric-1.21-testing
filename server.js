const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path to your Minecraft server .jar file
const serverJar = 'fabric-server-mc.1.21-loader.0.15.11-launcher.1.0.1.jar';

// Optional: specify the initial memory allocation for the JVM
const minMemory = '1G';
const maxMemory = '2G';

let serverProcess;
let serverName = 'My Minecraft Server';
let serverDescription = 'A cool Minecraft server';
let serverLog = '';

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get server log
app.get('/log', (req, res) => {
    res.send(serverLog);
});

// Endpoint to update server name and description
app.post('/update', (req, res) => {
    const { name, description } = req.body;

    if (name) serverName = name;
    if (description) serverDescription = description;

    res.redirect('/');
});

// Endpoint to send a command to the server
app.post('/command', (req, res) => {
    const { command } = req.body;
    if (!serverProcess) {
        return res.send('Server is not running');
    }

    serverProcess.stdin.write(command + '\n');
    res.send('Command sent');
});

// Endpoint to read server.properties
app.get('/properties', async (req, res) => {
    try {
        const propertiesData = await fs.readFile('server.properties', 'utf8');
        res.send(propertiesData);
    } catch (err) {
        console.error('Error reading server.properties:', err);
        res.status(500).send('Error reading server properties');
    }
});

const { parseProperties, stringifyProperties } = require('./utils/properties'); // Assuming you have utility functions for parsing and stringifying properties


// Endpoint to update server.properties
app.post('/updateProperties', async (req, res) => {
    const { properties } = req.body;

    try {
        // Read the current server.properties file
        const filePath = path.join(__dirname, 'server.properties');
        const currentProperties = await fs.readFile(filePath, 'utf8');

        // Parse the current properties
        const parsedProperties = parseProperties(currentProperties);

        // Update the parsed properties with new values from the client
        properties.forEach(({ key, value }) => {
            console.log(key, value);
            // Update property if it exists in the parsed properties
            if (parsedProperties.hasOwnProperty(key)) {
                parsedProperties[key] = value;
            }
        });

        // Stringify the updated properties
        const updatedProperties = stringifyProperties(parsedProperties);
        console.log(updatedProperties);

        // Write the updated properties back to the file
        await fs.writeFile(filePath, updatedProperties);

        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating server.properties:', err);
        res.status(500).send('Error updating server properties');
    }
});

// Endpoint to start Minecraft server
app.get('/start', (req, res) => {
    if (serverProcess) {
        return res.send('Server is already running');
    }

    const javaArgs = [
        `-Xms${minMemory}`,
        `-Xmx${maxMemory}`,
        '-jar',
        path.resolve(__dirname, serverJar),
        'nogui'
    ];

    serverProcess = spawn('java', javaArgs);

    serverProcess.stdout.on('data', (data) => {
        serverLog += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
        serverLog += data.toString();
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null;
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
        serverProcess = null;
    });

    res.redirect('/');
});

// Endpoint to stop Minecraft server
app.get('/stop', (req, res) => {
    if (!serverProcess) {
        return res.send('Server is not running');
    }
    serverLog = " "
    serverProcess.kill('SIGTERM');
    serverProcess = null;
   
    res.redirect('/');
});

// Endpoint to check server status
app.get('/status', (req, res) => {
    if (serverProcess) {
        res.send('Minecraft server is running');
    } else {
        res.send('Minecraft server is stopped');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Minecraft server manager app listening at http://localhost:${port}`);
});
