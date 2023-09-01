const fs = require('fs');

// Read the .env file
fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading .env file:', err);
        return;
    }

    // Split the file content into lines
    const lines = data.split('\n');

    // Process each line and create formatted variables
    const formattedVariables = lines.map(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
            const name = parts[0].trim();
            if(name !== 'PORT'){
                const defaultValue = parts[1].trim().replace(/"/g, '\\"');
                return `          - name: ${name}\n            default: "${defaultValue}"`;
            }
        }
        return null;
    }).filter(Boolean); // Filter out null values

    // Read the existing Spacefile
    fs.readFile('Spacefile', 'utf8', (err, spacefileData) => {
        if (err) {
            console.error('Error reading Spacefile:', err);
            return;
        }

        // Find the whitespace at the beginning of the last line
        const lastLineIndentation = spacefileData.split('\n').reverse().find(line => line.trim() !== '').match(/^\s*/)[0];

        console.log("lastLineIndentation: ",lastLineIndentation.length);

        // Construct the Presets section with proper indentation
        const presetsSection = `${lastLineIndentation}presets:\n${lastLineIndentation}   env:\n${formattedVariables.join('\n')}`;

        // Insert the Presets section
        const updatedSpacefile = spacefileData + `\n${presetsSection}`;

        // Write the updated content back to the Spacefile
        fs.writeFile('Spacefile', updatedSpacefile, 'utf8', err => {
            if (err) {
                console.error('Error writing to Spacefile:', err);
            } else {
                console.log('Formatted variables added to Spacefile successfully.');
            }
        });
    });
});
