// scripts/settings.js
import { registerSettingsHelpers } from './settings-helpers.js';

// Main function to register all settings - called from module.js
export function registerSettings() {
    console.log("Stream Visibility Tools | Registering settings");
    
    // Register helper functions first
    registerSettingsHelpers();
    
    // =====================================================
    // TARGET USER - Top section as everything depends on this
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "targetUserSection", {
        name: "Target User Configuration",
        label: "Target User",
        icon: "fas fa-user-cog",
        type: SettingsSection,
        restricted: true
    });
    
    registerTargetUserSettings();

    // =====================================================
    // CAMERA CONTROL
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "cameraControlSection", {
        name: "Camera Control Settings",
        label: "Camera Control",
        icon: "fas fa-video",
        type: SettingsSection,
        restricted: true
    });
    
    registerCameraSettings();
    
    // =====================================================
    // UI VISIBILITY
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "uiVisibilitySection", {
        name: "UI Visibility Settings",
        label: "UI Visibility",
        icon: "fas fa-eye-slash",
        type: SettingsSection,
        restricted: true
    });
    
    registerUIVisibilitySettings();
    
    // =====================================================
    // SIDEBAR SETTINGS
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "sidebarSection", {
        name: "Sidebar Configuration",
        label: "Sidebar Settings",
        icon: "fas fa-columns",
        type: SettingsSection,
        restricted: true
    });
    
    registerSidebarSettings();
    
    // =====================================================
    // PLAYER LIST
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "playerListSection", {
        name: "Player List Configuration",
        label: "Player List",
        icon: "fas fa-users",
        type: SettingsSection,
        restricted: true
    });
    
    registerPlayerListSettings();
    
    // =====================================================
    // PC STATUS TRACKER
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "statusTrackerSection", {
        name: "PC Status Tracker Configuration",
        label: "PC Status Tracker",
        icon: "fas fa-heartbeat",
        type: SettingsSection,
        restricted: true
    });
    
    registerStatusTrackerSettings();
    
    // =====================================================
    // MISCELLANEOUS
    // =====================================================
    game.settings.registerMenu("stream-visibility-tools", "miscSection", {
        name: "Miscellaneous Settings",
        label: "Miscellaneous",
        icon: "fas fa-cogs",
        type: SettingsSection,
        restricted: true
    });
    
    registerMiscSettings();
}

// Define a custom class for SettingsSection
class SettingsSection extends FormApplication {
    constructor(object, options) {
        super(object, options);
        this.section = options.section;
    }
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "stream-visibility-section",
            title: "Stream Visibility Settings",
            template: "modules/stream-visibility-tools/templates/settings-section.html",
            width: 600,
            height: "auto",
            classes: ["stream-visibility-settings"],
            tabs: [
                { navSelector: ".tabs", contentSelector: ".content", initial: "general" }
            ]
        });
    }
    
    getData() {
        // Would get settings for this specific section
        return {
            section: this.section
        };
    }
    
    _updateObject(event, formData) {
        // Save form data
        for (let [key, value] of Object.entries(formData)) {
            game.settings.set("stream-visibility-tools", key, value);
        }
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