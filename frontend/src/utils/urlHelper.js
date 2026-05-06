export const getServerUrl = (path) => {
  if (!path) return "";

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

  // If it's already a full URL
  if (path.startsWith("http")) {
    // If it's a legacy localhost/127.0.0.1 link, replace it with the production base URL
    if (path.includes("localhost:") || path.includes("127.0.0.1:")) {
      return path.replace(/^https?:\/\/[^/]+/, baseUrl);
    }
    return path;
  }

  // Ensure path starts with a /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  console.log(`${baseUrl}${cleanPath}`);

  return `${baseUrl}${cleanPath}`;
};