// Clipboard/copy logic for GTCs app
import { cleanAmendmentText } from './utils.js';

export function setupClipboard() {
  // Attach event listeners for copy buttons if needed
}

export function copyAllAmendments(side) {
  const pre = document.getElementById(`amendmentSummary${side === 'seller' ? 'Sell' : 'Buy'}Top`);
  let formattedText = '';
  const departments = pre.querySelectorAll('.department-section');
  departments.forEach(section => {
    const header = section.querySelector('.department-header');
    const items = section.querySelectorAll('.amendment-item');
    if (header && items.length > 0) {
      // Markdown bold for department header
      formattedText += `**${header.textContent.trim()}**\n`;
      items.forEach(item => {
        const text = item.textContent.trim();
        if (text) {
          formattedText += `- ${text}\n`;
        }
      });
      formattedText += '\n';
    }
  });
  if (departments.length === 0) {
    formattedText += pre.textContent || 'Aucun amendement disponible.';
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(formattedText).then(() => {
      // Optionally show a success message
    });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = formattedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}