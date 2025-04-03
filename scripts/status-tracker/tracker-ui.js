// scripts/status-tracker/tracker-ui.js
import { PCStatusTracker } from './tracker-app.js';
import { isTargetViewer } from '../settings.js';

export function initializeStatusTracker() {
  console.log("Stream Visibility Tools | Initializing PC Status Tracker");
  
  // Store the tracker instance
  let pcTracker = null;
  
  // This function checks if the current user should display the tracker
  const shouldShowTracker = () => {
    try {
      if (!game.settings.get("stream-visibility-tools", "enableStatusTracker")) return false;
      return isTargetViewer();
    } catch (e) {
      console.error("Stream Visibility Tools | Error in shouldShowTracker:", e);
      return false;
    }
  };
  
  // Create or refresh the tracker
  const setupTracker = () => {
    try {
      if (!shouldShowTracker()) {
        if (pcTracker && pcTracker.rendered) {
          pcTracker.close();
        }
        return;
      }
      
      if (!pcTracker) {
        pcTracker = new PCStatusTracker();
        pcTracker.render(true);
      } else if (!pcTracker.rendered) {
        pcTracker.render(true);
      } else {
        pcTracker.refresh();
      }
    } catch (e) {
      console.error("Stream Visibility Tools | Error in setupTracker:", e);
    }
  };
  
  // Set up hooks for tracker updates
  Hooks.on("canvasReady", setupTracker);
  Hooks.on("updateToken", (token, changes) => {
    if (pcTracker && pcTracker.rendered) pcTracker.refresh();
  });
  Hooks.on("updateActor", (actor, changes) => {
    if (pcTracker && pcTracker.rendered) pcTracker.refresh();
  });
  
  // Also refresh when combat changes
  Hooks.on("updateCombat", () => {
    if (pcTracker && pcTracker.rendered) pcTracker.refresh();
  });
  
  // Register for setting changes
  Hooks.on("updateSetting", (setting) => {
    if (setting.key.startsWith("stream-visibility-tools")) {
      setupTracker();
    }
  });
  
  // Initialize on ready
  setupTracker();
  
  // Handle window resize
  window.addEventListener("resize", () => {
    if (pcTracker && pcTracker.rendered) {
      pcTracker.setPosition();
    }
  });
  
  return {
    refresh: () => {
      if (pcTracker && pcTracker.rendered) pcTracker.refresh();
    }
  };
}