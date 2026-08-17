export const getServerUrl = (path) => {
  if (!path) return "";

  const storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");
  const apiUrl = (import.meta.env.VITE_API_URL || "https://api.isor.in/api").replace(/\/+$/, "");

  let queryString = "";
  let cleanPath = String(path).trim();

  const queryIdx = cleanPath.indexOf("?");
  if (queryIdx !== -1) {
    queryString = cleanPath.substring(queryIdx);
    cleanPath = cleanPath.substring(0, queryIdx);
  }

  let filename = cleanPath;
  if (cleanPath.includes("/")) {
    filename = cleanPath.split("/").pop();
  }

  if (!filename) return "";

  if (queryString.includes("secure=1") || queryString.includes("secure=true")) {
    return `${apiUrl}/pdf/${filename}${queryString}`;
  }

  return `${storageUrl}/uploads/${filename}${queryString}`;
};