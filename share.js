export function updateURL(color) {
  const url = new URL(window.location);
  // Set the 'color' parameter without the '#' symbol
  url.searchParams.set('color', color.replace('#', ''));
  window.history.pushState({}, '', url);
}

export function getColorFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const color = urlParams.get('color');
  return color ? `#${color}` : null;
}

export function copyURLToClipboard() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('URL copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy URL: ', err);
  });
}