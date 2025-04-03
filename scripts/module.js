// scripts/module.js
import { registerSettings } from './settings.js';
import { initializeUIController } from './ui-controller.js';
import { initializeCameraControl } from './camera-control.js';
import { initializeAutoClose } from './auto-close.js';
import { initializeStatusTracker } from './status-tracker/tracker-ui.js';

// Use a try-catch block to catch and log any errors during initialization
try {
  console.log(`Stream Visibility Tools | Loading version ${game.modules.get('stream-visibility-tools').version}`);
} catch (e) {
  console.error("Stream Visibility Tools | Error getting module version:", e);
}

// Initialize module
Hooks.once('init', async () => {
  try {
    registerSettings();
  } catch (e) {
    console.error("Stream Visibility Tools | Error during settings registration:", e);
  }
});

// Set up functionality when ready
Hooks.once('ready', async () => {
  try {
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