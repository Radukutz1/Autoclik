const toggleBtn = document.getElementById('toggleBtn');
const statusTxt = document.getElementById('status');
const intervalInput = document.getElementById('interval');

let isClicking = false;

// Function to update the glass UI
function updateUI(running) {
  isClicking = running;
  if (isClicking) {
    toggleBtn.innerText = "STOP";
    statusTxt.innerText = "Status: Running";
    statusTxt.style.color = "#86efac"; 
  } else {
    toggleBtn.innerText = "START";
    statusTxt.innerText = "Status: Stopped";
    statusTxt.style.color = "#ff8a8a"; 
  }
}

// 1. On open: Load the saved interval and ask the tab if it's currently clicking
chrome.storage.local.get(['savedInterval'], (data) => {
  if (data.savedInterval) intervalInput.value = data.savedInterval;
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "STATUS_CHECK" }, (response) => {
      // If the content script replies that it's running, update the UI to match
      if (response && response.isRunning) updateUI(true);
    });
  }
});

// 2. Save the interval whenever the user types a new number
intervalInput.addEventListener('change', () => {
  chrome.storage.local.set({ savedInterval: intervalInput.value });
});

// 3. Handle the START/STOP button click
toggleBtn.addEventListener('click', async () => {
  const intervalVal = parseFloat(intervalInput.value) || 1.0;
  chrome.storage.local.set({ savedInterval: intervalVal }); // Force save
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { 
      action: isClicking ? "STOP" : "START", 
      interval: intervalVal * 1000 
    }, (response) => {
       if (response) updateUI(response.isRunning);
    });
  }
});