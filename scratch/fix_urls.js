const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Fix the broken replacement from previous attempt: '$/'
    // But be careful not to replace it if it's already part of a template literal
    // Actually, I'll just look for '$/'
    let newContent = content.replace(/\'\$\/\'/g, "`${import.meta.env.VITE_API_URL}`"); // handle single quotes
    newContent = newContent.replace(/\'\$\//g, "`${import.meta.env.VITE_API_URL}/"); // handle prefix in single quotes
    
    // Replace original hardcoded URLs
    newContent = newContent.replace(/http:\/\/localhost:5000\/api/g, "${import.meta.env.VITE_API_URL}");
    
    // After replacing 'http://localhost:5000/api' with '${import.meta.env.VITE_API_URL}',
    // we need to make sure the enclosing quotes are backticks.
    
    // Regex to find '...${import.meta.env.VITE_API_URL}...' and change quotes to backticks
    // This is hard to do perfectly with regex, so I'll do a few common patterns.
    newContent = newContent.replace(/\'(\$\{import\.meta\.env\.VITE_API_URL\}[^\']*)\'/g, "`$1`");
    
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
