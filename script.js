import { updateURL, getColorFromURL, copyURLToClipboard } from './share.js';

function convertHexToHSL(hex) {
  hex = hex.startsWith('#') ? hex.slice(1) : hex;

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // Achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
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

function generatePalette(hex, numColors = 11) {
  if (hex.toLowerCase() === '#000000') {
    const grayValues = Array.from({ length: numColors }, (_, i) => {
      const grayValue = Math.round(255 * i / (numColors - 1));
      return `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`;
    });
    return grayValues.reverse();
  } else if (hex.toLowerCase() === '#ffffff') {
    return Array.from({ length: numColors }, (_, i) => {
      const grayValue = Math.round(255 * (numColors - 1 - i) / (numColors - 1));
      return `#${grayValue.toString(16).padStart(2, '0').repeat(3)}`;
    });
  }

  const [h, s, l] = convertHexToHSL(hex);

  const lightnessSteps = Array.from({ length: numColors }, (_, i) => {
    return 95 - i * (90 / (numColors - 1));
  });

  const closestIndex = lightnessSteps.reduce((closest, current, index) => {
    return Math.abs(current - l) < Math.abs(lightnessSteps[closest] - l) ? index : closest;
  }, 0);

  const adjustedLightnessSteps = lightnessSteps.map((lightness, index) => {
    if (index === closestIndex) {
      return l;
    } else if (index < closestIndex) {
      return l + (lightness - l) * ((95 - l) / (95 - lightnessSteps[closestIndex]));
    } else {
      return l - (l - lightness) * (l / lightnessSteps[closestIndex]);
    }
  });

  const palette = adjustedLightnessSteps.map((lightness, index) => {
    if (index === closestIndex) {
      return hex;
    } else {
      return convertHSLToHex(h, s, lightness);
    }
  });

  return palette;
}

function updatePalette(color) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const colors = generatePalette(color);

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

    if (shade.toUpperCase() === color.toUpperCase()) {
      box.classList.add('original-color');
      value.textContent += ' (Selected)';
    }

    box.appendChild(value);
    palette.appendChild(box);
  });

  document.documentElement.style.cssText += cssVariables;

  updateColorURL(color);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const updateColorURL = debounce((color) => {
  updateURL(color);
}, 300);

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
  if (/^#[0-9A-Fa-f]{6}$/.test(color) && color !== colorInput.value) {
    colorInput.value = color;
    updatePalette(color);
  }
});

shareButton.addEventListener('click', copyURLToClipboard);

const urlColor = getColorFromURL();
if (urlColor && /^#[0-9A-Fa-f]{6}$/.test(urlColor)) {
  colorInput.value = urlColor;
  hexInput.value = urlColor;
  updatePalette(urlColor);
} else {
  updatePalette(colorInput.value);
}