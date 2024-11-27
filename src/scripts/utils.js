export const parseGameName = (url) => {
  // Adjusted regex to correctly capture the game name part of the URL
  const match = url.match(/ynoproject\.net\/([^/]+)/);
  return match ? match[1] : null;
};

export const isDreamWorldMap = (url) => {
    const imageExtensions = [".png", ".jpg", ".jpeg"];
    let isImage = false;
    if (url.startsWith("https://yume.wiki")) {
      isImage = imageExtensions.some((ext) => url.endsWith(ext));
    }
    return isImage;
};
