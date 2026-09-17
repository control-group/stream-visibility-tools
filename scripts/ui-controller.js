// scripts/ui-controller.js
import { isTargetViewer } from './settings.js';

export function initializeUIController() {
  // Register global function for visibility changes
  window.applyVisibilitySettings = applyVisibilitySettings;
  
  // Set up hooks
  Hooks.on("renderSidebarTab", () => setTimeout(() => applyVisibilitySettings(), 100));
  Hooks.on("renderSettings", () => setTimeout(() => applyVisibilitySettings(), 100));
  Hooks.on("renderSceneNavigation", () => setTimeout(() => applyVisibilitySettings(), 100));
  
  // Listen for settings changes
  Hooks.on("updateSetting", (setting) => {
    if (setting.key.startsWith("stream-visibility-tools")) {
      setTimeout(() => applyVisibilitySettings(), 100);
    }
  });
  
  Hooks.once("canvasReady", () => {
    setTimeout(() => applyVisibilitySettings(), 100);
  });
  
  // Initial application
  applyVisibilitySettings();
  
  // Additional application passes
  setTimeout(() => applyVisibilitySettings(), 500);
  setTimeout(() => applyVisibilitySettings(), 2000);
}

function applyVisibilitySettings() {
  if (!isTargetViewer()) return;
  
  console.log("Stream Visibility Tools | Applying visibility settings for target viewer");

  const selectors = {
    navBar: "#scene-navigation",
    chatLog: "#chat",
    combatTracker: "#combat",
    sidebarTabs: "#sidebar",
    players: "#players",
    logo: "#logo",
    sceneControls: "#scene-controls",
    macroHotbar: "#hotbar"
  };

  // Handle the nav bar with special care: Foundry re-renders #scene-navigation
  // from scratch (e.g. on scene change), which wipes any inline style we set,
  // so this needs to be re-applied on "renderSceneNavigation" too (see hook above).
  const hideNav = game.settings.get("stream-visibility-tools", "navBar");
  const navEl = document.querySelector("#scene-navigation");
  if (navEl) {
    navEl.style.setProperty("display", hideNav ? "none" : "", hideNav ? "important" : "");
  }

  // Handle the other elements as before
  for (const [key, selector] of Object.entries(selectors)) {
    if (key === "navBar") continue; // Skip nav bar as we handled it specially above
    
    const hide = game.settings.get("stream-visibility-tools", key);
    const el = document.querySelector(selector);
    if (el) el.style.display = hide ? "none" : "";
  }

  // Handle sidebar modifications
  const minimalSidebar = game.settings.get("stream-visibility-tools", "minimalSidebar");
  if (minimalSidebar) {
    const allowedTabs = ["chat", "settings"];
    document.querySelectorAll("#sidebar-tabs button[data-tab]").forEach(el => {
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