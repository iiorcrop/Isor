const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;
    
    // 1. Replace hardcoded localhost URLs in any type of quotes (', ", `)
    content = content.replace(/['"`]http:\/\/localhost:5000\/api([^'"`]*)['"`]/g, '`${import.meta.env.VITE_API_URL}$1`');
    
    // 2. Replace relative API paths starting with /api/ in any type of quotes
    // Pattern: '/api/...' or "/api/..." or `/api/...`
    content = content.replace(/['"`]\/api\/([^'"`]*)['"`]/g, '`${import.meta.env.VITE_API_URL}/$1`');

    // 4. Special case fix: some files might have double backticks or nested template literals now
    // Example: ``${import.meta.env.VITE_API_URL}/...`` 
    content = content.replace(/``\$\{import\.meta\.env\.VITE_API_URL\}([^`]*)``/g, '`${import.meta.env.VITE_API_URL}$1`');

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function processDir(directory) {
    if (!fs.existsSync(directory)) return;
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
