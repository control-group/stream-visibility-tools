# Stream Visibility Tools

A Foundry VTT module that optimizes a designated viewer user's interface for clean, distraction-free OBS recording or streaming.

## What It Does

This module lets you assign a specific user account — typically one used in an OBS browser source — as the "viewer." Once assigned, that user's UI will be automatically customized to minimize visual noise and maximize audience clarity.

### UI Elements You Can Hide

You can individually toggle visibility for the following:

- Navigation Bar
- Sidebar Tabs
- "Players" inset
- Foundry VTT logo
- Scene Controls
- Macro Hotbar

### Minimal Sidebar Mode

Enable **Minimal Sidebar** to restrict the viewer's sidebar to only:
- Chat Log
- Settings tab

Additionally, you can configure the **sidebar height**, ideal for leaving space for a video inset or overlay.

### Combat Camera Automation

When combat starts:
- The viewer's camera auto-focuses and zooms in on the active token
- Zoom level is configurable

When combat ends:
- The camera zooms out to frame all player character tokens
- Maximum zoom level is also configurable

### Combat Tracker Automation

- When tokens are added to the combat tracker, it pops out automatically on the viewer’s screen
- When combat ends, it closes itself

## Notes & Caveats

- This is my **first Foundry module**, and my **first JavaScript project** — so expect a few rough edges.
- It was built to match exactly what I wanted for my own games — no more, no less.
- If you have ideas for how to make it better, they’re probably awesome and I just didn’t think of them yet. Suggestions and pull requests are very welcome.

## Planned Improvements

- Make the combat tracker popout's default position configurable
- Refine the "Hide UI Elements" list to remove extraneous options

## Configuration

All options are found in the **module settings**. Make sure to:
1. Assign the **Viewer User** in settings
2. Enable/disable the UI elements to hide
3. Adjust sidebar and camera settings to your stream layout

## Installation

Use the following manifest URL in Foundry VTT’s **Module Installation** menu: https://raw.githubusercontent.com/control-group/stream-visibility-tools/main/module.json

## Contributing

Have ideas or improvements? PRs are welcome! Contributions are reviewed before being merged, and by contributing you agree to license your work under the [MIT License](LICENSE).