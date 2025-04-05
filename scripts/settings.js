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

    game.settings.register("stream-visibility-tools", "statusTrackerAttributes", {
        name: "Status Tracker Attributes",
        hint: "Comma-separated list of attribute paths to show in the tracker. Click to open selector.",
        scope: "world",
        config: true,
        type: String,
        default: "",
        onChange: value => {
          if (game.streamVisibilityTools?.statusTracker) {
            game.streamVisibilityTools.statusTracker.refresh();
          }
        }
      });
    
      game.settings.register("stream-visibility-tools", "statusBarColors", {
        name: "Status Bar Colors",
        hint: "Comma-separated list of colors to use for status bars.",
        scope: "world",
        config: true,
        type: String,
        default: "#00cc00,#cc0000",
        onChange: value => {
          if (game.streamVisibilityTools?.statusTracker) {
            game.streamVisibilityTools.statusTracker.refresh();
          }
        }
      });
    
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
        setTimeout(() => {
            try {
                injectSettingsSections(html);
            } catch (error) {
                console.error("Stream Visibility Tools | Error in settings sections:", error);
            }
        }, 100);
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
    // Convert jQuery object to DOM element if needed
    const element = html instanceof jQuery ? html[0] : html;
    
    // Wait for the settings form to be available
    const settingsForm = element.querySelector('section[data-tab="modules"] .settings-list');
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
                'statusTrackerBottomPadding', 'statusTrackerLeftPadding'
                // Note: statusTrackerAttributes and statusBarColors handled separately below
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
        .filter(el => {
            const input = el.querySelector('input, select');
            return input && input.name && input.name.startsWith('stream-visibility-tools.');
        });
    
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
                const input = el.querySelector('input, select');
                return input && input.name === `stream-visibility-tools.${settingKey}`;
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

            // Now add our custom UI components - called AFTER reorganizing all settings
            registerAttributeSelectorButton($(parent));
            registerColorPickers($(parent));
            
    }
}


/**
 * Add custom styles for our UI components
 */
function addCustomStyles(html) {
    const styles = `
    <style>
        .settings-section-header {
            margin: 1.5em 0 0.5em 0;
            padding-bottom: 0.5em;
            border-bottom: 1px solid #782e22;
            color: #782e22;
            font-weight: bold;
            font-size: 1.2em;
        }
        
        .settings-section-header i {
            margin-right: 10px;
        }
        
        .settings-section-header:first-of-type {
            margin-top: 0;
        }
        
        .stream-visibility-settings .form-group {
            margin: 0.5em 0;
            padding: 0.5em;
            border-radius: 5px;
        }
        
        .stream-visibility-settings .form-group:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .attribute-selector-btn {
            margin-left: 8px;
            white-space: nowrap;
        }
        
        .attribute-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .attributes {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        }
        
        .attribute-item {
            display: flex;
            align-items: center;
            padding: 3px;
        }
        
        .attribute-item:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .attribute-item input {
            margin-right: 5px;
        }
        
        .currently-selected {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        
        .currently-selected h3 {
            margin: 0 0 10px 0;
            font-size: 1em;
        }
        
        #selected-attributes {
            margin: 0;
            padding-left: 20px;
        }
        
        .status-bar-colors {
            display: flex;
            gap: 5px;
            align-items: center;
        }
        
        .color-picker {
            width: 40px;
            height: 25px;
            padding: 0;
            border: 1px solid #ccc;
        }
        
        .add-color {
            width: 25px;
            height: 25px;
            padding: 0;
            line-height: 1;
        }
    </style>`;
    
    // Add the styles
    const form = html instanceof jQuery ? html.find('form') : html.querySelector('form');
    if (form) {
        const styleEl = document.createElement('div');
        styleEl.innerHTML = styles;
        form.prepend(styleEl);
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
            step: 1
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
                max: 1000,
                step: 1
            },
            onChange: () => {
                if (game.streamVisibilityTools?.statusTracker) {
                    game.streamVisibilityTools.statusTracker.refresh();
                }
            }
        });
    });
    
    // Custom settings with enhanced UI
    game.settings.register("stream-visibility-tools", "statusTrackerAttributes", {
        name: "Status Tracker Attributes",
        hint: "Attributes to display in the status tracker",
        scope: "world",
        config: false, // Hide from settings menu since we'll create a custom UI
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
        hint: "Colors for status bars (first color applies to first attribute, etc.)",
        scope: "world",
        config: false, // Hide from settings menu since we'll create a custom UI
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

/**
 * Add the attribute selector button to the settings UI
 */
function registerAttributeSelectorButton(html) {
    // Convert jQuery object to DOM element if needed
    const element = html instanceof jQuery ? html[0] : html;

    // Find the section where we want to add our button - more reliable selector
    const statusTrackerSection = $(element).find('.settings-section-header:contains("PC Status Tracker")');
    if (!statusTrackerSection.length) {
        console.error("Stream Visibility Tools | Couldn't find PC Status Tracker section");
        return;
    }
    
    // Create the attribute selector UI
    const attributeSettingHtml = `
    <div class="form-group stream-visibility-attribute-selector">
        <label>Status Tracker Attributes</label>
        <div class="form-fields">
            <input type="text" name="stream-visibility-tools.statusTrackerAttributes" 
                   value="${game.settings.get("stream-visibility-tools", "statusTrackerAttributes")}" readonly>
            <button type="button" id="select-attributes-btn" class="attribute-selector-btn">
                <i class="fas fa-list"></i> Select Attributes
            </button>
        </div>
        <p class="notes">Select which attributes to display in the PC status tracker.</p>
    </div>`;
    
    // Add it after all the padding settings
    const lastPaddingSetting = $(element).find(`input[name="stream-visibility-tools.statusTrackerLeftPadding"]`).closest(".form-group");
    if (lastPaddingSetting.length) {
        lastPaddingSetting.after(attributeSettingHtml);
    } else {
        // Fallback - add it after the section header
        statusTrackerSection.after(attributeSettingHtml);
    }
    
    // Add click handler to button
    $(element).find('#select-attributes-btn').click(() => {
        new AttributeSelectorDialog().render(true);
    });
}

/**
 * Add the color pickers to the settings UI
 */
function registerColorPickers(html) {
    // Convert jQuery object to DOM element if needed
    const element = html instanceof jQuery ? html[0] : html;
    
    // Find the attributes setting we just added
    const attributesSetting = $(element).find('.stream-visibility-attribute-selector');
    if (!attributesSetting.length) {
        console.error("Stream Visibility Tools | Couldn't find attribute selector");
        return;
    }

    // Get the current colors
    const currentColors = game.settings.get("stream-visibility-tools", "statusBarColors").split(",");
    
    // Create the color picker container
    const colorPickerHtml = `
    <div class="form-group">
        <label>Status Bar Colors</label>
        <div class="form-fields status-bar-colors">
            ${currentColors.map((color, i) => `
                <input type="color" data-index="${i}" value="${color}" class="color-picker">
            `).join('')}
            <button type="button" class="add-color"><i class="fas fa-plus"></i></button>
        </div>
        <p class="notes">Select colors for each status bar. Colors will be used in order for each attribute.</p>
    </div>`;
    
    // Insert after attributes setting
    attributesSetting.after(colorPickerHtml);
    
    // Add event listeners
    const colorContainer = $(element).find('.status-bar-colors');
    
    // Update colors when changed
    colorContainer.on('change', 'input[type="color"]', function() {
        const colors = [];
        colorContainer.find('input[type="color"]').each(function() {
            colors.push($(this).val());
        });
        game.settings.set("stream-visibility-tools", "statusBarColors", colors.join(','));
    });
    
    // Add new color
    colorContainer.on('click', '.add-color', function() {
        const newIndex = colorContainer.find('input[type="color"]').length;
        const newColor = $(`<input type="color" data-index="${newIndex}" value="#00cc00" class="color-picker">`);
        $(this).before(newColor);
        
        // Update the setting
        const colors = [];
        colorContainer.find('input[type="color"]').each(function() {
            colors.push($(this).val());
        });
        game.settings.set("stream-visibility-tools", "statusBarColors", colors.join(','));
    });
}

/**
 * Dialog for selecting attributes to display in the status tracker
 */
class AttributeSelectorDialog extends Dialog {
    constructor(options = {}) {
        super({
            title: "Select Status Tracker Attributes",
            content: `<div id="attribute-selector-container"><p>Loading attribute data...</p></div>`,
            buttons: {
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: "Save",
                    callback: html => this._saveAttributes(html)
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }
            },
            default: "save",
            ...options
        });
        
        this.selectedAttributes = game.settings.get("stream-visibility-tools", "statusTrackerAttributes").split(",");
    }
    
    /** @override */
    async _render(...args) {
        await super._render(...args);
        this._loadAttributeData();
    }
    
    /**
     * Find available attributes from actors in the game
     */
    async _loadAttributeData() {
        try {
            // Get all attributes from the first PC actor we can find
            const pcActor = game.actors.find(a => a.type === "character") || game.actors.find(a => a.type === "pc");
            
            if (!pcActor) {
                this.element.find("#attribute-selector-container").html(`
                    <p class="notification error">No player character actors found in the world.</p>
                    <p>Please create at least one character to scan for attributes.</p>
                `);
                return;
            }
            
            // Scan the actor data for numeric attributes
            const actorData = pcActor.system || pcActor.data.data;  // Handle different Foundry versions
            const attributePaths = this._findNumericAttributes(actorData);
            
            // Sort attributes by path
            attributePaths.sort();
            
            // Create the selection UI
            const html = `
                <div class="attribute-list">
                    <p class="hint">Select attributes to display in the status tracker.</p>
                    <div class="attributes">
                        ${attributePaths.map(path => `
                            <div class="attribute-item">
                                <input type="checkbox" id="attr-${path}" 
                                       data-path="${path}" 
                                       ${this.selectedAttributes.includes(path) ? 'checked' : ''}>
                                <label for="attr-${path}">${path}</label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="currently-selected">
                        <h3>Currently Selected:</h3>
                        <ul id="selected-attributes">
                            ${this.selectedAttributes.map(attr => `<li>${attr}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            this.element.find("#attribute-selector-container").html(html);
            
            // Add event listeners for checkbox updates
            this.element.find('.attribute-item input[type="checkbox"]').on('change', (event) => {
                const path = event.currentTarget.dataset.path;
                const checked = event.currentTarget.checked;
                
                if (checked && !this.selectedAttributes.includes(path)) {
                    this.selectedAttributes.push(path);
                } else if (!checked && this.selectedAttributes.includes(path)) {
                    this.selectedAttributes = this.selectedAttributes.filter(a => a !== path);
                }
                
                // Update the selected list
                this.element.find("#selected-attributes").html(
                    this.selectedAttributes.map(attr => `<li>${attr}</li>`).join('')
                );
            });
            
        } catch (error) {
            console.error("Stream Visibility Tools | Error loading attribute data:", error);
            this.element.find("#attribute-selector-container").html(`
                <p class="notification error">Error loading attribute data:</p>
                <pre>${error.message}</pre>
            `);
        }
    }
    
    /**
     * Recursively find numeric attributes in an object
     */
    _findNumericAttributes(obj, path = '', results = []) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'number') {
                results.push(currentPath);
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                this._findNumericAttributes(value, currentPath, results);
            }
        }
        return results;
    }
    
    /**
     * Save the selected attributes to settings
     */
    _saveAttributes(html) {
        // Sort the attributes to ensure consistent order
        this.selectedAttributes.sort();
        
        // Save to settings
        const attributeString = this.selectedAttributes.join(',');
        game.settings.set("stream-visibility-tools", "statusTrackerAttributes", attributeString);
        
        // Update the input field in the settings UI
        $(`input[name="stream-visibility-tools.statusTrackerAttributes"]`).val(attributeString);
        
        // Refresh the status tracker
        if (game.streamVisibilityTools?.statusTracker) {
            game.streamVisibilityTools.statusTracker.refresh();
        }
    }
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