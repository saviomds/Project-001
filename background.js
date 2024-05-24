// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("Voice Assistant Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "recognizeSpeech") {
    // Implement speech recognition logic here
    // Send response back to content script or popup
  }
});
