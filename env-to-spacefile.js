const fs = require('fs');

// Read the .env file
fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading .env file:', err);
        return;
    }

    // Split the file content into lines
    const lines = data.split('\n');

    // Process each line
    const formattedVariables = lines.map(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const defaultValue = parts[1].trim().replace(/"/g, '\\"');
            return `- name: ${name}\n   default: "${defaultValue}"`;
        }
        return null;
    }).filter(Boolean); // Filter out null values

    // Output the formatted variables
    console.log(formattedVariables.join('\n\n'));
});
