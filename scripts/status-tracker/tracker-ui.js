// scripts/status-tracker/tracker-ui.js
import { PCStatusTracker } from './tracker-app.js';
import { isTargetViewer } from '../settings.js';

export function initializeStatusTracker() {
  console.log("Stream Visibility Tools | Initializing PC Status Tracker");
  
  // Store the tracker instance
  let pcTracker = null;
  
  // This function checks if the current user should display the tracker
  const shouldShowTracker = () => {
    if (!game.settings.get("stream-visibility-tools", "enableStatusTracker")) return false;
    return isTargetViewer();
  };
  
  // Create or refresh the tracker
  const setupTracker = () => {
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
  
  // Handle visibility changes
  game.settings.settings.get("stream-visibility-tools.enableStatusTracker").onChange = setupTracker;
  game.settings.settings.get("stream-visibility-tools.targetUser").onChange = setupTracker;

  // Handle padding changes
  game.settings.settings.get("stream-visibility-tools.statusTrackerTopPadding").onChange = () => {
    if (pcTracker && pcTracker.rendered) pcTracker.setPosition();
  };
  game.settings.settings.get("stream-visibility-tools.statusTrackerRightPadding").onChange = () => {
    if (pcTracker && pcTracker.rendered) pcTracker.setPosition();
  };
  game.settings.settings.get("stream-visibility-tools.statusTrackerBottomPadding").onChange = () => {
    if (pcTracker && pcTracker.rendered) pcTracker.setPosition();
  };
  game.settings.settings.get("stream-visibility-tools.statusTrackerLeftPadding").onChange = () => {
    if (pcTracker && pcTracker.rendered) pcTracker.setPosition();
  };
  
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