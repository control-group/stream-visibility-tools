// scripts/module.js
import { registerSettings } from './settings.js';
import { initializeUIController } from './ui-controller.js';
import { initializeCameraControl } from './camera-control.js';
import { initializeAutoClose } from './auto-close.js';
import { initializeStatusTracker } from './status-tracker/tracker-ui.js';

console.log(`Stream Visibility Tools | Loading version ${game.modules.get('stream-visibility-tools').version}`);

// Initialize module
Hooks.once('init', () => {
  registerSettings();
});

// Set up functionality when ready
Hooks.once('ready', () => {
  initializeUIController();
  initializeCameraControl();
  initializeAutoClose();
  
  // Store the status tracker on the game object for access elsewhere
  game.streamVisibilityTools = game.streamVisibilityTools || {};
  game.streamVisibilityTools.statusTracker = initializeStatusTracker();
});