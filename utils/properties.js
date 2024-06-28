// utils/properties.js

// Function to parse server.properties into an object
function parseProperties(propertiesString) {
    const properties = {};
    propertiesString.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            properties[key.trim()] = value ? value.trim() : '';
        }
    });
    return properties;
}

// Function to stringify properties object back into server.properties format
function stringifyProperties(propertiesObject) {
    let propertiesString = '';
    Object.keys(propertiesObject).forEach(key => {
        const value = propertiesObject[key];
        propertiesString += `${key}=${value}\n`;
    });
    return propertiesString;
}

module.exports = { parseProperties, stringifyProperties };


