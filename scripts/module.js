// scripts/module.js
import { registerSettings } from './settings.js';
import { initializeUIController } from './ui-controller.js';
import { initializeCameraControl } from './camera-control.js';
import { initializeAutoClose } from './auto-close.js';
import { initializeStatusTracker } from './status-tracker/tracker-ui.js';

// Don't attempt to access game.modules at the top level
let moduleVersion = "0.6.0"; // Hardcode version for logging

// Initialize module
Hooks.once('init', async () => {
  console.log(`Stream Visibility Tools | Loading version ${moduleVersion}`);
  try {
    registerSettings();
  } catch (e) {
    console.error("Stream Visibility Tools | Error during settings registration:", e);
  }
});

// Set up functionality when ready
Hooks.once('ready', async () => {
  try {
    // Now safe to get module version from game.modules
    moduleVersion = game.modules.get('stream-visibility-tools')?.version || moduleVersion;
    console.log(`Stream Visibility Tools | Ready with version ${moduleVersion}`);
    
    initializeUIController();
    initializeCameraControl();
    initializeAutoClose();
    
    // Store the status tracker on the game object for access elsewhere
    game.streamVisibilityTools = game.streamVisibilityTools || {};
    game.streamVisibilityTools.statusTracker = initializeStatusTracker();
  } catch (e) {
    console.error("Stream Visibility Tools | Error during module initialization:", e);
  }
});