
import { updateURL, getColorFromURL, copyURLToClipboard } from './share.js';

function convertHexToHSL(hex) {
  // Normalize the hex value
  hex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // Achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function convertHSLToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex) {
  const [h, s, l] = convertHexToHSL(hex);

  // Generate a color palette with a smooth transition
  const palette = Array.from({ length: 11 }, (_, i) => {
    const newL = 95 - Math.pow(i / 11, 1.2) * 90;
    return convertHSLToHex(h, s, newL);
  });

  // Find the closest color in the palette to the original color
  const originalIndex = palette.reduce((closest, color, index) => {
    const [_, currentS, currentL] = convertHexToHSL(color);
    const currentDiff = Math.abs(currentS - s) + Math.abs(currentL - l);
    const [__, closestS, closestL] = convertHexToHSL(palette[closest]);
    const closestDiff = Math.abs(closestS - s) + Math.abs(closestL - l);
    return currentDiff < closestDiff ? index : closest;
  }, 0);

  // Replace the closest color with the original color
  palette[originalIndex] = hex;

  return palette;
}

function updatePalette(color) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const colors = generatePalette(color);

  // Generate CSS variables
  let cssVariables = '';
  const colorNames = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

  colors.forEach((shade, index) => {
    cssVariables += `--color-${colorNames[index]}: ${shade}; `;

    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = shade;

    const value = document.createElement('span');
    value.className = 'color-value';
    value.textContent = shade.toUpperCase();

    box.appendChild(value);
    palette.appendChild(box);
  });

  // Update HTML element with CSS variables
  document.documentElement.style.cssText += cssVariables;

  // Update URL with the new color
  updateURL(color);
}

const colorInput = document.getElementById('color-input');
const hexInput = document.getElementById('hex-input');
const shareButton = document.getElementById('share-button');

colorInput.addEventListener('input', (e) => {
  const color = e.target.value;
  hexInput.value = color;
  updatePalette(color);
});

hexInput.addEventListener('input', (e) => {
  const color = e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(color) && color !== colorInput.value) { // Input validation
    colorInput.value = color;
    updatePalette(color);
  }
});

shareButton.addEventListener('click', copyURLToClipboard);

// Initial palette generation
const urlColor = getColorFromURL();
if (urlColor && /^#[0-9A-Fa-f]{6}$/.test(urlColor)) {
  colorInput.value = urlColor;
  hexInput.value = urlColor;
  updatePalette(urlColor);
} else {
  updatePalette(colorInput.value);
}