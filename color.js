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
    return 90 - i * (80 / (numColors - 1)); // Reduced max lightness to 90%
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


function hexToRgb(hex) {
  // Ensure the hex color starts with '#'
  hex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Handle both short (e.g., #FFF) and long (e.g., #FFFFFF) hex colors
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  // Match 6-digit or 8-digit hex codes
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);

  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    // Optional alpha value (if 8-digit hex)
    result[4] ? parseInt(result[4], 16) / 255 : 1 // Default to 1 (fully opaque) if no alpha
  ] : null;
}

function calculateRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    console.warn(`Invalid hex color: ${hex}`);
    return 0; // Return 0 luminance for invalid colors
  }

  const [r, g, b] = rgb.map(channel => {
    channel /= 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1, color2) {
  const luminance1 = calculateRelativeLuminance(color1);
  const luminance2 = calculateRelativeLuminance(color2);
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (brighter + 0.05) / (darker + 0.05);
}

function updatePalette(color) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const colors = generatePalette(color);

  let cssVariables = '';
  const colorNames = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

  // Get the lightest and darkest colors from the generated palette
  const lightestColor = colors[0];
  const darkestColor = colors[colors.length - 1];

  colors.forEach((shade, index) => {
    cssVariables += `--color-${colorNames[index]}: ${shade}; `;

    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = shade;

    const contrastWithLightest = calculateContrastRatio(shade, lightestColor);
    const contrastWithDarkest = calculateContrastRatio(shade, darkestColor);

    const textColor = contrastWithLightest > contrastWithDarkest ? lightestColor : darkestColor;
    const contrastRatio = Math.max(contrastWithLightest, contrastWithDarkest).toFixed(2);

    const value = document.createElement('span');
    value.className = 'color-value';
    value.style.color = textColor;
    value.textContent = `${shade.toUpperCase()} (${contrastRatio}:1)`;

    if (shade.toUpperCase() === color.toUpperCase()) {
      box.classList.add('original-color');
      value.textContent += ' (Selected)';
    }

    box.appendChild(value);
    palette.appendChild(box);
  });

  // Apply the generated colors to the root element
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