export const getServerUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Remove the /api suffix if present to get the base domain
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    
    // Ensure path starts with a /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
};
