// scripts/settings.js

// Main function to register all settings - called from module.js
export function registerSettings() {
    console.log("Stream Visibility Tools | Registering settings");
  
    // UI element visibility settings
    const elements = {
      navBar: "#navigation",
      chatLog: "#chat",
      combatTracker: ".app.combat-tracker",
      sidebarTabs: "#sidebar",
      players: "#players",
      logo: "#logo",
      sceneControls: "#controls",
      macroHotbar: "#hotbar"
    };
  
    // Register UI visibility settings
    for (const [key, selector] of Object.entries(elements)) {
      game.settings.register("stream-visibility-tools", key, {
        name: `Hide ${key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
      });
    }
  
    // Register other UI settings
    game.settings.register("stream-visibility-tools", "minimalSidebar", {
      name: "Minimal Sidebar",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: () => window.applyVisibilitySettings()
    });
  
    game.settings.register("stream-visibility-tools", "playerOffsetTop", {
      name: "Player List Top Offset (px)",
      scope: "world",
      config: true,
      default: 30,
      type: Number,
      onChange: () => window.applyVisibilitySettings()
    });
  
    game.settings.register("stream-visibility-tools", "sidebarHeight", {
        name: "Sidebar Height (px)",
        scope: "world",
        config: true,
        default: 600,
        type: Number,
        onChange: () => window.applyVisibilitySettings()
      });
    
      game.settings.register("stream-visibility-tools", "zoomInLevel", {
        name: "Token Focus Zoom Level",
        scope: "world",
        config: true,
        default: 1.5,
        type: Number
      });
    
      game.settings.register("stream-visibility-tools", "maxZoomOut", {
        name: "Max Zoom Out Level",
        scope: "world",
        config: true,
        default: 0.3,
        type: Number
      });
    
      game.settings.register("stream-visibility-tools", "defaultZoom", {
        name: "Default Zoom Level",
        scope: "world",
        config: true,
        default: 1.0,
        type: Number
      });
    
      // Register dwell time setting
      game.settings.register("stream-visibility-tools", "dwellTime", {
        name: "Popup Dwell Time (ms)",
        hint: "Duration in milliseconds that pop-up windows (e.g., Journal Entries, Actor sheets) remain open when shown to players.",
        scope: "world",
        config: true,
        type: Number,
        default: 5000,
      });
    
      // In settings.js, when registering settings that need callbacks:
      game.settings.register("stream-visibility-tools", "enableStatusTracker", {
        name: "Enable PC Status Tracker",
        hint: "Shows a panel with PC tokens and status bars",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => setupTracker() // This is the proper way to register an onChange handler
      });
    
      game.settings.register("stream-visibility-tools", "statusTrackerPosition", {
        name: "Status Tracker Position",
        hint: "Where to display the status tracker panel",
        scope: "world",
        config: true,
        default: "top-right",
        type: String,
        choices: {
          "top-left": "Top Left",
          "top-right": "Top Right", 
          "bottom-left": "Bottom Left",
          "bottom-right": "Bottom Right"
        }
      });
    
      game.settings.register("stream-visibility-tools", "statusTrackerTopPadding", {
        name: "Status Tracker Top Padding (px)",
        hint: "Distance from the top edge when in a top position",
        scope: "world",
        config: true,
        default: 10,
        type: Number,
        onChange: () => window.applyVisibilitySettings()
      });
      
      game.settings.register("stream-visibility-tools", "statusTrackerRightPadding", {
        name: "Status Tracker Right Padding (px)",
        hint: "Distance from the right edge when in a right position",
        scope: "world",
        config: true,
        default: 10,
        type: Number,
        onChange: () => window.applyVisibilitySettings()
      });
      
      game.settings.register("stream-visibility-tools", "statusTrackerBottomPadding", {
        name: "Status Tracker Bottom Padding (px)",
        hint: "Distance from the bottom edge when in a bottom position",
        scope: "world",
        config: true,
        default: 10,
        type: Number,
        onChange: () => window.applyVisibilitySettings()
      });
      
      game.settings.register("stream-visibility-tools", "statusTrackerLeftPadding", {
        name: "Status Tracker Left Padding (px)",
        hint: "Distance from the left edge when in a left position",
        scope: "world",
        config: true,
        default: 10,
        type: Number,
        onChange: () => window.applyVisibilitySettings()
      });
    
      game.settings.register("stream-visibility-tools", "statusTrackerAttributes", {
        name: "Status Tracker Attributes",
        hint: "Comma-separated list of attributes to track (e.g. 'attributes.hp.value,attributes.sanity.value')",
        scope: "world",
        config: true,
        default: "attributes.hp.value",
        type: String
      });
    
      game.settings.register("stream-visibility-tools", "statusBarColors", {
        name: "Status Bar Colors",
        hint: "Comma-separated list of colors for status bars (e.g. 'red,blue,green')",
        scope: "world",
        config: true,
        default: "red,blue,green",
        type: String
      });
    
     // Target user setting
    const userChoices = {};
    for (let user of game.users.contents) {
      userChoices[user.id] = `${user.name} (${user.id})`;
    }
  
    game.settings.register("stream-visibility-tools", "targetUser", {
      name: "Target User for Stream Visibility",
      hint: "Only this user will have UI elements hidden (if not a GM).",
      scope: "world",
      config: true,
      type: String,
      choices: userChoices,
      default: "",
      onChange: () => window.applyVisibilitySettings()
    });
  
  }
  
  // Helper functions
  export function getTargetUser() {
    try {
      if (game.settings.settings.has("stream-visibility-tools.targetUser")) {
        return game.settings.get("stream-visibility-tools", "targetUser");
      }
      return "";
    } catch (e) {
      console.error("Stream Visibility Tools | Error getting target user setting:", e);
      return "";
    }
  }
  
  export function isTargetViewer() {
    const targetUser = getTargetUser();
    return targetUser && game.user.id === targetUser;
  }