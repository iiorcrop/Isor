const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;
    
    // 1. Replace hardcoded localhost URLs
    // Pattern: 'http://localhost:5000/api...' or "http://localhost:5000/api..."
    content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
    content = content.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
    
    // 2. Replace relative API paths starting with /api/
    // We look for axios.get('/api/...') or axios.post("/api/...")
    // This is safer to do by looking for common patterns
    
    // Patterns for axios calls or generic strings starting with /api/
    // Pattern: '/api/...' -> `${import.meta.env.VITE_API_URL}/...`
    // We must avoid replacing things that are NOT API calls if possible, but in these projects, 
    // almost everything starting with /api/ is an API call.
    
    // Replace '/api/ with `${import.meta.env.VITE_API_URL}/
    content = content.replace(/'\/api\/([^']*)'/g, '`${import.meta.env.VITE_API_URL}/$1`');
    content = content.replace(/"\/api\/([^"]*)"/g, '`${import.meta.env.VITE_API_URL}/$1`');

    // 3. Fix potential double slashes if VITE_API_URL ends in /api and we add /$1
    // Actually, I'll check my .env. VITE_API_URL=http://localhost:5000/api (no trailing slash)
    // So /api/auth becomes [VITE_API_URL]/auth ? 
    // Wait, if VITE_API_URL is '.../api', then `${VITE_API_URL}/auth` is correct.
    
    // Wait, let's look at the replacement:
    // '/api/banner' -> `${import.meta.env.VITE_API_URL}/banner`
    // This is correct because VITE_API_URL is '.../api'.
    
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
