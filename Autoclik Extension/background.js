// Force-inject on install using safe querying
chrome.runtime.onInstalled.addListener(async () => {
  // Querying without the "tabs" permission still works, 
  // it just hides the sensitive URL strings from the array
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      // We wrap this in a check to avoid injecting into restricted chrome:// pages
      if (tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      }
    } catch (err) {}
  }
});
// Listen for the Alt+Shift+S keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-autoclik") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      // Send a toggle command to the content script in the active tab
      chrome.tabs.sendMessage(tab.id, { action: "TOGGLE" });
    }
  }
});