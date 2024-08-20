function generateShades(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return Array.from({ length: 11}, (_, i) => {
    const factor = i / 10;
    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  });
}

function updatePalette(color) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const shades = generateShades(color);

  shades.forEach(shade => {
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

const colorInput = document.getElementById('color-input')
colorInput.addEventListener('input', (e) => updatePalette(e.target.value));

updatePalette(colorInput.value);