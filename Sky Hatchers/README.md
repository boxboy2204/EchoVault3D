# Sky Hatchers 3D

A browser game prototype about exploring a mythical sanctuary in third person, collecting eggs and growth items, customizing a ranger, hatching birds with rarity progression, and training those birds in aerial XP runs. The renderer now uses a local copy of `three.js` in the browser.

## Loop

- Explore the sanctuary in third person and pick up eggs and bird-growth items into your backpack.
- Bring eggs to the nest to hatch birds.
- Use items on your selected bird to boost growth or unlock extra abilities.
- Train birds at the launch perch in a 3D flight run to gain XP, levels, and size.
- As your flock grows stronger, rarer eggs and stronger bird species begin spawning.

## Controls

- `Click the game view`: lock the mouse and control the camera
- `WASD`: move
- `Q` or arrow keys: turn if the mouse is not locked
- `Shift`: sprint on land, dash in flight
- `E`: interact / pick up
- `1-6`: select bird
- `Space`: launch at perch or flap in flight
- `R`: restart

## Run

```bash
cd /Users/Joseph/Code/Games/Sky\ Hatchers
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

The project now includes a vendored `three.module.js` file, so the renderer does not depend on a CDN at runtime.
