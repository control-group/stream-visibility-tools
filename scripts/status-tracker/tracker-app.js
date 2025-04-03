// scripts/status-tracker/tracker-app.js
export class PCStatusTracker extends Application {
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

      // Debug information for first token
    if (pcTokens.length > 0) {
      const firstActor = pcTokens[0].actor;
      console.log("Debug - First actor:", firstActor.name);
      console.log("Debug - Actor data:", firstActor.system || firstActor.data.data);
      
      // Dump all properties that have numeric values
      const numericProps = [];
      const findNumericProps = (obj, path = '') => {
        for (let key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object') {
            findNumericProps(obj[key], path + key + '.');
          } else if (typeof obj[key] === 'number') {
            numericProps.push(`${path}${key}: ${obj[key]}`);
          }
        }
      };
      
      findNumericProps(firstActor.system || firstActor.data.data);
      console.log("Numeric properties:", numericProps);
    }
    
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
    
    // Get padding settings
    const topPadding = game.settings.get("stream-visibility-tools", "statusTrackerTopPadding");
    const rightPadding = game.settings.get("stream-visibility-tools", "statusTrackerRightPadding");
    const bottomPadding = game.settings.get("stream-visibility-tools", "statusTrackerBottomPadding");
    const leftPadding = game.settings.get("stream-visibility-tools", "statusTrackerLeftPadding");
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left, top;
    
    if (hPos === "left") {
      left = leftPadding;
    } else {
      left = windowWidth - this.element[0].offsetWidth - rightPadding;
    }
    
    if (vPos === "top") {
      top = topPadding;
    } else {
      top = windowHeight - this.element[0].offsetHeight - bottomPadding;
    }
    
    return this.element.css({
      left: left + "px",
      top: top + "px"
    });
  }
}

