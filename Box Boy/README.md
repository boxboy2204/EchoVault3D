# Box Boy and the Blanket Cape

A browser story-mode 2D platformer about a would-be superhero with no powers, a cardboard box helmet, box gloves, box boots, and a bright blue checkered blanket tied around his neck like a cape.

## Premise

Box Boy is on a mission to prove he can be a hero without superpowers. He runs across city rooftops, glides with his blanket cape, rescues civilians, punches through Monarch's villain crews, and fights through a story mode that builds toward the city's biggest villain.

## Controls

- `WASD` / arrow keys: move
- `Space`: jump, then hold to glide
- `J`: left punch
- `K`: right punch
- `Enter`: start or restart
- `Escape`: open the city map

## Current Structure

- 12 story-mode levels across four acts focused on reaching Monarch
- Boss fights at levels 3, 6, 9, and 12
- Route gimmicks including moving lifts, spring pads, wind lanes, hidden manhole sewer shortcuts, and shortcuts
- Heavy guard miniboss-style enemies mixed into regular stages
- Detailed pixel-style skyline backgrounds, civilian rescues, punch/stomp combat, and end-of-level beacons

## Run

Serve the folder with a local web server:

```bash
cd /Users/Joseph/Code/Games/Box\ Boy
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).
