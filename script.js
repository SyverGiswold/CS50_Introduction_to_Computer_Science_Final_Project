function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
      h = s = 0;
  } else {
      let d = max - min;
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

function HSLToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex) {
  let [h, s, l] = hexToHSL(hex);

  if (s === 0) {
    return Array.from({ length: 11 }, (_, i) => {
        let newL = i * 10;
        return HSLToHex(0, 0, newL);
    });
  }

  let palette = Array.from({ length: 11 }, (_, i) => {
    let newL = 95 - (i * 9);
    let newS = Math.min(100, s + (50 - Math.abs(50 - newL)) * 0.3);
    return HSLToHex(h, newS, newL);
  });

  let originalIndex = palette.reduce((closest, color, index) => {
    let [_, currentS, currentL] = hexToHSL(color);
    let currentDiff = Math.abs(currentS - s) + Math.abs(currentL - l);
    let [__, closestS, closestL] = hexToHSL(palette[closest]);
    let closestDiff = Math.abs(closestS - s) + Math.abs(closestL - l);
    return currentDiff < closestDiff ? index : closest;
  }, 0);

  palette[originalIndex] = hex;

  return palette;

}

function updatePalette(color) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const colors = generatePalette(color);

  colors.forEach(shade => {
      const box = document.createElement('div');
      box.className = 'color-box';
      box.style.backgroundColor = shade;
      
      const value = document.createElement('span');
      value.className = 'color-value';
      value.textContent = shade;
      
      box.appendChild(value);
      palette.appendChild(box);
  });
}

const colorInput = document.getElementById('color-input');
colorInput.addEventListener('input', (e) => updatePalette(e.target.value));

// Initial palette generation
updatePalette(colorInput.value);