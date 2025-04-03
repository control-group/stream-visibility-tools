// scripts/auto-close.js
import { isTargetViewer } from './settings.js';

export function initializeAutoClose() {
  console.log("Stream Visibility Tools | Initializing auto-close functionality");
  
  // Register hooks
  setupAutoCloseHooks();
}

function setupAutoCloseHooks() {
  // Function to handle automatic closing of pop-up windows
  const handleAutoClose = (app, html, data) => {
    if (!isTargetViewer()) return;
    
    // Retrieve the configured dwell time
    const dwellTime = game.settings.get("stream-visibility-tools", "dwellTime");
  
    // Ensure the dwell time is a positive number
    if (dwellTime > 0) {
      // Set a timeout to close the application after the dwell time
      setTimeout(() => {
        // Ensure the application is still rendered before closing
        if (app.rendered) {
          app.close();
        }
      }, dwellTime);
    }
  };
  
  // Hook into the rendering of relevant applications
  Hooks.on("renderJournalSheet", handleAutoClose);
  Hooks.on("renderActorSheet", handleAutoClose);
  
  // You can add more hooks for other application types as needed
  // Hooks.on("renderItemSheet", handleAutoClose);
  // Hooks.on("renderDialog", handleAutoClose);
}