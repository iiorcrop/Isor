const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Replace single quoted URLs
    let newContent = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL}$1` ");
    // Replace double quoted URLs
    newContent = newContent.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, "`${import.meta.env.VITE_API_URL}$1` ");
    
    // Note: I added a space after the closing backtick in the replacement to avoid some issues, 
    // but maybe I shouldn't. Let's remove it for now to be exact.
    newContent = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL}$1` ");
    newContent = newContent.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, "`${import.meta.env.VITE_API_URL}$1` ");
    
    // Actually, let's remove that extra space.
    newContent = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL}$1` ");
    // Wait, I'll just use the most direct version.
    newContent = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, (match, p1) => `\${import.meta.env.VITE_API_URL}\${p1}\``);
    // Wait, JS string literals in JS...
    
    // Let's use this:
    const regex1 = /'http:\/\/localhost:5000\/api([^']*)'/g;
    newContent = content.replace(regex1, '`${import.meta.env.VITE_API_URL}$1`');
    
    const regex2 = /"http:\/\/localhost:5000\/api([^"]*)"/g;
    newContent = newContent.replace(regex2, '`${import.meta.env.VITE_API_URL}$1`');

    if (content !== newContent) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

processDir('admin-dashboard/src');
processDir('frontend/src');
