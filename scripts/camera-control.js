// scripts/camera-control.js
import { isTargetViewer, getTargetUser } from './settings.js';

export function initializeCameraControl() {
  console.log("Stream Visibility Tools | Camera control hooks initialized");

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
}