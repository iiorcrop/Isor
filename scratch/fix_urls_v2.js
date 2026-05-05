const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Pattern 1: axios.post('`${import.meta.env.VITE_API_URL}/auth/login', ...) -> axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, ...)
    // Pattern 2: axios.get('`${import.meta.env.VITE_API_URL}', ...) -> axios.get(`${import.meta.env.VITE_API_URL}`, ...)
    
    let newContent = content.replace(/\'`\$\{import\.meta\.env\.VITE_API_URL\}([^\']*)' /g, "`\${import.meta.env.VITE_API_URL}$1` "); // with space
    newContent = newContent.replace(/\'`\$\{import\.meta\.env\.VITE_API_URL\}([^\']*)'\)/g, "`\${import.meta.env.VITE_API_URL}$1`)"); // closing paren
    newContent = newContent.replace(/\'`\$\{import\.meta\.env\.VITE_API_URL\}([^\']*)',/g, "`\${import.meta.env.VITE_API_URL}$1`,"); // comma
    
    // Also fix cases where it might be `$...` (from previous broken replacement)
    // Actually, looking at AuthContext.jsx: res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login', { email, password });
    // It seems my previous script did: newContent = newContent.replace(/\'\$\//g, "`${import.meta.env.VITE_API_URL}/");
    // So it replaced '$/ with `${import.meta.env.VITE_API_URL}/ but kept the original ending quote '.
    
    newContent = newContent.replace(/\`\$\{import\.meta\.env\.VITE_API_URL\}([^\']*)\'/g, "`\${import.meta.env.VITE_API_URL}$1` ");
    // Wait, the above is still risky.
    
    // Let's just do a very targeted fix for the broken lines.
    // Replace: `${import.meta.env.VITE_API_URL}(anything except quote)'
    // with: `${import.meta.env.VITE_API_URL}(anything except quote)`
    newContent = newContent.replace(/(\`\$\{import\.meta\.env\.VITE_API_URL\}[^\']*)\'/g, "$1` ");

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
