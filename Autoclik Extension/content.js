let clickInterval = null;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
  currentX = e.clientX;
  currentY = e.clientY;
});

function startClicking(intervalMs) {
  if (clickInterval) clearInterval(clickInterval);
  clickInterval = setInterval(() => {
    const elementUnderCursor = document.elementFromPoint(currentX, currentY);
    if (elementUnderCursor) elementUnderCursor.click();
  }, intervalMs);
}

function stopClicking() {
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START") {
    startClicking(request.interval);
  } 
  else if (request.action === "STOP") {
    stopClicking();
  } 
  else if (request.action === "TOGGLE") {
    if (clickInterval) {
      stopClicking();
    } else {
      // Fetch the last used interval from storage if toggled via hotkey
      chrome.storage.local.get(['savedInterval'], (data) => {
        const secs = parseFloat(data.savedInterval) || 1.0;
        startClicking(secs * 1000);
      });
    }
  }
  
  // Always reply with the current running state so the popup can sync its UI
  sendResponse({ isRunning: !!clickInterval });
});