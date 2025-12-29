/**
 * QRart Extension - Options Page
 * Configure backend URL
 */

const backendUrlInput = document.getElementById('backendUrl') as HTMLInputElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;

// Load saved config
backendUrlInput.value = localStorage.getItem('backendUrl') || 'https://qrart-production.up.railway.app';

// Save on click
saveBtn.addEventListener('click', () => {
  const url = backendUrlInput.value.trim();
  if (!url) {
    alert('Enter a backend URL');
    return;
  }

  localStorage.setItem('backendUrl', url);
  saveBtn.textContent = '✓ Saved!';
  setTimeout(() => {
    saveBtn.textContent = 'Save';
  }, 2000);
});
