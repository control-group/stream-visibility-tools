// scripts/settings.js

// Main function to register all settings - called from module.js
export function registerSettings() {
    console.log("Stream Visibility Tools | Registering settings");
    
    // =====================================================
    // TARGET USER - Top section as everything depends on this
    // =====================================================
    registerTargetUserSettings();

    // =====================================================
    // CAMERA CONTROL
    // =====================================================
    registerCameraSettings();
    
    // =====================================================
    // UI VISIBILITY
    // =====================================================
    registerUIVisibilitySettings();
    
    // =====================================================
    // SIDEBAR SETTINGS
    // =====================================================
    registerSidebarSettings();
    
    // =====================================================
    // PLAYER LIST
    // =====================================================
    registerPlayerListSettings();
    
    // =====================================================
    // PC STATUS TRACKER
    // =====================================================
    registerStatusTrackerSettings();
    
    // =====================================================
    // MISCELLANEOUS
    // =====================================================
    registerMiscSettings();
    
    // Set up the settings sections renderer
    setupSettingsSections();
}

// Setup the hook for settings sections
function setupSettingsSections() {
    Hooks.on('renderSettingsConfig', (app, html, data) => {
        // Give the DOM time to update
        setTimeout(() => injectSettingsSections(html), 100);
    });
}

/**
 * Create a settings section header HTML element
 * @param {string} title - The title of the section
 * @param {string} icon - FontAwesome icon class
 * @returns {HTMLElement} - The header element
 */
function createSettingsSectionHeader(title, icon = "fas fa-cog") {
    const header = document.createElement("h3");
    header.classList.add("settings-section-header");
    
    const iconElement = document.createElement("i");
    iconElement.className = icon;
    iconElement.style.marginRight = "10px";
    
    const titleText = document.createTextNode(title);
    
    header.appendChild(iconElement);
    header.appendChild(titleText);
    header.style.borderBottom = "1px solid #782e22";
    header.style.margin = "1em 0 0.5em 0";
    header.style.paddingBottom = "0.5em";
    header.style.color = "#782e22";
    
    return header;
}

/**
 * Inserts section headers into the settings form
 * This function should be called when the settings tab is rendered
 */
function injectSettingsSections(html) {
    // Wait for the settings form to be available
    const settingsForm = html.querySelector('section[data-tab="modules"] .settings-list');
    if (!settingsForm) return;
    
    // Define sections and their settings
    const sections = [
        {
            id: 'target-user',
            title: 'Target User Configuration',
            icon: 'fas fa-user-cog',
            settings: ['targetUser']
        },
        {
            id: 'camera-control',
            title: 'Camera Control Settings',
            icon: 'fas fa-video',
            settings: ['zoomInLevel', 'maxZoomOut', 'defaultZoom']
        },
        {
            id: 'ui-visibility',
            title: 'UI Visibility Settings',
            icon: 'fas fa-eye-slash',
            settings: ['navBar', 'logo', 'sceneControls', 'macroHotbar']
        },
        {
            id: 'sidebar',
            title: 'Sidebar Settings',
            icon: 'fas fa-columns',
            settings: ['sidebarTabs', 'chatLog', 'combatTracker', 'minimalSidebar', 'sidebarHeight']
        },
        {
            id: 'player-list',
            title: 'Player List Settings',
            icon: 'fas fa-users',
            settings: ['players', 'playerOffsetTop']
        },
        {
            id: 'status-tracker',
            title: 'PC Status Tracker',
            icon: 'fas fa-heartbeat',
            settings: [
                'enableStatusTracker', 'statusTrackerPosition', 
                'statusTrackerTopPadding', 'statusTrackerRightPadding', 
                'statusTrackerBottomPadding', 'statusTrackerLeftPadding',
                'statusTrackerAttributes', 'statusBarColors'
            ]
        },
        {
            id: 'misc',
            title: 'Miscellaneous Settings',
            icon: 'fas fa-cogs',
            settings: ['dwellTime']
        }
    ];
    
    // Get all stream-visibility-tools settings
    const allSettings = Array.from(settingsForm.querySelectorAll('.form-group'))
        .filter(el => el.dataset.moduleId === 'stream-visibility-tools');
    
    // Create a document fragment to build our reorganized settings
    const fragment = document.createDocumentFragment();
    
    // Process each section
    sections.forEach(section => {
        // Add section header
        const header = createSettingsSectionHeader(section.title, section.icon);
        fragment.appendChild(header);
        
        // Find settings for this section
        section.settings.forEach(settingKey => {
            const settingElement = allSettings.find(el => {
                const name = el.querySelector('input, select')?.name;
                return name === `stream-visibility-tools.${settingKey}`;
            });
            
            if (settingElement) {
                fragment.appendChild(settingElement);
            }
        });
    });
    
    // Replace the original settings with our organized version
    if (allSettings.length > 0) {
        const firstSetting = allSettings[0];
        const parent = firstSetting.parentNode;
        
        // Remove all original settings
        allSettings.forEach(el => el.remove());
        
        // Insert the organized settings
        parent.appendChild(fragment);
    }
}

// Helper functions to register settings by category
function registerTargetUserSettings() {
    // Target user setting
    game.settings.register("stream-visibility-tools", "targetUser", {
        name: "Target User for Stream Visibility",
        hint: "Select which user will have modified UI elements for streaming. All visibility settings will apply only to this user.",
        scope: "world",
        config: true,
        type: String,
        choices: {},
        default: "",
        onChange: () => window.applyVisibilitySettings()
    });

    // Set up a hook to populate the user choices when ready
    Hooks.once('ready', () => {
        try {
            // Now game.users should be available
            const setting = game.settings.settings.get("stream-visibility-tools.targetUser");
            if (setting) {
                const userChoices = {};
                for (let user of game.users.contents) {
                    userChoices[user.id] = `${user.name} (${user.role})`;
                }
                setting.choices = userChoices;
            }
        } catch (e) {
            console.error("Stream Visibility Tools | Error setting up user choices:", e);
        }
    });
}

function registerCameraSettings() {
    game.settings.register("stream-visibility-tools", "zoomInLevel", {
        name: "Token Focus Zoom Level",
        hint: "How much to zoom in when focusing on a token during combat",
        scope: "world",
        config: true,
        default: 1.5,
        type: Number,
        range: {
            min: 0.5,
            max: 3.0,
            step: 0.1
        }
    });
    
    game.settings.register("stream-visibility-tools", "maxZoomOut", {
        name: "Max Zoom Out Level",
        hint: "Maximum zoom out level when showing all player tokens",
        scope: "world",
        config: true,
        default: 0.3,
        type: Number,
        range: {
            min: 0.1,
            max: 1.0,
            step: 0.05
        }
    });
    
    game.settings.register("stream-visibility-tools", "defaultZoom", {
        name: "Default Zoom Level",
        hint: "Default zoom level when entering a scene",
        scope: "world",
        config: true,
        default: 1.0,
        type: Number,
        range: {
            min: 0.1,
            max: 2.0,
            step: 0.1
        }
    });
}

function registerUIVisibilitySettings() {
    // UI element visibility settings
    const elements = {
        navBar: { 
            selector: "#navigation", 
            name: "Navigation Bar",
            hint: "Hide the navigation bar that shows scene tabs"
        },
        logo: { 
            selector: "#logo", 
            name: "Foundry Logo",
            hint: "Hide the Foundry VTT logo in the corner of the screen"
        },
        sceneControls: { 
            selector: "#controls", 
            name: "Scene Controls",
            hint: "Hide the scene control buttons on the left side"
        },
        macroHotbar: { 
            selector: "#hotbar", 
            name: "Macro Hotbar",
            hint: "Hide the macro hotbar at the bottom of the screen"
        }
    };

    // Register UI visibility settings
    for (const [key, config] of Object.entries(elements)) {
        game.settings.register("stream-visibility-tools", key, {
            name: `Hide ${config.name}`,
            hint: config.hint,
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => window.applyVisibilitySettings()
        });
    }
}

function registerSidebarSettings() {
    // Hide sidebar setting
    game.settings.register("stream-visibility-tools", "sidebarTabs", {
        name: "Hide Sidebar",
        hint: "Hide the entire sidebar including all tabs",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
    });
    
    // Chat log visibility
    game.settings.register("stream-visibility-tools", "chatLog", {
        name: "Hide Chat Log",
        hint: "Hide the chat log tab in the sidebar",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
    });
    
    // Combat tracker visibility
    game.settings.register("stream-visibility-tools", "combatTracker", {
        name: "Hide Combat Tracker",
        hint: "Hide the combat tracker tab in the sidebar",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
    });
    
    // Register other UI settings
    game.settings.register("stream-visibility-tools", "minimalSidebar", {
        name: "Minimal Sidebar",
        hint: "Only show essential tabs in the sidebar (Chat and Settings)",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
    });
    
    game.settings.register("stream-visibility-tools", "sidebarHeight", {
        name: "Sidebar Height (px)",
        hint: "Set a custom height for the sidebar in pixels",
        scope: "world",
        config: true,
        default: 600,
        type: Number,
        range: {
            min: 200,
            max: 1200,
            step: 50
        },
        onChange: () => window.applyVisibilitySettings()
    });
}

function registerPlayerListSettings() {
    // Player list visibility
    game.settings.register("stream-visibility-tools", "players", {
        name: "Hide Player List",
        hint: "Hide the player list at the bottom of the UI",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => window.applyVisibilitySettings()
    });
    
    game.settings.register("stream-visibility-tools", "playerOffsetTop", {
        name: "Player List Top Offset (px)",
        hint: "Distance from the top of the screen to the player list",
        scope: "world",
        config: true,
        default: 30,
        type: Number,
        range: {
            min: 0,
            max: 200,
            step: 5
        },
        onChange: () => window.applyVisibilitySettings()
    });
}

function registerStatusTrackerSettings() {
    // Main toggle
    game.settings.register("stream-visibility-tools", "enableStatusTracker", {
        name: "Enable PC Status Tracker",
        hint: "Shows a panel with PC tokens and status bars",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            if (game.streamVisibilityTools?.statusTracker) {
                game.streamVisibilityTools.statusTracker.refresh();
            }
        }
    });
    
    // Position settings
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
        },
        onChange: () => {
            if (game.streamVisibilityTools?.statusTracker) {
                game.streamVisibilityTools.statusTracker.refresh();
            }
        }
    });
    
    // Padding settings
    const paddingSettings = [
        {
            key: "statusTrackerTopPadding",
            name: "Top Padding (px)",
            hint: "Distance from the top edge when in a top position",
            default: 10
        },
        {
            key: "statusTrackerRightPadding",
            name: "Right Padding (px)",
            hint: "Distance from the right edge when in a right position",
            default: 10
        },
        {
            key: "statusTrackerBottomPadding",
            name: "Bottom Padding (px)",
            hint: "Distance from the bottom edge when in a bottom position",
            default: 10
        },
        {
            key: "statusTrackerLeftPadding",
            name: "Left Padding (px)",
            hint: "Distance from the left edge when in a left position",
            default: 10
        }
    ];
    
    paddingSettings.forEach(setting => {
        game.settings.register("stream-visibility-tools", setting.key, {
            name: setting.name,
            hint: setting.hint,
            scope: "world",
            config: true,
            default: setting.default,
            type: Number,
            range: {
                min: 0,
                max: 100,
                step: 5
            },
            onChange: () => {
                if (game.streamVisibilityTools?.statusTracker) {
                    game.streamVisibilityTools.statusTracker.refresh();
                }
            }
        });
    });
    
    // Appearance settings
    game.settings.register("stream-visibility-tools", "statusTrackerAttributes", {
        name: "Status Attributes",
        hint: "Comma-separated list of attributes to track (e.g. 'attributes.hp.value,attributes.sanity.value')",
        scope: "world",
        config: true,
        default: "attributes.hp.value",
        type: String,
        onChange: () => {
            if (game.streamVisibilityTools?.statusTracker) {
                game.streamVisibilityTools.statusTracker.refresh();
            }
        }
    });
    
    game.settings.register("stream-visibility-tools", "statusBarColors", {
        name: "Status Bar Colors",
        hint: "Comma-separated list of colors for status bars (e.g. 'red,blue,green')",
        scope: "world",
        config: true,
        default: "red,blue,green",
        type: String,
        onChange: () => {
            if (game.streamVisibilityTools?.statusTracker) {
                game.streamVisibilityTools.statusTracker.refresh();
            }
        }
    });
}

function registerMiscSettings() {
    // Register dwell time setting
    game.settings.register("stream-visibility-tools", "dwellTime", {
        name: "Popup Dwell Time (ms)",
        hint: "Duration in milliseconds that pop-up windows (e.g., Journal Entries, Actor sheets) remain open when shown to the target user.",
        scope: "world",
        config: true,
        type: Number,
        default: 5000,
        range: {
            min: 0,
            max: 30000,
            step: 1000
        }
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
    try {
        const targetUser = game.settings.get("stream-visibility-tools", "targetUser");
        return targetUser && game.user.id === targetUser;
    } catch (e) {
        console.error("Stream Visibility Tools | Error in isTargetViewer:", e);
        return false;
    }
}

// Global function to set up the tracker
window.setupTracker = () => {
    if (game.streamVisibilityTools?.statusTracker) {
        game.streamVisibilityTools.statusTracker.refresh();
    }
};