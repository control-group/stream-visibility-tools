const STREAM_VISIBILITY_VERSION = "0.4.0";
console.log(`Stream Visibility Tools | Loaded version ${STREAM_VISIBILITY_VERSION}`);

// Define the applyVisibilitySettings function before it's used
function applyVisibilitySettings() {
  if (!game.settings.settings.has("stream-visibility-tools.targetUser")) return;
  
  const targetUser = game.settings.get("stream-visibility-tools", "targetUser");
  if (!targetUser || game.user.id !== targetUser) return;
  
  console.log("Stream Visibility Tools | Applying visibility settings for target viewer");

  const selectors = {
    navBar: "#navigation",
    chatLog: "#chat",
    combatTracker: ".app.combat-tracker",
    sidebarTabs: "#sidebar",
    players: "#players",
    logo: "#logo",
    sceneControls: "#controls",
    macroHotbar: "#hotbar"
  };

  // Handle the nav bar with special care
  const hideNav = game.settings.get("stream-visibility-tools", "navBar");
  if (hideNav) {
    // Try multiple selector variations to ensure we catch the nav bar
    const navSelectors = ["#navigation", "nav#navigation", ".navigation"];
    navSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = "none";
        // Add !important to force override any other styles
        el.setAttribute("style", "display: none !important");
      });
    });
    console.log("Stream Visibility Tools | Nav bar hidden with aggressive styling");
  }

  // Handle the other elements as before
  for (const [key, selector] of Object.entries(selectors)) {
    if (key === "navBar") continue; // Skip nav bar as we handled it specially above
    
    const hide = game.settings.get("stream-visibility-tools", key);
    if (key === "logo") {
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el && hide) el.remove();
      }, 200);
    } else {
      const el = document.querySelector(selector);
      if (el) el.style.display = hide ? "none" : "";
    }
  }

  // Handle sidebar modifications
  const minimalSidebar = game.settings.get("stream-visibility-tools", "minimalSidebar");
  if (minimalSidebar) {
    const allowedTabs = ["chat", "settings"];
    document.querySelectorAll("#sidebar-tabs a[data-tab]").forEach(el => {
      const tab = el.dataset.tab;
      el.style.display = allowedTabs.includes(tab) ? "" : "none";
    });
    const inputEl = document.querySelector("#chat-controls");
    if (inputEl) inputEl.style.display = "none";
    document.querySelectorAll(".dice-tray, .dice-tray__buttons, .dice-tray__math").forEach(el => {
      el.style.display = "none";
    });
  }

  // Apply player list and sidebar adjustments
  const offsetTop = game.settings.get("stream-visibility-tools", "playerOffsetTop");
  const playersEl = document.querySelector("#players");
  if (playersEl) playersEl.style.marginTop = `${offsetTop}px`;

  const sidebarHeight = game.settings.get("stream-visibility-tools", "sidebarHeight");
  const sidebarEl = document.querySelector("#sidebar");
  if (sidebarEl) sidebarEl.style.setProperty("height", `${sidebarHeight}px`, "important");
}

// Initialize module settings
Hooks.once("init", () => {
  console.log("Stream Visibility Tools | Initializing");

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

  for (const [key, selector] of Object.entries(elements)) {
    game.settings.register("stream-visibility-tools", key, {
      name: `Hide ${key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}`,
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: () => applyVisibilitySettings()
    });
  }

  game.settings.register("stream-visibility-tools", "minimalSidebar", {
    name: "Minimal Sidebar",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: () => applyVisibilitySettings()
  });

  game.settings.register("stream-visibility-tools", "playerOffsetTop", {
    name: "Player List Top Offset (px)",
    scope: "world",
    config: true,
    default: 30,
    type: Number,
    onChange: () => applyVisibilitySettings()
  });

  game.settings.register("stream-visibility-tools", "sidebarHeight", {
    name: "Sidebar Height (px)",
    scope: "world",
    config: true,
    default: 600,
    type: Number,
    onChange: () => applyVisibilitySettings()
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

  game.settings.register("stream-visibility-tools", "enableStatusTracker", {
    name: "Enable PC Status Tracker",
    hint: "Shows a panel with PC tokens and status bars",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
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
});

// Register target user setting and initialize features when ready
Hooks.once("ready", () => {
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
    onChange: () => applyVisibilitySettings()
  });

  applyVisibilitySettings();
  initializeStreamCameraControl();
  
  // Initialize the status tracker
  const statusTracker = initializeStatusTracker();

  // Add debug tools for finding attributes
  inspectActorData();
  
  // Store it on the game object for access elsewhere if needed
  game.streamVisibilityTools = game.streamVisibilityTools || {};
  game.streamVisibilityTools.statusTracker = statusTracker;
  
  // Additional application passes
  // First pass already done above
  
  // Second pass - wait for UI to settle
  setTimeout(() => applyVisibilitySettings(), 500);
  
  // Third pass - final check to catch any edge cases
  setTimeout(() => applyVisibilitySettings(), 2000);
});

// Add hooks to catch when the UI might be refreshing
Hooks.on("renderSidebarTab", () => setTimeout(() => applyVisibilitySettings(), 100));
Hooks.on("renderSettings", () => setTimeout(() => applyVisibilitySettings(), 100));

// Apply settings when canvas is ready
Hooks.once("canvasReady", () => {
  const tryApply = () => {
    if (!game.settings.settings.has("stream-visibility-tools.targetUser")) {
      return setTimeout(tryApply, 100);
    }
    applyVisibilitySettings();
  };
  tryApply();
});

// Camera control functions
function initializeStreamCameraControl() {
  console.log("Stream Visibility Tools | Camera control hooks initialized");

  // This function safely gets the target user setting
  const getTargetUser = () => {
    try {
      if (game.settings.settings.has("stream-visibility-tools.targetUser")) {
        return game.settings.get("stream-visibility-tools", "targetUser");
      }
      return "";
    } catch (e) {
      console.error("Stream Visibility Tools | Error getting target user setting:", e);
      return "";
    }
  };
  
  // This function checks if the current user should receive camera movements
  const isTargetViewer = () => {
    const targetUser = getTargetUser();
    const result = targetUser && game.user.id === targetUser;
    console.log(`Stream Visibility Tools | isTargetViewer check - targetUser: "${targetUser}", currentUserID: "${game.user.id}", result: ${result}`);
    return result;
  };
  
  // Log initialization status with detailed user information
  console.log(`Stream Visibility Tools | Camera control initialized for user: ${game.user.name} (ID: ${game.user.id})`);
  console.log(`Stream Visibility Tools | User role: ${game.user.role}`);
  console.log(`Stream Visibility Tools | Target user setting: "${getTargetUser()}"`);
  console.log(`Stream Visibility Tools | Is target viewer: ${isTargetViewer()}`);

  // Default scene positioning
  Hooks.on("canvasReady", () => {
    console.log(`Stream Visibility Tools | Canvas ready event for ${game.user.name}`);
    
    // Only apply camera movements to the target viewer
    if (!isTargetViewer()) {
      console.log("Stream Visibility Tools | Not target viewer, skipping camera movements");
      return;
    }
    
    console.log("Stream Visibility Tools | Setting default camera position for target viewer");
    const pcTokens = canvas.tokens.placeables.filter(t => t.actor?.type === "character");
    if (pcTokens.length === 0) {
      const sceneInitial = canvas.scene.initial;
      const zoom = game.settings.get("stream-visibility-tools", "defaultZoom") || sceneInitial.scale;
      canvas.animatePan({ x: sceneInitial.x, y: sceneInitial.y, scale: zoom });
    }
  });

  // Combat Tracker popout functionality
  Hooks.on("createCombat", () => {
    console.log(`Stream Visibility Tools | Combat created event for ${game.user.name}`);
    
    // Only open combat tracker for the target viewer
    if (!isTargetViewer()) {
      console.log("Stream Visibility Tools | Not target viewer, skipping combat tracker popup");
      return;
    }
    
    console.log("Stream Visibility Tools | Opening combat tracker popout for target viewer");
    
    // Use a small delay to ensure the UI is ready
    setTimeout(() => {
      try {
        // Check if combat UI exists and has renderPopout method
        if (ui.combat && typeof ui.combat.renderPopout === "function") {
          ui.combat.renderPopout();
        }
      } catch (e) {
        console.error("Stream Visibility Tools | Error creating combat tracker popout:", e);
      }
    }, 500);
  });

  // Combat Tracker close functionality and end-of-combat camera adjustment
  Hooks.on("deleteCombat", async () => {
    console.log(`Stream Visibility Tools | Combat deleted event for ${game.user.name}`);
    
    // Only apply these effects for the target viewer
    if (!isTargetViewer()) {
      console.log("Stream Visibility Tools | Not target viewer, skipping post-combat actions");
      return;
    }
    
    console.log("Stream Visibility Tools | Closing combat tracker popout for target viewer");
    
    // Close the combat tracker popout
    try {
      if (ui.combat && ui.combat._popout) {
        ui.combat._popout.close();
      }
    } catch (e) {
      console.error("Stream Visibility Tools | Error closing combat tracker:", e);
    }
    
    // Wait a moment for UI to settle
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Zoom out to show all player tokens
    console.log("Stream Visibility Tools | Adjusting camera to show all player tokens");
    
    try {
      // Collect all player character tokens on the canvas
      const pcTokens = canvas.tokens.placeables.filter(t => {
        // Check if token represents a character and is visible
        return t.actor?.type === "character" && t.visible;
      });
      
      // If there are no PC tokens, don't change the view
      if (pcTokens.length === 0) {
        console.log("Stream Visibility Tools | No player tokens found, skipping camera adjustment");
        return;
      }
      
      // Calculate the bounding box of all PC tokens
      const bounds = {
        left: Math.min(...pcTokens.map(t => t.x)),
        right: Math.max(...pcTokens.map(t => t.x + t.w)),
        top: Math.min(...pcTokens.map(t => t.y)),
        bottom: Math.max(...pcTokens.map(t => t.y + t.h))
      };
      
      // Add padding (10% of each dimension)
      const padding = {
        x: (bounds.right - bounds.left) * 0.1,
        y: (bounds.bottom - bounds.top) * 0.1
      };
      
      bounds.left -= padding.x;
      bounds.right += padding.x;
      bounds.top -= padding.y;
      bounds.bottom += padding.y;
      
      // Calculate center point
      const center = {
        x: (bounds.left + bounds.right) / 2,
        y: (bounds.top + bounds.bottom) / 2
      };
      
      // Calculate required scale to fit all tokens
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;
      
      const scaleX = canvasWidth / (bounds.right - bounds.left);
      const scaleY = canvasHeight / (bounds.bottom - bounds.top);
      
      // Use the smaller scale to ensure everything fits
      let scale = Math.min(scaleX, scaleY) * 0.8; // Reduce by 20% to ensure tokens aren't at the very edge
      
      // Enforce maximum zoom out limit
      const maxZoomOut = game.settings.get("stream-visibility-tools", "maxZoomOut") || 0.3;
      scale = Math.max(scale, maxZoomOut);
      
      console.log(`Stream Visibility Tools | Panning to center (${center.x}, ${center.y}) with scale ${scale}`);
      
      // Animate to the new view
      await canvas.animatePan({
        x: center.x,
        y: center.y,
        scale: scale,
        duration: 1000 // Smoother, slower transition
      });
      
    } catch (e) {
      console.error("Stream Visibility Tools | Error adjusting camera position:", e);
    }
  });

  // Camera control for combat turn changes
  Hooks.on("updateCombat", async (combat, update, options, userId) => {
    console.log(`Stream Visibility Tools | Combat update event for ${game.user.name}`, update);
    
    // Only proceed if this is an actual turn change 
    if (!("turn" in update) && !("round" in update)) {
      console.log("Stream Visibility Tools | Not a turn/round change, ignoring");
      return;
    }
    
    // Check if this is the target viewer
    if (!isTargetViewer()) {
      console.log("Stream Visibility Tools | Not target viewer, skipping camera pan");
      return;
    }
    
    console.log("Stream Visibility Tools | Processing turn change for target viewer");
    
    // Get the active combatant (the one whose turn it is now)
    const activeCombatant = combat.combatant;
    if (!activeCombatant) {
      console.log("Stream Visibility Tools | No active combatant found");
      return;
    }
    
    console.log(`Stream Visibility Tools | Turn updated - Active combatant: ${activeCombatant.name}`);
    
    // Get the token for the active combatant
    const token = canvas.tokens.get(activeCombatant.tokenId);
    if (!token) {
      console.log(`Stream Visibility Tools | No token found for combatant: ${activeCombatant.name}`);
      return;
    }
    
    console.log(`Stream Visibility Tools | Found active token: ${token.name}`);
    
    // Check if token is visible and pan to it
    if (token.visible) {
      const zoom = game.settings.get("stream-visibility-tools", "zoomInLevel") || 1.5;
      console.log(`Stream Visibility Tools | Panning to token ${token.name} at (${token.center.x}, ${token.center.y}) with zoom ${zoom}`);
      
      // Add a small delay to ensure the UI has time to update
      await new Promise(resolve => setTimeout(resolve, 100));
      await canvas.animatePan({ x: token.center.x, y: token.center.y, scale: zoom });
    } else {
      console.log(`Stream Visibility Tools | Token ${token.name} is not visible; skipping pan.`);
    }
  });

// Add additional hooks for other application types as needed
  
  // Add additional hooks for debugging
  Hooks.on("ready", () => {
    // Dump all available users to the console
    console.log("Stream Visibility Tools | All users in game:", 
      game.users.contents.map(u => ({ id: u.id, name: u.name, role: u.role })));
    
    // Log detailed information about current user
    console.log(`Stream Visibility Tools | Ready event for ${game.user.name} (ID: ${game.user.id})`);
    console.log(`Stream Visibility Tools | User data:`, game.user);
    console.log(`Stream Visibility Tools | Target user setting: "${getTargetUser()}"`);
    console.log(`Stream Visibility Tools | Is target viewer: ${isTargetViewer()}`);
    
    // Check if targetUser setting exists and is valid
    const targetUserSetting = getTargetUser();
    if (!targetUserSetting) {
      console.warn("Stream Visibility Tools | Target user setting is empty!");
    } else {
      const targetUser = game.users.get(targetUserSetting);
      if (!targetUser) {
        console.warn(`Stream Visibility Tools | Could not find user with ID: ${targetUserSetting}`);
      } else {
        console.log(`Stream Visibility Tools | Target user is: ${targetUser.name} (ID: ${targetUser.id})`);
      }
    }
  });
}

/**
 * PC Status Tracker - Shows player character tokens with status bars
 */
class PCStatusTracker extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "pc-status-tracker",
      template: "modules/stream-visibility-tools/templates/status-tracker.html",
      classes: ["pc-status-tracker"],
      width: 250,
      height: "auto",
      popOut: true,
      minimizable: false,
      resizable: false,
      title: "PC Status"
    });
  }

  /**
   * Get data for the template
   */
  getData(options={}) {
    // Get visible PC tokens from the canvas
    const pcTokens = canvas.tokens.placeables.filter(t => {
      return t.actor?.type === "character" && t.visible;
    });
    
    // Get attribute paths to display
    const attributePaths = game.settings.get("stream-visibility-tools", "statusTrackerAttributes").split(",");
    const barColors = game.settings.get("stream-visibility-tools", "statusBarColors").split(",");
    
    // Process tokens to extract required data
    const tokenData = pcTokens.map(token => {
      const actor = token.actor;
      
      // Extract values for each attribute path
      const stats = attributePaths.map((path, index) => {
        const parts = path.trim().split('.');
        let obj = actor.system || actor.data.data; // Handle different versions of Foundry
        let max = null;
        
        // Navigate the object path to get the value
        for (let i = 0; i < parts.length; i++) {
          if (!obj) break;
          obj = obj[parts[i]];
        }
        
        // Try to find a max value
        const maxPath = path.replace(/\.value$/, '.max');
        const maxParts = maxPath.split('.');
        let maxObj = actor.system || actor.data.data;
        for (let i = 0; i < maxParts.length; i++) {
          if (!maxObj) break;
          maxObj = maxObj[maxParts[i]];
        }
        
        // If we have a numeric value, create a stat object
        if (typeof obj === 'number') {
          return {
            value: obj,
            max: typeof maxObj === 'number' ? maxObj : obj,
            pct: typeof maxObj === 'number' ? (obj / maxObj * 100) : 100,
            color: barColors[index] || 'gray'
          };
        }
        return null;
      }).filter(s => s !== null);
      
      return {
        id: token.id,
        name: token.name,
        img: token.document.texture.src,
        stats: stats
      };
    });
    
    return {
      tokens: tokenData
    };
  }

  /**
   * Update the UI when relevant data changes
   */
  refresh() {
    this.render(true);
  }

  /**
   * Set the position based on settings
   */
  setPosition(options={}) {
    if (!this.rendered) return;
    
    const position = game.settings.get("stream-visibility-tools", "statusTrackerPosition");
    const [vPos, hPos] = position.split('-');
    const padding = 10;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left, top;
    
    if (hPos === "left") {
      left = padding;
    } else {
      left = windowWidth - this.element[0].offsetWidth - padding;
    }
    
    if (vPos === "top") {
      top = padding;
    } else {
      top = windowHeight - this.element[0].offsetHeight - padding;
    }
    
    return this.element.css({
      left: left + "px",
      top: top + "px"
    });
  }
}

function initializeStatusTracker() {
  console.log("Stream Visibility Tools | Initializing PC Status Tracker");
  
  // Store the tracker instance
  let pcTracker = null;
  
  // This function checks if the current user should display the tracker
  const shouldShowTracker = () => {
    if (!game.settings.get("stream-visibility-tools", "enableStatusTracker")) return false;
    
    const targetUser = game.settings.get("stream-visibility-tools", "targetUser");
    return targetUser && game.user.id === targetUser;
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

// Add this after the initializeStatusTracker function
function inspectActorData() {
  // Create a macro or console function to inspect actor data
  Hooks.once('ready', () => {
    // Add a global helper function
    window.inspectActor = (actorId) => {
      const actor = game.actors.get(actorId);
      if (!actor) {
        console.error("Actor not found with ID:", actorId);
        return;
      }
      
      console.log("Actor:", actor.name);
      console.log("System Data:", actor.system);
      
      // Create a flattened view of paths and values
      const paths = [];
      const flattenObject = (obj, path = '') => {
        for (let key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            flattenObject(obj[key], path + key + '.');
          } else {
            paths.push({
              path: path + key,
              value: obj[key]
            });
          }
        }
      };
      
      flattenObject(actor.system);
      
      // Log possible attribute paths
      console.log("Possible attribute paths:");
      paths.filter(p => typeof p.value === 'number').forEach(p => {
        console.log(`system.${p.path} = ${p.value}`);
      });
      
      return paths;
    };
    
    // Create a convenience macro if macros are available
    if (game.macros && game.user.isGM) {
      const macroName = "Inspect Selected Actor";
      const command = "const selected = canvas.tokens.controlled[0];\nif (selected) {\n  window.inspectActor(selected.actor.id);\n} else {\n  ui.notifications.warn('Please select a token first');\n}";
      
      const existingMacro = game.macros.find(m => m.name === macroName);
      if (!existingMacro) {
        Macro.create({
          name: macroName,
          type: "script",
          command: command,
          img: "icons/svg/magnifying-glass.svg"
        });
        console.log("Stream Visibility Tools | Created actor inspection macro");
      }
    }
  });
}

// Function to handle automatic closing of pop-up windows
function handleAutoClose(app, html, data) {
  if (!game.settings.settings.has("stream-visibility-tools.targetUser")) return;
  
  const targetUser = game.settings.get("stream-visibility-tools", "targetUser");
  if (!targetUser || game.user.id !== targetUser) return;
  
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
}

  // Hook into the rendering of relevant applications
Hooks.on("renderJournalSheet", handleAutoClose);
Hooks.on("renderActorSheet", handleAutoClose);

