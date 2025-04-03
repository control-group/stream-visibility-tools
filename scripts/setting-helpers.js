// scripts/settings-helpers.js

/**
 * Register helper functions and custom settings types
 */
export function registerSettingsHelpers() {
    // Register custom settings types if needed
    if (!window.hasSettingsTypes) {
        window.hasSettingsTypes = true;
        
        // Add custom settings types like sliders, color pickers, etc. here if needed
    }
    
    // Add global helper functions
    window.setupTracker = () => {
        if (game.streamVisibilityTools?.statusTracker) {
            game.streamVisibilityTools.statusTracker.refresh();
        }
    };
}

/**
 * Create a settings section header HTML element
 * @param {string} title - The title of the section
 * @param {string} icon - FontAwesome icon class
 * @returns {HTMLElement} - The header element
 */
export function createSettingsSectionHeader(title, icon = "fas fa-cog") {
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
export function injectSettingsSections() {
    // Wait for the settings form to be available
    const settingsForm = document.querySelector('section[data-tab="modules"] .settings-list');
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

// Hook into the settings rendering to inject our sections
Hooks.on('renderSettings', () => {
    // Give the DOM time to update
    setTimeout(injectSettingsSections, 100);
});