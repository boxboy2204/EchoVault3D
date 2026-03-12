const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const hud = document.getElementById("hud");
const mission = document.getElementById("mission");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = new Set();

const GRAVITY = 1800;
const MOVE_SPEED = 265;
const CROUCH_SPEED = 108;
const JUMP_SPEED = 690;
const GLIDE_GRAVITY = 320;
const GLIDE_FALL_SPEED = 170;
const WORLD_FLOOR = 512;
const PUNCH_DURATION = 0.16;
const PUNCH_COOLDOWN = 0.24;
const SAVE_KEY = "box_boy_story_save_v1";

const scenes = {
  title: "title",
  map: "map",
  story: "story",
  playing: "playing",
  levelClear: "levelClear",
  gameOver: "gameOver",
  win: "win",
};

const storyBeats = [
  {
    title: "Cutscene 1: The Dare",
    body:
      "The city already has a name everyone fears: Monarch, the biggest villain in the skyline. Box Boy has no powers, no backup, and no business going after him. He goes anyway.",
  },
  {
    title: "Cutscene 2: First Witnesses",
    body:
      "Every rescue makes the rumor bigger. People stop asking who the kid in the blanket cape is and start asking why Monarch's crews keep failing to stop him.",
  },
  {
    title: "Cutscene 3: Climbing Higher",
    body:
      "Monarch finally notices. The rooftops get meaner, the parkour gets harder, and every district adds a new trap meant to prove Box Boy is out of his league.",
  },
  {
    title: "Cutscene 4: The Whole City Watching",
    body:
      "The final run is not about surviving the skyline anymore. It is about reaching Monarch, beating the city's biggest villain in public, and proving Box Boy belongs up there.",
  },
];

const levels = [
  {
    id: "alley-run",
    name: "Level 1: Lantern Alley",
    chapter: "Act 1: First Shift",
    goal: "Cross the market rooftops, hit the spring signs, and rescue 3 civilians.",
    story:
      "A blackout hits the Old Market blocks after Monarch's crews move in. Box Boy starts in the alley because if he can save this block, people might finally believe he can reach the villain behind it.",
    background: "market-night",
    civiliansTarget: 3,
    endX: 3880,
    platforms: [
      { x: 0, y: 520, w: 4100, h: 140, type: "ground" },
      { x: 190, y: 430, w: 180, h: 20, type: "roof" },
      { x: 470, y: 360, w: 160, h: 20, type: "roof" },
      { x: 720, y: 320, w: 140, h: 20, type: "spring" },
      { x: 940, y: 390, w: 150, h: 20, type: "ac" },
      { x: 1180, y: 300, w: 180, h: 20, type: "roof" },
      { x: 1480, y: 246, w: 170, h: 20, type: "roof" },
      { x: 1730, y: 340, w: 160, h: 20, type: "fireescape" },
      { x: 1990, y: 270, w: 190, h: 20, type: "roof" },
      { x: 2270, y: 410, w: 150, h: 20, type: "ac" },
      { x: 2460, y: 332, w: 180, h: 20, type: "fireescape" },
      { x: 2700, y: 254, w: 160, h: 20, type: "roof" },
      { x: 2920, y: 198, w: 160, h: 20, type: "roof" },
      { x: 3160, y: 300, w: 180, h: 20, type: "sign" },
      { x: 3390, y: 236, w: 170, h: 20, type: "roof" },
      { x: 3620, y: 168, w: 160, h: 20, type: "roof" },
      { x: 2440, y: 188, w: 120, h: 20, type: "roof" },
      { x: 2580, y: 150, w: 110, h: 20, type: "roof" },
      { x: 2720, y: 118, w: 120, h: 20, type: "roof" },
    ],
    civilians: [
      { x: 1240, y: 252, name: "Riley" },
      { x: 2050, y: 222, name: "Mrs. Vega" },
      { x: 3480, y: 188, name: "Mr. Holloway" },
    ],
    enemies: [
      { x: 610, type: "walker" },
      { x: 1120, type: "walker" },
      { x: 1840, y: 306, type: "drone" },
      { x: 2360, type: "walker" },
      { x: 2850, y: 94, type: "drone" },
      { x: 3340, type: "walker" },
    ],
    windZones: [{ x: 2660, y: 70, w: 280, h: 210, fx: 48, fy: -110 }],
  },
  {
    id: "train-yard",
    name: "Level 2: Freightline Sprint",
    chapter: "Act 1: First Shift",
    goal: "Use the crane route, beat the enforcer lookout, and rescue 3 civilians.",
    story:
      "Monarch's freight crews are locking down the district. If Box Boy can cross the crane line and bring people back, the rumor of a real hero stops sounding impossible.",
    background: "freight-dawn",
    civiliansTarget: 3,
    endX: 4260,
    platforms: [
      { x: 0, y: 520, w: 4500, h: 140, type: "ground" },
      { x: 160, y: 430, w: 210, h: 20, type: "container" },
      { x: 430, y: 350, w: 190, h: 20, type: "container" },
      { x: 700, y: 280, w: 180, h: 20, type: "crane" },
      { x: 1010, y: 390, w: 170, h: 20, type: "train" },
      { x: 1300, y: 320, w: 160, h: 20, type: "container" },
      { x: 1560, y: 250, w: 200, h: 20, type: "crane" },
      { x: 1890, y: 350, w: 190, h: 20, type: "container" },
      { x: 2210, y: 280, w: 220, h: 20, type: "train" },
      { x: 2490, y: 390, w: 180, h: 20, type: "train" },
      { x: 2740, y: 316, w: 180, h: 20, type: "container" },
      { x: 3020, y: 240, w: 220, h: 20, type: "crane" },
      { x: 3340, y: 170, w: 180, h: 20, type: "crane" },
      { x: 3600, y: 260, w: 180, h: 20, type: "train" },
      { x: 3890, y: 340, w: 200, h: 20, type: "container" },
      { x: 3170, y: 122, w: 120, h: 20, type: "container" },
      { x: 3320, y: 92, w: 110, h: 20, type: "container" },
      { x: 3470, y: 62, w: 120, h: 20, type: "container" },
    ],
    movingPlatforms: [
      { x: 2100, y: 220, w: 120, h: 18, type: "moving", axis: "y", range: 72, speed: 1.5, phase: 0 },
      { x: 2860, y: 280, w: 120, h: 18, type: "moving", axis: "x", range: 84, speed: 1.2, phase: 1.4 },
    ],
    civilians: [
      { x: 1650, y: 202, name: "Dockworker Lee" },
      { x: 2350, y: 232, name: "Nadia" },
      { x: 3940, y: 292, name: "Tamsin" },
    ],
    enemies: [
      { x: 560, type: "walker" },
      { x: 1160, y: 356, type: "drone" },
      { x: 1750, type: "walker" },
      { x: 2050, y: 306, type: "drone" },
      { x: 2660, type: "enforcer" },
      { x: 3240, y: 114, type: "drone" },
      { x: 3760, type: "walker" },
    ],
  },
  {
    id: "signal-bridge",
    name: "Boss 1: Signal Bridge",
    chapter: "Act 1: First Shift",
    goal: "Reach the locked bridge tower and beat the Signal Warden.",
    story:
      "The Signal Warden is Monarch's first public warning: turn back or get humiliated on live screens across the city. Box Boy takes that personally.",
    background: "bridge-storm",
    civiliansTarget: 1,
    endX: 2640,
    boss: {
      type: "signal",
      name: "Signal Warden",
      hp: 10,
      arenaStart: 1700,
      arenaEnd: 2500,
    },
    platforms: [
      { x: 0, y: 520, w: 2860, h: 140, type: "ground" },
      { x: 240, y: 390, w: 180, h: 20, type: "beam" },
      { x: 540, y: 330, w: 180, h: 20, type: "beam" },
      { x: 840, y: 280, w: 170, h: 20, type: "beam" },
      { x: 1150, y: 330, w: 160, h: 20, type: "beam" },
      { x: 1420, y: 240, w: 160, h: 20, type: "beam" },
      { x: 1620, y: 360, w: 170, h: 20, type: "beam" },
      { x: 1840, y: 300, w: 170, h: 20, type: "beam" },
      { x: 2080, y: 240, w: 160, h: 20, type: "beam" },
      { x: 2310, y: 320, w: 160, h: 20, type: "beam" },
    ],
    civilians: [{ x: 1320, y: 474, name: "Courier Pru" }],
    enemies: [
      { x: 680, type: "walker" },
      { x: 980, y: 236, type: "drone" },
      { x: 1540, type: "walker" },
    ],
  },
  {
    id: "midtown-rise",
    name: "Level 4: Midtown Rise",
    chapter: "Act 2: Midtown Pressure",
    goal: "Climb the district towers, use moving billboards, and rescue 4 civilians.",
    story:
      "Now the whole district is watching. Box Boy pushes higher into Midtown because every rooftop cleared gets him one step closer to Monarch's tower.",
    background: "midtown-noon",
    civiliansTarget: 4,
    endX: 4680,
    platforms: [
      { x: 0, y: 520, w: 4900, h: 140, type: "ground" },
      { x: 200, y: 430, w: 150, h: 20, type: "roof" },
      { x: 440, y: 370, w: 150, h: 20, type: "roof" },
      { x: 650, y: 310, w: 150, h: 20, type: "roof" },
      { x: 910, y: 250, w: 180, h: 20, type: "roof" },
      { x: 1220, y: 330, w: 160, h: 20, type: "roof" },
      { x: 1450, y: 260, w: 170, h: 20, type: "sign" },
      { x: 1710, y: 190, w: 160, h: 20, type: "roof" },
      { x: 1990, y: 310, w: 160, h: 20, type: "roof" },
      { x: 2230, y: 240, w: 150, h: 20, type: "roof" },
      { x: 2460, y: 170, w: 170, h: 20, type: "roof" },
      { x: 2720, y: 260, w: 190, h: 20, type: "roof" },
      { x: 3010, y: 340, w: 180, h: 20, type: "roof" },
      { x: 3260, y: 270, w: 170, h: 20, type: "sign" },
      { x: 3510, y: 190, w: 160, h: 20, type: "roof" },
      { x: 3750, y: 250, w: 170, h: 20, type: "roof" },
      { x: 3980, y: 180, w: 170, h: 20, type: "roof" },
      { x: 4230, y: 120, w: 160, h: 20, type: "roof" },
      { x: 4470, y: 220, w: 170, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1600, y: 230, w: 108, h: 18, type: "moving", axis: "y", range: 80, speed: 1.7, phase: 0.8 },
      { x: 3330, y: 142, w: 112, h: 18, type: "moving", axis: "x", range: 94, speed: 1.5, phase: 2.1 },
    ],
    civilians: [
      { x: 1290, y: 282, name: "Theo" },
      { x: 2280, y: 192, name: "Ava" },
      { x: 2780, y: 212, name: "Mr. Ortega" },
      { x: 4300, y: 72, name: "Selene" },
    ],
    enemies: [
      { x: 570, type: "walker" },
      { x: 1090, type: "walker" },
      { x: 1600, y: 216, type: "drone" },
      { x: 2370, y: 196, type: "drone" },
      { x: 3140, type: "walker" },
      { x: 3660, y: 156, type: "drone" },
      { x: 4380, type: "walker" },
    ],
  },
  {
    id: "skyline-arc",
    name: "Level 5: Skyline Arc",
    chapter: "Act 2: Midtown Pressure",
    goal: "Ride the wind lanes, beat the rooftop enforcer, and rescue 3 civilians.",
    story:
      "This is the part where a real superhero would fly. Box Boy cannot fly, but he can still cross Monarch's windblown skyline one desperate glide at a time.",
    background: "skyline-sunset",
    civiliansTarget: 3,
    endX: 4480,
    platforms: [
      { x: 0, y: 520, w: 4700, h: 140, type: "ground" },
      { x: 180, y: 390, w: 150, h: 20, type: "roof" },
      { x: 420, y: 320, w: 130, h: 20, type: "roof" },
      { x: 690, y: 260, w: 150, h: 20, type: "roof" },
      { x: 1010, y: 180, w: 160, h: 20, type: "roof" },
      { x: 1380, y: 260, w: 170, h: 20, type: "roof" },
      { x: 1690, y: 200, w: 180, h: 20, type: "roof" },
      { x: 2030, y: 260, w: 170, h: 20, type: "roof" },
      { x: 2350, y: 180, w: 170, h: 20, type: "roof" },
      { x: 2640, y: 280, w: 180, h: 20, type: "roof" },
      { x: 2940, y: 220, w: 180, h: 20, type: "roof" },
      { x: 3220, y: 140, w: 180, h: 20, type: "roof" },
      { x: 3500, y: 210, w: 170, h: 20, type: "roof" },
      { x: 3740, y: 130, w: 160, h: 20, type: "roof" },
      { x: 3980, y: 200, w: 170, h: 20, type: "roof" },
      { x: 4230, y: 120, w: 180, h: 20, type: "roof" },
      { x: 3160, y: 80, w: 110, h: 20, type: "spring" },
      { x: 3310, y: 52, w: 110, h: 20, type: "roof" },
      { x: 3460, y: 24, w: 120, h: 20, type: "roof" },
    ],
    civilians: [
      { x: 1420, y: 212, name: "Paramedic Sloane" },
      { x: 2720, y: 232, name: "Jay" },
      { x: 4300, y: 92, name: "Niko" },
    ],
    enemies: [
      { x: 820, type: "walker" },
      { x: 1550, y: 216, type: "drone" },
      { x: 2200, type: "walker" },
      { x: 3020, type: "enforcer" },
      { x: 3620, y: 106, type: "drone" },
      { x: 4170, y: 176, type: "drone" },
    ],
    windZones: [
      { x: 900, y: 80, w: 420, h: 250, fx: 62, fy: -160 },
      { x: 3180, y: 0, w: 420, h: 180, fx: 76, fy: -120 },
    ],
  },
  {
    id: "city-hall-siege",
    name: "Boss 2: City Hall Siege",
    chapter: "Act 2: Midtown Pressure",
    goal: "Break through the plaza lockdown and defeat the Graft King.",
    story:
      "The Graft King runs Monarch's civic lockdown. Box Boy heads straight for the barricade because every boss under Monarch is one less wall between him and the real target.",
    background: "civic-night",
    civiliansTarget: 1,
    endX: 5020,
    boss: {
      type: "graft",
      name: "Graft King",
      hp: 12,
      arenaStart: 3460,
      arenaEnd: 4900,
    },
    platforms: [
      { x: 0, y: 520, w: 5280, h: 140, type: "ground" },
      { x: 170, y: 430, w: 190, h: 20, type: "steps" },
      { x: 470, y: 360, w: 160, h: 20, type: "steps" },
      { x: 760, y: 290, w: 170, h: 20, type: "steps" },
      { x: 1070, y: 220, w: 180, h: 20, type: "steps" },
      { x: 1420, y: 320, w: 180, h: 20, type: "ledge" },
      { x: 1700, y: 250, w: 160, h: 20, type: "ledge" },
      { x: 1960, y: 180, w: 180, h: 20, type: "ledge" },
      { x: 2280, y: 280, w: 180, h: 20, type: "ledge" },
      { x: 2580, y: 210, w: 180, h: 20, type: "ledge" },
      { x: 2870, y: 150, w: 170, h: 20, type: "ledge" },
      { x: 3150, y: 260, w: 180, h: 20, type: "ledge" },
      { x: 3400, y: 190, w: 180, h: 20, type: "ledge" },
      { x: 3660, y: 120, w: 170, h: 20, type: "ledge" },
      { x: 3920, y: 220, w: 180, h: 20, type: "ledge" },
      { x: 4200, y: 150, w: 180, h: 20, type: "ledge" },
      { x: 4470, y: 90, w: 170, h: 20, type: "ledge" },
      { x: 4740, y: 170, w: 180, h: 20, type: "ledge" },
    ],
    movingPlatforms: [
      { x: 3720, y: 330, w: 118, h: 18, type: "moving", axis: "y", range: 150, speed: 2.1, phase: 0.5 },
      { x: 4320, y: 284, w: 118, h: 18, type: "moving", axis: "y", range: 168, speed: 1.9, phase: 2.4 },
    ],
    civilians: [{ x: 2920, y: 102, name: "Mayor's Aide Ben" }],
    enemies: [
      { x: 660, type: "walker" },
      { x: 1250, type: "walker" },
      { x: 1860, y: 206, type: "drone" },
      { x: 2700, y: 156, type: "drone" },
      { x: 3260, type: "enforcer" },
    ],
  },
  {
    id: "skycourt-terrace",
    name: "Level 7: Skycourt Terrace",
    chapter: "Act 3: Upper City",
    goal: "Cross the civic rooftops, ride the lift decks, and rescue 4 civilians.",
    story:
      "With the plaza open again, Box Boy heads into the upper city. Monarch's rich district looks clean from the street, but the rooftops are all traps and patrol routes.",
    background: "midtown-noon",
    civiliansTarget: 4,
    endX: 5220,
    platforms: [
      { x: 0, y: 520, w: 5440, h: 140, type: "ground" },
      { x: 180, y: 430, w: 170, h: 20, type: "ledge" },
      { x: 450, y: 350, w: 170, h: 20, type: "ledge" },
      { x: 730, y: 280, w: 170, h: 20, type: "ledge" },
      { x: 1060, y: 350, w: 160, h: 20, type: "roof" },
      { x: 1330, y: 270, w: 170, h: 20, type: "roof" },
      { x: 1650, y: 200, w: 180, h: 20, type: "roof" },
      { x: 1960, y: 280, w: 170, h: 20, type: "roof" },
      { x: 2240, y: 210, w: 180, h: 20, type: "roof" },
      { x: 2540, y: 140, w: 180, h: 20, type: "roof" },
      { x: 2890, y: 220, w: 170, h: 20, type: "roof" },
      { x: 3220, y: 160, w: 180, h: 20, type: "roof" },
      { x: 3510, y: 260, w: 190, h: 20, type: "roof" },
      { x: 3830, y: 190, w: 170, h: 20, type: "roof" },
      { x: 4130, y: 120, w: 170, h: 20, type: "roof" },
      { x: 4460, y: 180, w: 170, h: 20, type: "roof" },
      { x: 4750, y: 120, w: 180, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 930, y: 300, w: 110, h: 18, type: "moving", axis: "y", range: 110, speed: 1.6, phase: 0.2 },
      { x: 3610, y: 220, w: 110, h: 18, type: "moving", axis: "x", range: 130, speed: 1.8, phase: 1.2 },
    ],
    civilians: [
      { x: 1140, y: 302, name: "Elio" },
      { x: 2290, y: 162, name: "Carmen" },
      { x: 3560, y: 212, name: "Mr. Yuan" },
      { x: 4820, y: 72, name: "Priya" },
    ],
    enemies: [
      { x: 640, type: "walker" },
      { x: 1500, type: "walker" },
      { x: 2120, y: 180, type: "drone" },
      { x: 2980, type: "walker" },
      { x: 3920, y: 160, type: "drone" },
      { x: 4610, type: "walker" },
    ],
  },
  {
    id: "skyrail-chase",
    name: "Level 8: Skyrail Chase",
    chapter: "Act 3: Upper City",
    goal: "Leap between rail cars, use the launch pads, and rescue 3 civilians.",
    story:
      "Monarch's crews start moving gear toward the central tower on the skyrail. Box Boy stays on the chase even when the whole route keeps shifting under his feet.",
    background: "freight-dawn",
    civiliansTarget: 3,
    endX: 5480,
    platforms: [
      { x: 0, y: 520, w: 5700, h: 140, type: "ground" },
      { x: 220, y: 430, w: 170, h: 20, type: "train" },
      { x: 520, y: 370, w: 170, h: 20, type: "train" },
      { x: 820, y: 300, w: 140, h: 20, type: "spring" },
      { x: 1110, y: 230, w: 170, h: 20, type: "train" },
      { x: 1420, y: 330, w: 170, h: 20, type: "container" },
      { x: 1710, y: 260, w: 170, h: 20, type: "train" },
      { x: 2040, y: 180, w: 170, h: 20, type: "train" },
      { x: 2360, y: 260, w: 170, h: 20, type: "container" },
      { x: 2670, y: 180, w: 170, h: 20, type: "train" },
      { x: 2980, y: 260, w: 170, h: 20, type: "container" },
      { x: 3320, y: 190, w: 170, h: 20, type: "train" },
      { x: 3630, y: 260, w: 170, h: 20, type: "container" },
      { x: 3940, y: 180, w: 170, h: 20, type: "train" },
      { x: 4270, y: 110, w: 180, h: 20, type: "train" },
      { x: 4600, y: 190, w: 170, h: 20, type: "container" },
      { x: 4920, y: 120, w: 180, h: 20, type: "train" },
    ],
    movingPlatforms: [
      { x: 1500, y: 370, w: 112, h: 18, type: "moving", axis: "x", range: 150, speed: 2.2, phase: 0.1 },
      { x: 3430, y: 250, w: 112, h: 18, type: "moving", axis: "x", range: 160, speed: 2.4, phase: 1.8 },
    ],
    civilians: [
      { x: 1780, y: 212, name: "Mina" },
      { x: 3390, y: 142, name: "Rook" },
      { x: 5000, y: 72, name: "Nurse Ada" },
    ],
    enemies: [
      { x: 690, type: "walker" },
      { x: 1590, type: "enforcer" },
      { x: 2460, y: 220, type: "drone" },
      { x: 3180, type: "walker" },
      { x: 4100, y: 140, type: "drone" },
      { x: 4750, type: "walker" },
    ],
    windZones: [{ x: 4040, y: 20, w: 550, h: 220, fx: 70, fy: -140 }],
  },
  {
    id: "rivet-rex",
    name: "Boss 3: Rivet Rex",
    chapter: "Act 3: Upper City",
    goal: "Enter the foundry roof and defeat Rivet Rex before the district collapses.",
    story:
      "Rivet Rex is Monarch's rooftop bruiser, a charging wrecking-machine turned loose over the foundry. If Box Boy can survive him, the city will know this is not pretend anymore.",
    background: "bridge-storm",
    civiliansTarget: 1,
    endX: 3540,
    boss: {
      type: "rivet",
      name: "Rivet Rex",
      hp: 13,
      arenaStart: 2240,
      arenaEnd: 3420,
    },
    platforms: [
      { x: 0, y: 520, w: 3780, h: 140, type: "ground" },
      { x: 240, y: 390, w: 180, h: 20, type: "beam" },
      { x: 570, y: 320, w: 160, h: 20, type: "beam" },
      { x: 860, y: 250, w: 170, h: 20, type: "beam" },
      { x: 1180, y: 330, w: 170, h: 20, type: "beam" },
      { x: 1480, y: 250, w: 170, h: 20, type: "beam" },
      { x: 1790, y: 180, w: 180, h: 20, type: "beam" },
      { x: 2070, y: 280, w: 170, h: 20, type: "beam" },
      { x: 2320, y: 210, w: 170, h: 20, type: "beam" },
      { x: 2590, y: 140, w: 170, h: 20, type: "beam" },
      { x: 2860, y: 220, w: 170, h: 20, type: "beam" },
      { x: 3150, y: 150, w: 170, h: 20, type: "beam" },
    ],
    civilians: [{ x: 1580, y: 472, name: "Foreman Jules" }],
    enemies: [
      { x: 660, type: "walker" },
      { x: 1110, y: 300, type: "drone" },
      { x: 1700, type: "walker" },
    ],
  },
  {
    id: "neon-warrens",
    name: "Level 10: Neon Warrens",
    chapter: "Act 4: Last Push",
    goal: "Navigate the neon backstreets, take the side vents, and rescue 4 civilians.",
    story:
      "The lower skyline is glowing again, but Monarch's crews own every straight road. Box Boy dives into the side routes and vents because the hard way is the only open one.",
    background: "market-night",
    civiliansTarget: 4,
    endX: 5660,
    platforms: [
      { x: 0, y: 520, w: 5900, h: 140, type: "ground" },
      { x: 170, y: 430, w: 170, h: 20, type: "roof" },
      { x: 410, y: 360, w: 160, h: 20, type: "sign" },
      { x: 670, y: 300, w: 160, h: 20, type: "roof" },
      { x: 940, y: 230, w: 170, h: 20, type: "roof" },
      { x: 1230, y: 310, w: 170, h: 20, type: "ac" },
      { x: 1510, y: 230, w: 170, h: 20, type: "roof" },
      { x: 1780, y: 150, w: 170, h: 20, type: "roof" },
      { x: 2100, y: 240, w: 160, h: 20, type: "roof" },
      { x: 2390, y: 320, w: 170, h: 20, type: "roof" },
      { x: 2710, y: 250, w: 170, h: 20, type: "fireescape" },
      { x: 3000, y: 170, w: 170, h: 20, type: "roof" },
      { x: 3290, y: 250, w: 170, h: 20, type: "roof" },
      { x: 3600, y: 180, w: 170, h: 20, type: "roof" },
      { x: 3920, y: 110, w: 170, h: 20, type: "roof" },
      { x: 4210, y: 190, w: 170, h: 20, type: "roof" },
      { x: 4510, y: 120, w: 170, h: 20, type: "roof" },
      { x: 4820, y: 200, w: 170, h: 20, type: "roof" },
      { x: 5140, y: 130, w: 170, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1120, y: 180, w: 110, h: 18, type: "moving", axis: "y", range: 120, speed: 1.9, phase: 0.8 },
      { x: 3490, y: 120, w: 110, h: 18, type: "moving", axis: "x", range: 126, speed: 1.4, phase: 2.8 },
    ],
    civilians: [
      { x: 1270, y: 262, name: "Marta" },
      { x: 2440, y: 272, name: "Wes" },
      { x: 3960, y: 62, name: "Ivy" },
      { x: 5200, y: 82, name: "Dax" },
    ],
    enemies: [
      { x: 760, type: "walker" },
      { x: 1690, y: 190, type: "drone" },
      { x: 2580, type: "walker" },
      { x: 3330, type: "enforcer" },
      { x: 4360, y: 150, type: "drone" },
      { x: 5010, type: "walker" },
    ],
    windZones: [{ x: 2920, y: 70, w: 420, h: 200, fx: 52, fy: -100 }],
  },
  {
    id: "blackout-heights",
    name: "Level 11: Blackout Heights",
    chapter: "Act 4: Last Push",
    goal: "Glide through the blackout towers, beat the heavy guard, and rescue 4 civilians.",
    story:
      "The power grid fails again just as Monarch seals the last district. With the skyline dark, Box Boy has to make his own route through the tower blackout.",
    background: "civic-night",
    civiliansTarget: 4,
    endX: 5980,
    platforms: [
      { x: 0, y: 520, w: 6200, h: 140, type: "ground" },
      { x: 220, y: 430, w: 170, h: 20, type: "roof" },
      { x: 510, y: 350, w: 170, h: 20, type: "roof" },
      { x: 860, y: 280, w: 170, h: 20, type: "spring" },
      { x: 1180, y: 190, w: 170, h: 20, type: "roof" },
      { x: 1490, y: 270, w: 170, h: 20, type: "roof" },
      { x: 1810, y: 200, w: 180, h: 20, type: "roof" },
      { x: 2110, y: 280, w: 170, h: 20, type: "roof" },
      { x: 2460, y: 210, w: 180, h: 20, type: "roof" },
      { x: 2820, y: 120, w: 180, h: 20, type: "roof" },
      { x: 3180, y: 220, w: 180, h: 20, type: "roof" },
      { x: 3500, y: 150, w: 170, h: 20, type: "roof" },
      { x: 3820, y: 240, w: 170, h: 20, type: "roof" },
      { x: 4140, y: 160, w: 170, h: 20, type: "roof" },
      { x: 4480, y: 80, w: 170, h: 20, type: "roof" },
      { x: 4820, y: 160, w: 170, h: 20, type: "roof" },
      { x: 5160, y: 100, w: 180, h: 20, type: "roof" },
      { x: 5480, y: 180, w: 170, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1320, y: 290, w: 116, h: 18, type: "moving", axis: "x", range: 140, speed: 1.7, phase: 0.4 },
      { x: 4650, y: 110, w: 116, h: 18, type: "moving", axis: "y", range: 150, speed: 2.0, phase: 1.7 },
    ],
    civilians: [
      { x: 1220, y: 142, name: "Nell" },
      { x: 2500, y: 162, name: "Omar" },
      { x: 4200, y: 112, name: "Syd" },
      { x: 5540, y: 132, name: "Mara's Brother" },
    ],
    enemies: [
      { x: 760, type: "walker" },
      { x: 1700, type: "enforcer" },
      { x: 2660, y: 170, type: "drone" },
      { x: 3600, type: "walker" },
      { x: 4540, y: 120, type: "drone" },
      { x: 5360, type: "walker" },
    ],
    windZones: [
      { x: 760, y: 40, w: 700, h: 260, fx: 82, fy: -180 },
      { x: 4300, y: 0, w: 820, h: 240, fx: 68, fy: -130 },
    ],
  },
  {
    id: "finale",
    name: "Final Boss: Monarch",
    chapter: "Act 4: Last Push",
    goal: "Reach Monarch's rooftop, rescue Mara, and defeat the city's biggest villain.",
    story:
      "At the top of the skyline, Monarch waits with the Vacuum Dragon war machine and the whole city watching below. This is the proof Box Boy came for.",
    background: "finale-red",
    civiliansTarget: 1,
    endX: 3320,
    boss: {
      type: "dragon",
      name: "Monarch",
      hp: 15,
      arenaStart: 2180,
      arenaEnd: 3220,
    },
    platforms: [
      { x: 0, y: 520, w: 3540, h: 140, type: "ground" },
      { x: 250, y: 410, w: 180, h: 20, type: "roof" },
      { x: 550, y: 330, w: 180, h: 20, type: "roof" },
      { x: 860, y: 260, w: 180, h: 20, type: "roof" },
      { x: 1210, y: 310, w: 180, h: 20, type: "roof" },
      { x: 1540, y: 240, w: 180, h: 20, type: "roof" },
      { x: 1820, y: 190, w: 180, h: 20, type: "roof" },
      { x: 2060, y: 280, w: 180, h: 20, type: "roof" },
      { x: 2320, y: 220, w: 170, h: 20, type: "roof" },
      { x: 2570, y: 160, w: 170, h: 20, type: "roof" },
      { x: 2820, y: 230, w: 180, h: 20, type: "roof" },
      { x: 3060, y: 170, w: 170, h: 20, type: "roof" },
    ],
    civilians: [{ x: 1460, y: 474, name: "Mara" }],
    enemies: [
      { x: 760, type: "walker" },
      { x: 1100, y: 216, type: "drone" },
      { x: 1730, y: 146, type: "drone" },
      { x: 2280, type: "walker" },
      { x: 2760, y: 136, type: "drone" },
    ],
  },
];

for (const level of levels) {
  if (!level.boss) {
    const extraPlatforms = [];
    for (const platform of level.platforms) {
      if ((platform.type === "roof" || platform.type === "ledge" || platform.type === "container") && platform.w >= 150 && platform.y > 140) {
        extraPlatforms.push({
          x: platform.x + 26,
          y: platform.y - 76,
          w: Math.max(92, Math.min(126, platform.w - 40)),
          h: 16,
          type: platform.type === "container" ? "roof" : "sign",
        });
      }
    }
    level.platforms.push(...extraPlatforms.slice(0, 10));

    const extraEnemies = [];
    for (const platform of level.platforms) {
      if ((platform.type === "roof" || platform.type === "ledge" || platform.type === "sign") && platform.y < 420 && platform.w >= 90) {
        const shouldAdd = (Math.floor(platform.x / 170) % 3) === 1;
        if (shouldAdd) {
          extraEnemies.push({
            x: platform.x + Math.max(12, (platform.w / 2) - 18),
            y: platform.y - 26,
            type: platform.y < 220 ? "drone" : "walker",
          });
        }
      }
    }
    level.enemies.push(...extraEnemies.slice(0, 12));
  }
}

const state = {
  scene: scenes.title,
  sceneIndex: 0,
  levelIndex: 0,
  highestUnlockedLevel: 0,
  mapSelection: 0,
  level: null,
  player: null,
  enemies: [],
  civilians: [],
  dynamicPlatforms: [],
  unlockedSewers: new Set(),
  charges: [],
  projectiles: [],
  boss: null,
  particles: [],
  cameraX: 0,
  cameraY: 0,
  message: "Press Enter to begin Story Mode.",
  totalRescues: 0,
  totalDefeats: 0,
  storyCard: 0,
  transitionTimer: 0,
  lastTime: 0,
};

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const save = JSON.parse(raw);
    state.highestUnlockedLevel = clamp(save.highestUnlockedLevel ?? 0, 0, levels.length - 1);
    state.levelIndex = clamp(save.levelIndex ?? 0, 0, levels.length - 1);
    state.mapSelection = clamp(save.mapSelection ?? state.levelIndex, 0, levels.length - 1);
    state.totalRescues = Math.max(0, save.totalRescues ?? 0);
    state.totalDefeats = Math.max(0, save.totalDefeats ?? 0);
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
}

function saveProgress() {
  const save = {
    highestUnlockedLevel: state.highestUnlockedLevel,
    levelIndex: state.levelIndex,
    mapSelection: state.mapSelection,
    totalRescues: state.totalRescues,
    totalDefeats: state.totalDefeats,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function makePlayer() {
  return {
    x: 80,
    y: 440,
    w: 36,
    h: 74,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    hp: 5,
    invuln: 0,
    rescues: 0,
    glideTime: 0,
    jumpsLeft: 2,
    punchTimer: 0,
    punchCooldown: 0,
    punchSide: "left",
    walkCycle: 0,
    supportPlatform: null,
    sewerCooldown: 0,
    crouching: false,
  };
}

function makeEnemy(base) {
  const isDrone = base.type === "drone";
  const isEnforcer = base.type === "enforcer";
  return {
    x: base.x,
    y: isDrone ? base.y || 280 : isEnforcer ? 454 : 470,
    w: isDrone ? 34 : isEnforcer ? 52 : 38,
    h: isDrone ? 26 : isEnforcer ? 52 : 36,
    type: base.type,
    vx: isDrone ? 0 : (Math.random() > 0.5 ? 1 : -1) * (isEnforcer ? 52 : 70),
    baseY: isDrone ? base.y || 280 : isEnforcer ? 454 : 470,
    phase: rand(0, Math.PI * 2),
    hp: isEnforcer ? 3 : 1,
    maxHp: isEnforcer ? 3 : 1,
    cooldown: rand(0.4, 1.2),
  };
}

function makeBoss(def) {
  return {
    type: def.type,
    name: def.name,
    x: def.arenaStart + 220,
    y: def.type === "dragon" ? 390 : def.type === "graft" ? 398 : def.type === "rivet" ? 248 : 280,
    w: def.type === "dragon" ? 170 : def.type === "graft" ? 124 : def.type === "rivet" ? 142 : 120,
    h: def.type === "dragon" ? 98 : def.type === "graft" ? 108 : def.type === "rivet" ? 86 : 72,
    hp: def.hp,
    maxHp: def.hp,
    dir: 1,
    cooldown: 0,
    phase: 0,
    vulnerable: def.type === "signal",
    stun: 0,
    attack: "idle",
  };
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-180, 180),
      vy: rand(-200, 60),
      size: rand(2, 5),
      life: rand(0.4, 0.9),
      color,
    });
  }
}

function resetLevel(index) {
  const level = levels[index];
  state.levelIndex = index;
  state.level = level;
  state.player = makePlayer();
  state.enemies = level.enemies.map(makeEnemy);
  state.civilians = level.civilians.map((civ) => ({ ...civ, rescued: false, w: 24, h: 36 }));
  state.dynamicPlatforms = (level.movingPlatforms || []).map((platform) => ({
    ...platform,
    baseX: platform.x,
    baseY: platform.y,
    prevX: platform.x,
    prevY: platform.y,
  }));
  state.unlockedSewers = new Set();
  state.charges = [];
  state.projectiles = [];
  state.boss = level.boss ? makeBoss(level.boss) : null;
  state.particles = [];
  state.cameraX = 0;
  state.cameraY = 0;
  state.message = level.story;
  state.transitionTimer = 2.8;
  saveProgress();
}

function setScene(scene) {
  state.scene = scene;
}

function advanceLevel() {
  state.highestUnlockedLevel = Math.max(state.highestUnlockedLevel, Math.min(levels.length - 1, state.levelIndex + 1));
  saveProgress();
  if (state.levelIndex + 1 >= levels.length) {
    setScene(scenes.win);
    state.message = "Monarch is down. The city finally sees Box Boy for what he is: a real hero who earned it.";
    return;
  }

  resetLevel(state.levelIndex + 1);
  setScene(scenes.story);
  state.storyCard = Math.min(storyBeats.length - 1, Math.floor((state.levelIndex + 1) / 3));
}

function startStoryMode() {
  state.totalRescues = 0;
  state.totalDefeats = 0;
  state.highestUnlockedLevel = Math.max(state.highestUnlockedLevel, 0);
  resetLevel(0);
  setScene(scenes.story);
  state.storyCard = 0;
  saveProgress();
}

function getWorldWidth() {
  return state.level.endX + 320;
}

function getWorldHeight() {
  return (SEWER_LAYOUTS[state.level.id] ? 980 : HEIGHT) + 80;
}

function getPlatforms() {
  return state.level.platforms.concat(state.dynamicPlatforms, getSewerPlatforms());
}

function getWindZones() {
  return state.level.windZones || [];
}

function getManholes() {
  return MANHOLE_LAYOUTS[state.level.id] || [];
}

function getSewerPlatforms() {
  return (SEWER_LAYOUTS[state.level.id] || []).filter((platform) => !platform.requires || state.unlockedSewers?.has(platform.requires));
}

const HAZARD_LAYOUTS = {
  "alley-run": [
    { x: 820, y: 502, w: 56, h: 18, type: "spikes" },
    { x: 1670, y: 322, w: 48, h: 18, type: "crate" },
    { x: 2550, y: 102, w: 54, h: 18, type: "crate" },
    { x: 3280, y: 502, w: 72, h: 18, type: "spikes" },
  ],
  "train-yard": [
    { x: 910, y: 502, w: 64, h: 18, type: "spikes" },
    { x: 1760, y: 222, w: 52, h: 18, type: "crate" },
    { x: 3060, y: 220, w: 56, h: 18, type: "crate" },
    { x: 3870, y: 502, w: 84, h: 18, type: "laser" },
  ],
  "signal-bridge": [
    { x: 1280, y: 502, w: 90, h: 18, type: "laser" },
    { x: 1940, y: 502, w: 90, h: 18, type: "laser" },
  ],
  "midtown-rise": [
    { x: 1540, y: 502, w: 72, h: 18, type: "spikes" },
    { x: 2140, y: 220, w: 56, h: 18, type: "crate" },
    { x: 3570, y: 170, w: 56, h: 18, type: "crate" },
    { x: 4080, y: 502, w: 82, h: 18, type: "spikes" },
  ],
  "skyline-arc": [
    { x: 1220, y: 502, w: 72, h: 18, type: "spikes" },
    { x: 2140, y: 502, w: 72, h: 18, type: "spikes" },
    { x: 3240, y: 34, w: 62, h: 18, type: "crate" },
    { x: 4060, y: 502, w: 90, h: 18, type: "laser" },
  ],
  "city-hall": [
    { x: 1340, y: 502, w: 78, h: 18, type: "laser" },
    { x: 2480, y: 190, w: 56, h: 18, type: "crate" },
    { x: 3720, y: 24, w: 52, h: 18, type: "crate" },
    { x: 4360, y: 502, w: 84, h: 18, type: "spikes" },
  ],
  "city-hall-siege": [
    { x: 1550, y: 502, w: 88, h: 18, type: "laser" },
    { x: 3160, y: 240, w: 58, h: 18, type: "crate" },
    { x: 3860, y: 502, w: 90, h: 18, type: "spikes" },
    { x: 4520, y: 502, w: 90, h: 18, type: "laser" },
  ],
  "skycourt-terrace": [
    { x: 990, y: 502, w: 72, h: 18, type: "spikes" },
    { x: 2610, y: 120, w: 58, h: 18, type: "crate" },
    { x: 4080, y: 502, w: 86, h: 18, type: "spikes" },
  ],
  "skyrail-chase": [
    { x: 940, y: 502, w: 78, h: 18, type: "laser" },
    { x: 2820, y: 160, w: 56, h: 18, type: "crate" },
    { x: 4440, y: 502, w: 92, h: 18, type: "spikes" },
  ],
  "rivet-rex": [
    { x: 1290, y: 502, w: 88, h: 18, type: "laser" },
    { x: 2440, y: 190, w: 56, h: 18, type: "crate" },
    { x: 2990, y: 502, w: 96, h: 18, type: "laser" },
  ],
  "neon-warrens": [
    { x: 1120, y: 502, w: 78, h: 18, type: "spikes" },
    { x: 2740, y: 230, w: 56, h: 18, type: "crate" },
    { x: 4660, y: 502, w: 88, h: 18, type: "laser" },
  ],
  "blackout-heights": [
    { x: 980, y: 502, w: 84, h: 18, type: "laser" },
    { x: 3180, y: 200, w: 56, h: 18, type: "crate" },
    { x: 5270, y: 502, w: 92, h: 18, type: "spikes" },
  ],
  finale: [
    { x: 1420, y: 502, w: 82, h: 18, type: "spikes" },
    { x: 1760, y: 170, w: 56, h: 18, type: "crate" },
    { x: 2470, y: 140, w: 60, h: 18, type: "crate" },
    { x: 2880, y: 502, w: 90, h: 18, type: "laser" },
  ],
};

const SHORTCUT_SIGNS = {
  "alley-run": [{ x: 2450, y: 112, label: "Shortcut" }],
  "train-yard": [{ x: 3150, y: 82, label: "Crane Cut" }],
  "midtown-rise": [{ x: 3380, y: 80, label: "Upper Route" }],
  "skyline-arc": [{ x: 3220, y: 12, label: "Glide Cut" }],
  "city-hall-siege": [{ x: 3660, y: 80, label: "Lift Loop" }],
  "skycourt-terrace": [{ x: 2540, y: 92, label: "Terrace Cut" }],
  "skyrail-chase": [{ x: 4240, y: 82, label: "Tailwind" }],
  "neon-warrens": [{ x: 2980, y: 142, label: "Vent Route" }],
  "blackout-heights": [{ x: 2820, y: 92, label: "Storm Lane" }],
};

const MANHOLE_LAYOUTS = {
  "alley-run": [
    { x: 580, y: 512, w: 34, h: 12, trap: false },
    { x: 1490, y: 512, w: 34, h: 12, trap: true, sewerId: "market-sewer-a", exitX: 1550, exitY: 706 },
    { x: 2860, y: 512, w: 34, h: 12, trap: false },
  ],
  "train-yard": [
    { x: 930, y: 512, w: 34, h: 12, trap: false },
    { x: 2640, y: 512, w: 34, h: 12, trap: true, sewerId: "yard-sewer-a", exitX: 2710, exitY: 712 },
    { x: 4010, y: 512, w: 34, h: 12, trap: false },
  ],
  "neon-warrens": [
    { x: 880, y: 512, w: 34, h: 12, trap: false },
    { x: 3180, y: 512, w: 34, h: 12, trap: true, sewerId: "neon-sewer-a", exitX: 3260, exitY: 708 },
    { x: 5050, y: 512, w: 34, h: 12, trap: false },
  ],
};

const SEWER_LAYOUTS = {
  "alley-run": [
    { x: 1440, y: 782, w: 230, h: 18, type: "sewer", requires: "market-sewer-a" },
    { x: 1730, y: 742, w: 180, h: 18, type: "sewer", requires: "market-sewer-a" },
    { x: 1980, y: 700, w: 150, h: 18, type: "spring", requires: "market-sewer-a" },
  ],
  "train-yard": [
    { x: 2600, y: 790, w: 240, h: 18, type: "sewer", requires: "yard-sewer-a" },
    { x: 2900, y: 748, w: 170, h: 18, type: "sewer", requires: "yard-sewer-a" },
    { x: 3140, y: 706, w: 150, h: 18, type: "spring", requires: "yard-sewer-a" },
  ],
  "neon-warrens": [
    { x: 3220, y: 786, w: 250, h: 18, type: "sewer", requires: "neon-sewer-a" },
    { x: 3520, y: 742, w: 180, h: 18, type: "sewer", requires: "neon-sewer-a" },
    { x: 3770, y: 698, w: 150, h: 18, type: "spring", requires: "neon-sewer-a" },
  ],
};

function getShortcutSigns() {
  return SHORTCUT_SIGNS[state.level.id] || [];
}

function getHazards() {
  return HAZARD_LAYOUTS[state.level.id] || [];
}

function getPriorityText() {
  const player = state.player;
  if (!player) return state.message;

  if (player.rescues < state.level.civiliansTarget) {
    return `Rescue civilians: ${player.rescues}/${state.level.civiliansTarget}`;
  }
  const enforcer = state.enemies.find((enemy) => enemy.type === "enforcer");
  if (enforcer) {
    return "Heavy guard ahead: punch three times or stomp past it.";
  }
  if (state.boss) {
    if (state.boss.type === "rivet") return "Make Rivet Rex crash into a wall, then punch him while he is stunned.";
    if (state.boss.type === "graft") return "Bait the Graft King into the arena walls, then punish the opening.";
    if (state.boss.type === "signal") return "Dodge the signal burst, then punch the Warden while its shield is down.";
    return "Wait for the Vacuum Dragon to expose itself after an attack, then punch in close.";
  }
  return "Reach the beacon at the end of the level.";
}

function updateGimmicks(dt) {
  for (const platform of state.dynamicPlatforms) {
    platform.prevX = platform.x;
    platform.prevY = platform.y;
    platform.phase += dt * platform.speed;
    if (platform.axis === "x") {
      platform.x = platform.baseX + Math.sin(platform.phase) * platform.range;
      platform.y = platform.baseY;
    } else {
      platform.x = platform.baseX;
      platform.y = platform.baseY + Math.sin(platform.phase) * platform.range;
    }

    if (state.player?.supportPlatform === platform && state.player.onGround) {
      state.player.x += platform.x - platform.prevX;
      state.player.y += platform.y - platform.prevY;
    }
  }
}

function updatePlayer(dt) {
  const player = state.player;
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const crouchHeld = keys.has("ArrowDown") || keys.has("KeyS");
  const move = (right ? 1 : 0) - (left ? 1 : 0);
  player.crouching = crouchHeld && player.onGround;

  player.vx = move * (player.crouching ? CROUCH_SPEED : MOVE_SPEED);
  if (move !== 0) player.facing = Math.sign(move);
  if (Math.abs(player.vx) > 0) player.walkCycle += dt * 10;

  const holdingJump = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
  const gliding = !player.onGround && player.vy > 0 && holdingJump;

  player.vy += (gliding ? GLIDE_GRAVITY : GRAVITY) * dt;
  if (gliding) {
    player.glideTime += dt;
    player.vy = Math.min(player.vy, GLIDE_FALL_SPEED);
  } else {
    player.glideTime = 0;
  }

  for (const zone of getWindZones()) {
    if (aabb(player.x, player.y, player.w, player.h, zone.x, zone.y, zone.w, zone.h)) {
      player.vx += zone.fx * dt;
      player.vy += zone.fy * dt;
    }
  }

  player.x += player.vx * dt;
  resolveHorizontal(player);
  player.y += player.vy * dt;
  resolveVertical(player);

  player.x = clamp(player.x, 0, getWorldWidth() - player.w);
  if (player.y > 1080) {
    state.scene = scenes.gameOver;
    state.message = "Box Boy fell out of the route. Press Enter to try the level again.";
  }

  player.invuln = Math.max(0, player.invuln - dt);
  player.punchTimer = Math.max(0, player.punchTimer - dt);
  player.punchCooldown = Math.max(0, player.punchCooldown - dt);
  player.sewerCooldown = Math.max(0, player.sewerCooldown - dt);
}

function resolveHorizontal(player) {
  for (const platform of getPlatforms()) {
    if (!aabb(player.x, player.y, player.w, player.h, platform.x, platform.y, platform.w, platform.h)) continue;
    if (player.vx > 0) player.x = platform.x - player.w;
    if (player.vx < 0) player.x = platform.x + platform.w;
  }
}

function resolveVertical(player) {
  player.onGround = false;
  player.supportPlatform = null;
  for (const platform of getPlatforms()) {
    if (!aabb(player.x, player.y, player.w, player.h, platform.x, platform.y, platform.w, platform.h)) continue;
    if (player.vy > 0) {
      player.y = platform.y - player.h;
      if (platform.type === "spring") {
        player.vy = -910;
        player.jumpsLeft = 1;
        player.onGround = false;
        player.supportPlatform = null;
        spawnParticles(player.x + player.w / 2, platform.y + 4, "#8ac6ff", 12);
      } else {
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
        player.supportPlatform = platform;
      }
    } else if (player.vy < 0) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }
}

function rescueCivilian(civ) {
  civ.rescued = true;
  state.player.rescues += 1;
  state.totalRescues += 1;
  state.message = `${civ.name} is safe. The city is starting to notice.`;
  spawnParticles(civ.x, civ.y, "#8be7b3", 18);
  saveProgress();
}

function damagePlayer(sourceX) {
  const player = state.player;
  if (player.invuln > 0) return;
  player.hp -= 1;
  player.invuln = 1;
  player.vx = sourceX < player.x ? 240 : -240;
  player.vy = -260;
  state.message = "Box Boy gets clipped and stumbles back.";
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff8f8f", 14);
  if (player.hp <= 0) {
    setScene(scenes.gameOver);
    state.message = "Box Boy is down. Press Enter to try the level again.";
  }
}

function startPunch(side) {
  const player = state.player;
  if (player.punchCooldown > 0) return;
  player.punchCooldown = PUNCH_COOLDOWN;
  player.punchTimer = PUNCH_DURATION;
  player.punchSide = side;
  state.message = `Box Boy throws a ${side} punch.`;
}

function updateRescuesAndHazards() {
  for (const civ of state.civilians) {
    if (!civ.rescued && aabb(state.player.x, state.player.y, state.player.w, state.player.h, civ.x, civ.y, civ.w, civ.h)) {
      rescueCivilian(civ);
    }
  }

  for (const hazard of getHazards()) {
    if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, hazard.x, hazard.y, hazard.w, hazard.h)) {
      damagePlayer(hazard.x);
    }
  }

  for (const hole of getManholes()) {
    if (!hole.trap || state.player.sewerCooldown > 0) continue;
    if (!aabb(state.player.x, state.player.y, state.player.w, state.player.h, hole.x, hole.y - 6, hole.w, hole.h + 14)) continue;
    if (!state.player.onGround) continue;
    state.unlockedSewers.add(hole.sewerId);
    state.player.x = hole.exitX;
    state.player.y = hole.exitY;
    state.player.vy = 80;
    state.player.onGround = false;
    state.player.sewerCooldown = 0.8;
    state.message = "A hidden manhole drops Box Boy into a sewer shortcut.";
    spawnParticles(hole.x + hole.w / 2, hole.y + 6, "#8ac6ff", 18);
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.type === "walker" || enemy.type === "enforcer") {
      enemy.x += enemy.vx * dt;
      const nextBox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      let supported = false;
      for (const platform of getPlatforms()) {
        const feetY = enemy.y + enemy.h + 4;
        if (enemy.x + enemy.w > platform.x && enemy.x < platform.x + platform.w && Math.abs(feetY - platform.y) < 10) {
          supported = true;
        }
        if (aabb(nextBox.x, nextBox.y, nextBox.w, nextBox.h, platform.x, platform.y, platform.w, platform.h)) {
          enemy.vx *= -1;
        }
      }
      if (!supported) enemy.vx *= -1;
    } else {
      enemy.phase += dt * 2.4;
      enemy.x += Math.cos(enemy.phase) * 36 * dt;
      enemy.y = enemy.baseY + Math.sin(enemy.phase * 1.7) * 18;
    }

    enemy.cooldown -= dt;
    const dxToPlayer = state.player.x - enemy.x;
    if (enemy.cooldown <= 0 && Math.abs(dxToPlayer) < 320) {
      if (enemy.type === "drone") {
        spawnProjectile(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, clamp(dxToPlayer * 1.15, -240, 240), 10, "#8bd7ff");
        enemy.cooldown = 1.25;
      } else if (enemy.type === "walker" && Math.abs(dxToPlayer) > 90) {
        spawnProjectile(enemy.x + enemy.w / 2, enemy.y + 18, Math.sign(dxToPlayer) * 190, -30, "#ffb37d");
        enemy.cooldown = 1.9;
      } else if (enemy.type === "enforcer" && Math.abs(dxToPlayer) > 70) {
        spawnProjectile(enemy.x + enemy.w / 2, enemy.y + 24, Math.sign(dxToPlayer) * 220, -10, "#ffd07b");
        enemy.cooldown = 1.1;
      }
    }

    if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
      const stomping = state.player.vy > 120 && state.player.y + state.player.h - 12 < enemy.y + 10;
      if (stomping) {
        state.player.vy = enemy.type === "enforcer" ? -470 : -420;
        enemy.vx *= -1;
        enemy.phase += Math.PI;
        state.message = enemy.type === "enforcer" ? "Box Boy bounces off the heavy guard." : "Box Boy stomps off the enemy and bounces upward.";
        spawnParticles(enemy.x + enemy.w / 2, enemy.y + 4, "#ffe082", enemy.type === "enforcer" ? 16 : 10);
      } else {
        damagePlayer(enemy.x);
      }
    }

    if (state.player.punchTimer > 0) {
      const hitboxX = state.player.punchSide === "right" ? state.player.x + state.player.w : state.player.x - 26;
      if (aabb(hitboxX, state.player.y + 18, 26, 24, enemy.x, enemy.y, enemy.w, enemy.h)) {
        enemy.hp -= 1;
        state.player.punchTimer = 0;
        if (enemy.hp <= 0) {
          state.totalDefeats += 1;
          state.message = enemy.type === "enforcer" ? "Heavy guard down." : "Direct punch. Enemy down.";
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ffcf7e", enemy.type === "enforcer" ? 22 : 14);
          saveProgress();
        } else {
          state.message = "Solid hit. Keep punching.";
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ffd89b", 10);
        }
      }
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
}

function spawnProjectile(x, y, vx, vy, color) {
  state.projectiles.push({ x, y, vx, vy, w: 14, h: 14, color, life: 4 });
}

function updateBoss(dt) {
  if (!state.boss) return;
  const boss = state.boss;
  boss.cooldown -= dt;
  boss.phase += dt;
  boss.stun = Math.max(0, boss.stun - dt);
  const lowHp = boss.hp <= Math.ceil(boss.maxHp * 0.5);

  if (boss.type === "signal") {
    boss.vulnerable = boss.stun > 0;
    boss.x += Math.cos(boss.phase) * (lowHp ? 110 : 70) * dt;
    boss.y = 220 + Math.sin(boss.phase * (lowHp ? 2.4 : 1.7)) * (lowHp ? 64 : 48);
    if (boss.cooldown <= 0) {
      boss.cooldown = lowHp ? 0.8 : 1.2;
      const dx = (state.player.x - boss.x) * 0.9;
      spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, clamp(dx, -240, 240), 120, "#8ac6ff");
      if (lowHp) {
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, -140, 180, "#b8d9ff");
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, 140, 180, "#b8d9ff");
      }
      boss.stun = 0.9;
    }
  } else if (boss.type === "graft") {
    boss.vulnerable = boss.stun > 0;
    boss.x += boss.dir * (lowHp ? 150 : 98) * dt;
    if (boss.x < state.level.boss.arenaStart + 30 || boss.x + boss.w > state.level.boss.arenaEnd - 30) {
      boss.dir *= -1;
      boss.stun = 1.15;
      spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffd39c", 18);
    }
    boss.y = 388 + Math.sin(boss.phase * 2.2) * 18;
    if (boss.cooldown <= 0) {
      boss.cooldown = lowHp ? 0.75 : 1.15;
      spawnProjectile(boss.x + 18, boss.y + boss.h - 12, -160, -140, "#ffc16c");
      spawnProjectile(boss.x + boss.w - 18, boss.y + boss.h - 12, 160, -140, "#ffc16c");
      if (lowHp) {
        spawnProjectile(boss.x + boss.w / 2, boss.y + 20, -30, -220, "#ffe5a5");
      }
    }
  } else if (boss.type === "rivet") {
    if (boss.attack === "charge") {
      boss.x += boss.dir * (lowHp ? 380 : 300) * dt;
      if (boss.x < state.level.boss.arenaStart + 16 || boss.x + boss.w > state.level.boss.arenaEnd - 16) {
        boss.x = clamp(boss.x, state.level.boss.arenaStart + 16, state.level.boss.arenaEnd - boss.w - 16);
        boss.attack = "stunned";
        boss.stun = 1.6;
        boss.vulnerable = true;
        boss.dir *= -1;
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffd19f", 24);
      }
    } else if (boss.attack === "stunned") {
      boss.vulnerable = true;
      if (boss.stun <= 0) {
        boss.attack = "idle";
        boss.cooldown = lowHp ? 0.85 : 1.15;
        boss.vulnerable = false;
      }
    } else {
      boss.vulnerable = false;
      boss.x += Math.cos(boss.phase * 0.9) * 42 * dt;
      if (boss.cooldown <= 0) {
        boss.attack = "charge";
        boss.dir = state.player.x > boss.x ? 1 : -1;
        boss.cooldown = lowHp ? 0.7 : 0.95;
      }
    }
    boss.y = 394;
  } else {
    boss.vulnerable = boss.stun > 0;
    boss.x += boss.dir * (lowHp ? 130 : 86) * dt;
    if (boss.x < state.level.boss.arenaStart + 40 || boss.x + boss.w > state.level.boss.arenaEnd - 40) {
      boss.dir *= -1;
    }
    if (boss.cooldown <= 0) {
      boss.cooldown = lowHp ? 0.95 : 1.55;
      spawnProjectile(boss.x + 30, boss.y + 48, -180, 0, "#ff9f70");
      spawnProjectile(boss.x + 120, boss.y + 48, -90, -60, "#ffcf7e");
      if (lowHp) {
        spawnProjectile(boss.x + 70, boss.y + 22, -40, -160, "#ffdcb1");
        spawnProjectile(boss.x + 150, boss.y + 22, -220, -120, "#ffdcb1");
      }
      boss.stun = 1.05;
    }
  }

  if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, boss.x, boss.y, boss.w, boss.h)) {
    const stomping = state.player.vy > 120 && state.player.y + state.player.h - 10 < boss.y + 14;
    if (stomping) {
      state.player.vy = -430;
      state.message = `${boss.name} shrugs off the stomp, but Box Boy bounces clear.`;
    } else {
      damagePlayer(boss.x);
    }
  }

  if (state.player.punchTimer > 0) {
    const hitboxX = state.player.punchSide === "right" ? state.player.x + state.player.w : state.player.x - 28;
    if (aabb(hitboxX, state.player.y + 12, 28, 30, boss.x, boss.y, boss.w, boss.h)) {
      state.player.punchTimer = 0;
      if (boss.vulnerable) {
        boss.hp -= 1;
        state.message = boss.hp <= 0 ? `${boss.name} is finished.` : `${boss.name} reels from the punch.`;
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ff9a6e", 12);
        if (boss.hp <= 0) saveProgress();
      } else {
        state.message = boss.type === "rivet"
          ? "Rivet Rex is too wild. Make him crash into a wall."
          : "No opening yet. Wait for the boss to expose itself.";
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#b7c8da", 8);
      }
    }
  }

  if (boss.hp <= 0) {
    state.boss = null;
  }
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy += 240 * dt;
    projectile.life -= dt;

    if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, projectile.x, projectile.y, projectile.w, projectile.h)) {
      damagePlayer(projectile.x);
      projectile.life = 0;
    }

    for (const platform of getPlatforms()) {
      if (aabb(projectile.x, projectile.y, projectile.w, projectile.h, platform.x, platform.y, platform.w, platform.h)) {
        projectile.life = 0;
      }
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.life > 0);
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 340 * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function updateCamera() {
  const focus = state.player.x + state.player.w / 2 - WIDTH / 2;
  state.cameraX = clamp(focus, 0, Math.max(0, getWorldWidth() - WIDTH));
  const inSewer = state.player.y > 620;
  if (inSewer) {
    const verticalFocus = state.player.y + state.player.h / 2 - HEIGHT / 2;
    state.cameraY = clamp(verticalFocus, 0, Math.max(0, getWorldHeight() - HEIGHT));
  } else {
    state.cameraY = 0;
  }
}

function checkLevelCompletion() {
  const player = state.player;
  const readyForExit = player.rescues >= state.level.civiliansTarget && !state.boss;
  if (readyForExit && player.x > state.level.endX) {
    setScene(scenes.levelClear);
    state.message = `${state.level.name} cleared.`;
  }
}

function updateGame(dt) {
  if (state.transitionTimer > 0) state.transitionTimer -= dt;
  updateGimmicks(dt);
  updatePlayer(dt);
  updateRescuesAndHazards();
  updateEnemies(dt);
  updateBoss(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  updateCamera();
  checkLevelCompletion();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, color = null) {
  const paragraphs = String(text).split("\n");
  let cy = y;
  if (color) ctx.fillStyle = color;
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        cy += lineHeight;
        line = word;
      } else {
        line = next;
      }
    }
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lineHeight;
    }
    if (!words.length) {
      cy += lineHeight;
    }
  }
  return cy;
}

function drawButton(x, y, w, h, label, font = "700 18px Trebuchet MS") {
  drawPanel(x, y, w, h, "rgba(255,220,118,0.96)");
  ctx.fillStyle = "#17345f";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function worldToScreen(x) {
  return x - state.cameraX;
}

function worldToScreenY(y) {
  return y - state.cameraY;
}

function drawParallax(background) {
  const palettes = {
    "market-night": {
      skyTop: "#10203c", skyBottom: "#2d4f7f", glow: "#ffcf78", far: "#182b46", mid: "#254264", near: "#345a83",
    },
    "freight-dawn": {
      skyTop: "#6a7fd8", skyBottom: "#f4b282", glow: "#ffd9a6", far: "#48506f", mid: "#646f8c", near: "#7986a5",
    },
    "bridge-storm": {
      skyTop: "#1f253b", skyBottom: "#5c6693", glow: "#dce7ff", far: "#1e2536", mid: "#2c3952", near: "#3f516f",
    },
    "midtown-noon": {
      skyTop: "#82bfff", skyBottom: "#f6fbff", glow: "#ffffff", far: "#98b3d6", mid: "#6f91bc", near: "#5576a2",
    },
    "skyline-sunset": {
      skyTop: "#f28b67", skyBottom: "#5f79d6", glow: "#ffd59f", far: "#523863", mid: "#624c7c", near: "#7a6194",
    },
    "civic-night": {
      skyTop: "#112143", skyBottom: "#3757a4", glow: "#ffe083", far: "#1d2b4b", mid: "#26395c", near: "#345076",
    },
    "finale-red": {
      skyTop: "#3f1120", skyBottom: "#e46953", glow: "#ffd998", far: "#35131d", mid: "#4e1f2f", near: "#6d3145",
    },
  };

  const palette = palettes[background];
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = palette.glow;
  ctx.beginPath();
  ctx.arc(WIDTH - 160, 86, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  for (let i = 0; i < 7; i += 1) {
    const starX = (i * 143 + 92) % WIDTH;
    const starY = 30 + (i % 4) * 38;
    ctx.fillRect(starX, starY, 4, 4);
  }
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 5; i += 1) {
    const cloudX = ((i * 220) - (state.cameraX * (0.08 + i * 0.01))) % (WIDTH + 220);
    ctx.fillRect(cloudX - 40, 70 + i * 22, 84, 8);
    ctx.fillRect(cloudX - 18, 62 + i * 22, 66, 8);
  }

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let gx = 0; gx < WIDTH; gx += 8) ctx.fillRect(gx, 0, 1, HEIGHT);
  for (let gy = 0; gy < HEIGHT; gy += 8) ctx.fillRect(0, gy, WIDTH, 1);

  const layers = [
    { color: palette.far, speed: 0.2, height: 230, base: 280, detail: "#ffffff10" },
    { color: palette.mid, speed: 0.45, height: 290, base: 330, detail: "#ffffff18" },
    { color: palette.near, speed: 0.7, height: 360, base: 390, detail: "#ffffff22" },
  ];

  for (const layer of layers) {
    ctx.fillStyle = layer.color;
    for (let i = -1; i < 14; i += 1) {
      const width = 88 + ((i * 37) % 90);
      const height = layer.height - ((i * 53) % 120);
      const x = (i * 160) - ((state.cameraX * layer.speed) % 160);
      const y = layer.base - height;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(x, y + 6, width, 4);
      ctx.fillRect(x, y + height - 10, width, 4);
      ctx.fillStyle = "rgba(255, 241, 181, 0.18)";
      for (let wy = y + 12; wy < y + height - 10; wy += 18) {
        for (let wx = x + 10; wx < x + width - 12; wx += 18) {
          if (((wx + wy) / 18) % 3 < 1) ctx.fillRect(wx, wy, 8, 10);
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      for (let fy = y + 34; fy < y + height - 14; fy += 58) {
        ctx.fillRect(x + 12, fy, width - 24, 4);
      }
      ctx.fillStyle = "rgba(255,220,214,0.22)";
      for (let wx = x + 16; wx < x + width - 16; wx += 42) {
        ctx.fillRect(wx, y + 40, 4, 22);
        ctx.fillRect(wx + 12, y + 40, 18, 4);
      }
      ctx.fillStyle = layer.detail;
      for (let sy = y + 8; sy < y + height; sy += 16) {
        ctx.fillRect(x, sy, width, 1);
      }
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let wx = x + 6; wx < x + width; wx += 16) {
        ctx.fillRect(wx, y, 1, height);
      }
      if (i % 3 === 0) {
        ctx.fillStyle = "rgba(255,220,140,0.10)";
        ctx.fillRect(x + width - 18, y - 34, 6, 34);
        ctx.fillRect(x + width - 24, y - 30, 18, 4);
      }
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(22,20,26,0.35)";
        ctx.fillRect(x + 22, y + 62, 30, 6);
        ctx.fillRect(x + 18, y + 68, 38, 3);
      }
      ctx.fillStyle = layer.color;
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 154);
  ctx.bezierCurveTo(220, 122, 360, 204, 560, 168);
  ctx.bezierCurveTo(720, 140, 820, 190, WIDTH, 152);
  ctx.stroke();

  ctx.fillStyle = "rgba(10,18,32,0.22)";
  for (let i = -1; i < 7; i += 1) {
    const x = (i * 170) - ((state.cameraX * 0.9) % 170);
    ctx.fillRect(x, 430, 20, 110);
    ctx.fillRect(x + 6, 386, 8, 44);
    ctx.fillRect(x + 14, 394, 34, 8);
  }

  ctx.fillStyle = "rgba(18,22,30,0.46)";
  ctx.fillRect(0, 496, WIDTH, 44);
  for (let i = -1; i < 8; i += 1) {
    const x = (i * 132) - ((state.cameraX * 0.95) % 132);
    ctx.fillStyle = "rgba(235,201,122,0.78)";
    ctx.fillRect(x + 20, 502, 26, 4);
    ctx.fillStyle = "rgba(42,49,62,0.85)";
    ctx.fillRect(x, 486, 88, 8);
    ctx.fillRect(x + 8, 478, 4, 18);
    ctx.fillRect(x + 76, 478, 4, 18);
  }
}

function drawManhole(hole) {
  const x = worldToScreen(hole.x);
  const y = worldToScreenY(hole.y);
  ctx.fillStyle = "#2c313a";
  ctx.fillRect(x - 2, y + 7, hole.w + 4, 6);
  ctx.fillStyle = hole.trap ? "#55657b" : "#6d7886";
  ctx.fillRect(x, y, hole.w, 9);
  ctx.fillStyle = "#2d3641";
  ctx.fillRect(x + 2, y + 1, hole.w - 4, 7);
  for (let i = 6; i < hole.w - 4; i += 8) ctx.fillRect(x + i, y + 2, 2, 5);
}

function drawPlatform(platform) {
  const x = worldToScreen(platform.x);
  const y = worldToScreenY(platform.y);
  const colors = {
    ground: ["#353740", "#1f2026"],
    roof: ["#d8dde8", "#8d96a8"],
    sign: ["#7de4ff", "#2b628d"],
    ac: ["#bcc7d9", "#7a8498"],
    fireescape: ["#f3c77d", "#855f27"],
    container: ["#cb6b5b", "#7d332a"],
    crane: ["#f2bf58", "#906a23"],
    train: ["#6889b6", "#385274"],
    beam: ["#9bc9ff", "#436392"],
    steps: ["#d5d0c3", "#8b7f6a"],
    ledge: ["#c7ceda", "#778093"],
    moving: ["#ffd678", "#946c22"],
    spring: ["#8bd8ff", "#2c6e9d"],
    sewer: ["#5d6e63", "#2f3d35"],
  };
  const [top, bottom] = colors[platform.type] || colors.roof;
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(x + 6, y + platform.h - 2, platform.w - 8, 12);
  ctx.fillStyle = top;
  ctx.fillRect(x, y, platform.w, platform.h);
  ctx.fillStyle = bottom;
  ctx.fillRect(x, y + platform.h - 6, platform.w, 6);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let px = 4; px < platform.w - 2; px += 16) {
    ctx.fillRect(x + px, y + 4, 8, 2);
  }
}

function drawHazard(hazard) {
  const x = worldToScreen(hazard.x);
  const y = worldToScreenY(hazard.y);
  if (hazard.type === "spikes") {
    ctx.fillStyle = "#a8b4c8";
    for (let i = 0; i < hazard.w; i += 10) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + hazard.h);
      ctx.lineTo(x + i + 5, y);
      ctx.lineTo(x + i + 10, y + hazard.h);
      ctx.closePath();
      ctx.fill();
    }
  } else if (hazard.type === "laser") {
    ctx.fillStyle = "#ff6a76";
    ctx.fillRect(x, y + 8, hazard.w, 4);
    ctx.fillStyle = "#ffd5d9";
    ctx.fillRect(x, y + 9, hazard.w, 2);
  } else {
    ctx.fillStyle = "#8c643f";
    ctx.fillRect(x, y, hazard.w, hazard.h);
    ctx.strokeStyle = "#5a3a20";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, hazard.w, hazard.h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + hazard.w, y + hazard.h);
    ctx.moveTo(x + hazard.w, y);
    ctx.lineTo(x, y + hazard.h);
    ctx.stroke();
  }
}

function drawCivilian(civ) {
  const x = worldToScreen(civ.x);
  const y = worldToScreenY(civ.y);
  ctx.fillStyle = "rgba(141, 235, 175, 0.18)";
  ctx.beginPath();
  ctx.arc(x + 13, y + 16, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3f6ff";
  ctx.fillRect(x + 8, y + 10, 10, 20);
  ctx.fillStyle = "#e3b282";
  ctx.beginPath();
  ctx.arc(x + 13, y + 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(131, 231, 173, 0.26)";
  ctx.beginPath();
  ctx.arc(x + 13, y + 14, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17345f";
  ctx.fillRect(x + 5, y + 32, 16, 3);
}

function drawEnemy(enemy) {
  const x = worldToScreen(enemy.x);
  const y = worldToScreenY(enemy.y);
  if (enemy.type === "enforcer") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 8, y + enemy.h + 6, 34, 6);
    ctx.fillStyle = "#4d2e35";
    ctx.fillRect(x + 8, y + 6, 36, 40);
    ctx.fillStyle = "#7f533f";
    ctx.fillRect(x + 4, y, 44, 18);
    ctx.strokeStyle = "#c99763";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y, 44, 18);
    ctx.beginPath();
    ctx.moveTo(x + 26, y);
    ctx.lineTo(x + 26, y + 18);
    ctx.moveTo(x + 4, y + 9);
    ctx.lineTo(x + 48, y + 9);
    ctx.stroke();
    ctx.fillStyle = "#ffcf78";
    ctx.fillRect(x + 10, y + 22, 32, 6);
    ctx.fillStyle = "#201218";
    ctx.fillRect(x + 12, y + 32, 28, 10);
    ctx.fillStyle = "#6f4932";
    ctx.fillRect(x, y + 22, 10, 20);
    ctx.fillRect(x + 42, y + 22, 10, 20);
    ctx.fillRect(x + 10, y + 46, 10, 12);
    ctx.fillRect(x + 32, y + 46, 10, 12);
    ctx.fillStyle = "#ffefbd";
    for (let i = 0; i < enemy.hp; i += 1) ctx.fillRect(x + 8 + (i * 12), y - 10, 8, 4);
    return;
  }
  const palette = enemy.type === "walker"
    ? (Math.floor(enemy.x / 200) % 2 === 0
      ? { coat: "#613543", shirt: "#ffdd78", visor: "#2a1018", skin: "#f0c8a1", metal: "#47303a" }
      : { coat: "#243055", shirt: "#7ee1ff", visor: "#12182e", skin: "#e2b18d", metal: "#243248" })
    : { shell: "#7cbef2", accent: "#f84f76", visor: "#24486f", light: "#dff4ff" };
  if (enemy.type === "walker") {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(x + 6, y + enemy.h + 6, 24, 6);
    ctx.fillStyle = palette.skin;
    ctx.fillRect(x + 11, y - 11, 16, 14);
    ctx.fillStyle = "#3e2818";
    ctx.fillRect(x + 9, y - 13, 20, 4);
    ctx.fillStyle = palette.coat;
    ctx.fillRect(x + 7, y + 2, 24, 24);
    ctx.fillStyle = palette.shirt;
    ctx.fillRect(x + 12, y + 6, 14, 7);
    ctx.fillStyle = palette.visor;
    ctx.fillRect(x + 9, y + 15, 20, 8);
    ctx.fillStyle = palette.metal;
    ctx.fillRect(x + 4, y + 15, 5, 12);
    ctx.fillRect(x + 29, y + 15, 5, 12);
    ctx.fillRect(x + 10, y + 26, 6, 11);
    ctx.fillRect(x + 22, y + 26, 6, 11);
    ctx.fillStyle = "#2a1a1f";
    ctx.fillRect(x + 10, y + 37, 7, 9);
    ctx.fillRect(x + 21, y + 37, 7, 9);
    ctx.fillStyle = "#a5b9d4";
    ctx.fillRect(x + enemy.w - 1, y + 18, 8, 4);
    ctx.fillRect(x + enemy.w + 4, y + 16, 4, 8);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(x + 6, y + enemy.h + 4, 24, 5);
    ctx.fillStyle = palette.shell;
    ctx.fillRect(x + 3, y + 4, 28, 16);
    ctx.fillRect(x + 7, y, 20, 8);
    ctx.fillStyle = palette.visor;
    ctx.fillRect(x + 8, y + 8, 18, 8);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 0, y + 7, 6, 12);
    ctx.fillRect(x + 28, y + 7, 6, 12);
    ctx.fillRect(x + 10, y + 19, 4, 8);
    ctx.fillRect(x + 20, y + 19, 4, 8);
    ctx.fillStyle = palette.light;
    ctx.fillRect(x + 12, y + 10, 10, 3);
    ctx.fillRect(x + 15, y + 23, 4, 3);
  }
}

function drawBoss(boss) {
  const x = worldToScreen(boss.x);
  const y = worldToScreenY(boss.y);
  if (boss.type === "dragon") {
    ctx.fillStyle = "#8a8e9f";
    ctx.beginPath();
    ctx.roundRect(x, y, boss.w, boss.h, 26);
    ctx.fill();
    ctx.strokeStyle = "#5a6070";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + boss.w - 16, y + boss.h - 14);
    ctx.bezierCurveTo(x + boss.w + 60, y + 30, x + boss.w + 100, y + 120, x + boss.w + 132, y + 90);
    ctx.stroke();
    ctx.fillStyle = "#ffcc8c";
    ctx.fillRect(x + 26, y + 26, 22, 18);
    ctx.fillRect(x + 72, y + 26, 22, 18);
  } else if (boss.type === "graft") {
    ctx.fillStyle = "#6c4736";
    ctx.fillRect(x + 14, y + 14, boss.w - 28, boss.h - 20);
    ctx.fillStyle = "#bf8752";
    ctx.fillRect(x, y, boss.w, 30);
    ctx.strokeStyle = "#e2b076";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boss.w, 30);
    ctx.beginPath();
    ctx.moveTo(x + boss.w / 2, y);
    ctx.lineTo(x + boss.w / 2, y + 30);
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x + boss.w, y + 15);
    ctx.stroke();
    ctx.fillStyle = "#ffcf78";
    ctx.fillRect(x + 26, y + 44, 26, 10);
    ctx.fillRect(x + 72, y + 44, 26, 10);
  } else if (boss.type === "rivet") {
    ctx.fillStyle = "#7d454f";
    ctx.fillRect(x + 18, y + 20, 86, 40);
    ctx.fillStyle = "#a46345";
    ctx.fillRect(x + 40, y + 10, 58, 24);
    ctx.fillStyle = "#3c2119";
    ctx.fillRect(x + 100, y + 20, 30, 18);
    ctx.fillRect(x + 8, y + 32, 18, 12);
    ctx.fillStyle = "#d89a64";
    ctx.fillRect(x + 48, y + 18, 10, 10);
    ctx.fillRect(x + 80, y + 18, 10, 10);
    ctx.fillStyle = "#f4cc8f";
    ctx.fillRect(x + 124, y + 22, 12, 8);
    ctx.fillStyle = "#2e171b";
    ctx.fillRect(x + 44, y + 62, 10, 16);
    ctx.fillRect(x + 82, y + 62, 10, 16);
    ctx.fillRect(x + 112, y + 58, 10, 14);
    ctx.fillStyle = "#ffdfaa";
    ctx.fillRect(x - 10, y + 48, 16, 6);
    ctx.fillRect(x + boss.w - 6, y + 48, 16, 6);
  } else {
    ctx.fillStyle = "#5d8ad1";
    ctx.beginPath();
    ctx.roundRect(x, y, boss.w, boss.h, 20);
    ctx.fill();
    ctx.fillStyle = "#d8f0ff";
    ctx.fillRect(x + 18, y + 16, 24, 12);
    ctx.fillRect(x + 68, y + 16, 24, 12);
  }
  if (boss.vulnerable) {
    ctx.fillStyle = "rgba(255,244,170,0.25)";
    ctx.fillRect(x - 6, y - 6, boss.w + 12, boss.h + 12);
  }
}

function drawProjectile(projectile) {
  const x = worldToScreen(projectile.x);
  const y = worldToScreenY(projectile.y);
  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(x + projectile.w / 2, y + projectile.h / 2, projectile.w / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawWindZone(zone) {
  const x = worldToScreen(zone.x);
  const y = worldToScreenY(zone.y);
  ctx.fillStyle = "rgba(145,216,255,0.08)";
  ctx.fillRect(x, y, zone.w, zone.h);
  ctx.fillStyle = "rgba(180,232,255,0.28)";
  for (let i = 0; i < zone.w; i += 36) {
    const sway = Math.sin((state.lastTime * 0.005) + i) * 8;
    ctx.fillRect(x + i, y + 24 + sway, 18, 3);
    ctx.fillRect(x + i + 8, y + 58 + sway, 18, 3);
    ctx.fillRect(x + i + 2, y + 92 + sway, 18, 3);
  }
}

function drawPlayer() {
  const player = state.player;
  const x = worldToScreen(player.x);
  const y = worldToScreenY(player.y);
  ctx.save();
  if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) ctx.globalAlpha = 0.45;

  const moving = Math.abs(player.vx) > 10;
  const gliding = player.glideTime > 0;
  const legOffset = moving ? Math.sin(player.walkCycle) * 4 : 0;
  const armOffset = moving ? Math.cos(player.walkCycle) * 3 : 0;
  const trailSign = gliding ? -player.facing : moving ? -Math.sign(player.vx) : 0;
  const capeSpread = gliding ? 46 : moving ? 24 : 8;
  const capeLift = gliding ? -8 : moving ? -2 : 12;
  const capeHem = gliding ? 28 : moving ? 50 : 62;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 20, y + player.h + 10, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const capePoints = trailSign === 0
    ? [
      [x + 12, y + 20],
      [x + 8, y + 34],
      [x + 10, y + 58],
      [x + 18, y + 70],
      [x + 30, y + 60],
      [x + 30, y + 30],
    ]
    : [
      [x + 18, y + 20],
      [x + 18 + (capeSpread * trailSign), y + 18 + capeLift],
      [x + 8 + (capeSpread * trailSign), y + capeHem],
      [x + 16, y + 68],
      [x + 34, y + 60],
      [x + 32, y + 30],
    ];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(capePoints[0][0], capePoints[0][1]);
  for (let i = 1; i < capePoints.length; i += 1) ctx.lineTo(capePoints[i][0], capePoints[i][1]);
  ctx.closePath();
  ctx.clip();
  const minCapeX = Math.min(...capePoints.map((point) => point[0])) - 4;
  const maxCapeX = Math.max(...capePoints.map((point) => point[0])) + 4;
  const minCapeY = Math.min(...capePoints.map((point) => point[1])) - 4;
  const maxCapeY = Math.max(...capePoints.map((point) => point[1])) + 4;
  for (let py = minCapeY; py < maxCapeY; py += 6) {
    for (let px = minCapeX; px < maxCapeX; px += 6) {
      ctx.fillStyle = (((px - minCapeX) / 6) + ((py - minCapeY) / 6)) % 2 === 0 ? "#61b7ff" : "#f7fbff";
      ctx.fillRect(px, py, 6, 6);
    }
  }
  ctx.restore();
  ctx.strokeStyle = "#2f5f8d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(capePoints[0][0], capePoints[0][1]);
  for (let i = 1; i < capePoints.length; i += 1) ctx.lineTo(capePoints[i][0], capePoints[i][1]);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "#20293f";
  ctx.fillRect(x + 11, y + 34, 18, 28);
  ctx.fillStyle = "#e0b08a";
  ctx.fillRect(x + 14, y + 24, 12, 10);
  ctx.fillStyle = "#2f3953";
  ctx.fillRect(x + 9, y + 60, 10, 20);
  ctx.fillRect(x + 21, y + 60, 10, 20);
  ctx.fillStyle = "#4d5c82";
  ctx.fillRect(x + 9, y + 34, 22, 10);
  ctx.fillRect(x + 7, y + 44, 26, 8);
  ctx.fillStyle = "#f0d4bc";
  ctx.fillRect(x + 3 - armOffset * 0.25, y + 46 + armOffset * 0.15, 6, 11);
  ctx.fillRect(x + 31 - armOffset * 0.25, y + 46 - armOffset * 0.15, 6, 11);
  ctx.fillStyle = "#c79663";
  ctx.fillRect(x - 1 + armOffset * 0.3, y + 44 + armOffset * 0.15, 10, 14);
  ctx.fillRect(x + 31 + armOffset * 0.3, y + 44 - armOffset * 0.15, 10, 14);
  ctx.fillRect(x + 7, y + 76 + legOffset, 12, 10);
  ctx.fillRect(x + 21, y + 76 - legOffset, 12, 10);
  ctx.fillStyle = "#7f5735";
  ctx.fillRect(x + 7, y + 86 + legOffset, 12, 8);
  ctx.fillRect(x + 21, y + 86 - legOffset, 12, 8);

  ctx.fillStyle = "#c79663";
  ctx.fillRect(x + 6, y + 8, 28, 24);
  ctx.strokeStyle = "#7d552f";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, y + 8, 28, 24);
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 8);
  ctx.lineTo(x + 20, y + 32);
  ctx.moveTo(x + 6, y + 20);
  ctx.lineTo(x + 34, y + 20);
  ctx.stroke();
  ctx.fillStyle = "#4c2e1a";
  ctx.fillRect(x + 12, y + 16, 16, 4);
  ctx.fillStyle = "#f0e2cb";
  ctx.fillRect(x + 16, y + 34, 8, 4);
  ctx.fillStyle = "#8d633b";
  ctx.fillRect(x - 2 + armOffset * 0.3, y + 46 + armOffset * 0.15, 4, 8);
  ctx.fillRect(x + 38 + armOffset * 0.3, y + 46 - armOffset * 0.15, 4, 8);
  ctx.fillRect(x + 8, y + 78 + legOffset, 4, 8);
  ctx.fillRect(x + 28, y + 78 - legOffset, 4, 8);
  ctx.fillStyle = "#f0e2cb";
  ctx.fillRect(x + 11, y + 35, 2, 14);
  ctx.fillRect(x + 27, y + 35, 2, 14);

  if (player.punchTimer > 0) {
    const punchX = player.punchSide === "right" ? x + 37 : x - 11;
    ctx.fillStyle = "#e0b08a";
    ctx.fillRect(punchX, y + 46, 8, 6);
    ctx.fillStyle = "#c79663";
    ctx.fillRect(player.punchSide === "right" ? x + 33 : x - 7, y + 44, 12, 10);
  }
  ctx.restore();
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.fillRect(worldToScreen(particle.x), worldToScreenY(particle.y), particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawEndBeacon() {
  const x = worldToScreen(state.level.endX);
  const y = worldToScreenY(120);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(x - 10, y, 20, 400);
  ctx.fillStyle = "#ffd86b";
  ctx.beginPath();
  ctx.arc(x, y + 18, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawShortcutSign(sign) {
  const x = worldToScreen(sign.x);
  const y = worldToScreenY(sign.y);
  drawPanel(x - 40, y, 92, 22, "rgba(255,214,113,0.92)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 11px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(sign.label, x + 6, y + 15);
  ctx.textAlign = "left";
}

function drawOnScreenPrompt() {
  drawPanel(18, 18, 390, 98, "rgba(255,255,255,0.76)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 20px Trebuchet MS";
  ctx.fillText(state.level.name, 34, 46);
  ctx.font = "14px Trebuchet MS";
  drawWrappedText(getPriorityText(), 34, 72, 340, 16, "#17345f");

  if (state.boss) {
    drawPanel(632, 20, 278, 28, "rgba(255,255,255,0.82)");
    ctx.fillStyle = "#ff936e";
    ctx.fillRect(638, 26, (state.boss.hp / state.boss.maxHp) * 266, 16);
    ctx.fillStyle = "#17345f";
    ctx.font = "700 12px Trebuchet MS";
    ctx.fillText(state.boss.name.toUpperCase(), 644, 40);
  }

  drawPanel(392, 18, 202, 32, "rgba(255, 220, 118, 0.96)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 14px Trebuchet MS";
  ctx.fillText("F = LEFT  G = RIGHT", 410, 39);
}

function drawObjectiveArrow() {
  let targetX = null;
  let targetY = null;
  let label = "";
  if (state.player.rescues < state.level.civiliansTarget) {
    const next = state.civilians.find((civ) => !civ.rescued);
    if (next) {
      targetX = next.x + 12;
      targetY = next.y;
      label = "Civilian";
    }
  } else if (state.boss) {
    targetX = state.boss.x + state.boss.w / 2;
    targetY = state.boss.y;
    label = state.boss.name;
  } else {
    targetX = state.level.endX;
    targetY = 150;
    label = "Finish";
  }

  if (targetX === null) return;
  const screenX = clamp(worldToScreen(targetX), 90, WIDTH - 90);
  const bob = Math.sin(state.lastTime * 0.008) * 5;
  ctx.fillStyle = state.boss ? "#ff8d72" : label === "Civilian" ? "#90ebaf" : "#ffe480";
  ctx.beginPath();
  ctx.moveTo(screenX, 110 + bob);
  ctx.lineTo(screenX - 14, 90 + bob);
  ctx.lineTo(screenX + 14, 90 + bob);
  ctx.closePath();
  ctx.fill();
  drawPanel(screenX - 54, 54 + bob, 108, 24, "rgba(20,35,61,0.86)");
  ctx.fillStyle = "#f6fbff";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(label, screenX, 70 + bob);
  ctx.textAlign = "left";
}

function drawPanel(x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.arcTo(x + w, y, x + w, y + h, 18);
  ctx.arcTo(x + w, y + h, x, y + h, 18);
  ctx.arcTo(x, y + h, x, y, 18);
  ctx.arcTo(x, y, x + w, y, 18);
  ctx.closePath();
  ctx.fill();
}

function drawGame() {
  drawParallax(state.level.background);
  for (const zone of getWindZones()) drawWindZone(zone);
  for (const platform of getPlatforms()) drawPlatform(platform);
  for (const hole of getManholes()) drawManhole(hole);
  for (const hazard of getHazards()) drawHazard(hazard);
  for (const sign of getShortcutSigns()) drawShortcutSign(sign);
  drawEndBeacon();
  for (const civ of state.civilians) if (!civ.rescued) drawCivilian(civ);
  for (const enemy of state.enemies) drawEnemy(enemy);
  for (const projectile of state.projectiles) drawProjectile(projectile);
  if (state.boss) drawBoss(state.boss);
  drawObjectiveArrow();
  drawPlayer();
  drawParticles();
  drawOnScreenPrompt();

  if (state.transitionTimer > 0) {
    ctx.globalAlpha = clamp(state.transitionTimer / 2.8, 0, 1);
    drawPanel(170, 392, 620, 104, "rgba(16,29,54,0.88)");
    ctx.fillStyle = "#fff0bd";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText(state.level.chapter, 204, 438);
    ctx.fillStyle = "#edf6ff";
    ctx.font = "14px Trebuchet MS";
    drawWrappedText(state.level.story, 204, 462, 548, 16, "#edf6ff");
    ctx.globalAlpha = 1;
  }
}

function drawStoryCard() {
  drawParallax(levels[Math.min(state.levelIndex, levels.length - 1)].background);
  drawPanel(112, 78, 736, 340, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 42px Trebuchet MS";
  drawWrappedText(storyBeats[state.storyCard].title, 154, 142, 640, 42, "#17345f");
  ctx.font = "18px Trebuchet MS";
  let cy = drawWrappedText(storyBeats[state.storyCard].body, 154, 212, 640, 24, "#17345f");
  cy += 18;
  drawWrappedText(state.level.story, 154, cy, 640, 24, "#17345f");
  drawButton(248, 440, 464, 48, "PRESS ENTER TO PLAY THE NEXT LEVEL", "700 18px Trebuchet MS");
}

function drawTitle() {
  drawParallax("skyline-sunset");
  drawPanel(138, 84, 694, 336, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 52px Trebuchet MS";
  ctx.fillText("BOX BOY", 352, 152);
  ctx.font = "800 28px Trebuchet MS";
  ctx.fillText("Rise Against Monarch", 330, 190);
  ctx.font = "18px Trebuchet MS";
  drawWrappedText("A story-mode platformer about a powerless hero trying to defeat the biggest villain in the city and prove he belongs in the skyline.", 154, 242, 632, 24, "#17345f");
  drawWrappedText("Run, jump, double jump, glide with the blanket cape, clear parkour routes, rescue civilians, and fight through Monarch's districts.", 154, 288, 632, 24, "#17345f");
  drawWrappedText("Controls: move with WASD or arrows, jump with Space, jump again for a double jump, hold Space to glide, punch with F and G. Press Escape anytime to open the city map.", 146, 334, 644, 22, "#17345f");
  drawButton(322, 448, 314, 48, "PRESS ENTER TO START", "700 20px Trebuchet MS");
}

function drawStatusScreen(title, body) {
  drawParallax("civic-night");
  drawPanel(190, 140, 580, 240, "rgba(255,247,220,0.94)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 34px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(title, 480, 212);
  ctx.textAlign = "left";
  ctx.font = "18px Trebuchet MS";
  const cy = drawWrappedText(body, 236, 256, 490, 24, "#17345f");
  ctx.fillText(`Total rescues: ${state.totalRescues}`, 236, cy + 10);
  ctx.fillText(`Enemies punched out: ${state.totalDefeats}`, 236, cy + 38);
  ctx.fillText("Press Enter to continue.", 236, cy + 68);
}

function drawMapScreen() {
  drawParallax("civic-night");
  drawPanel(54, 42, 852, 456, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 42px Trebuchet MS";
  ctx.fillText("City Map", 92, 98);
  ctx.font = "16px Trebuchet MS";
  drawWrappedText("Choose a level. Locked stages open after you clear the previous one. Press Enter to play. Press Escape to leave the map.", 92, 128, 780, 22, "#17345f");

  const nodes = [
    { x: 112, y: 332 }, { x: 182, y: 282 }, { x: 250, y: 222 }, { x: 326, y: 176 },
    { x: 398, y: 216 }, { x: 468, y: 270 }, { x: 542, y: 314 }, { x: 614, y: 262 },
    { x: 682, y: 204 }, { x: 752, y: 164 }, { x: 820, y: 206 }, { x: 872, y: 134 },
  ];

  ctx.strokeStyle = "#4b6da5";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length; i += 1) ctx.lineTo(nodes[i].x, nodes[i].y);
  ctx.stroke();

  for (let i = 0; i < levels.length; i += 1) {
    const node = nodes[i];
    const unlocked = i <= state.highestUnlockedLevel;
    const selected = i === state.mapSelection;
    ctx.fillStyle = unlocked ? (selected ? "#ffd86b" : "#7ec3ff") : "#8190a6";
    ctx.beginPath();
    ctx.arc(node.x, node.y, selected ? 19 : 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = unlocked ? "#17345f" : "#dce4f1";
    ctx.font = "700 12px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), node.x, node.y + 4);
    ctx.textAlign = "left";
    drawPanel(node.x - 64, node.y + 28, 156, 54, unlocked ? "rgba(20,35,61,0.88)" : "rgba(70,79,98,0.88)");
    ctx.fillStyle = "#f4f8ff";
    ctx.font = "700 12px Trebuchet MS";
    drawWrappedText(unlocked ? levels[i].name : "LOCKED", node.x - 54, node.y + 48, 136, 15, "#f4f8ff");
  }

  const current = levels[state.mapSelection];
  drawPanel(76, 352, 386, 118, "rgba(20,35,61,0.90)");
  ctx.fillStyle = "#fff1b8";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText(current.name, 96, 382);
  ctx.font = "14px Trebuchet MS";
  drawWrappedText(current.goal, 96, 408, 344, 18, "#edf6ff");
  ctx.fillStyle = "#8fd6ff";
  ctx.fillText(state.mapSelection <= state.highestUnlockedLevel ? "Status: Unlocked" : "Status: Locked", 96, 458);
}

function renderScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (state.scene === scenes.title) {
    drawTitle();
  } else if (state.scene === scenes.map) {
    drawMapScreen();
  } else if (state.scene === scenes.story) {
    drawStoryCard();
  } else if (state.scene === scenes.playing) {
    drawGame();
  } else if (state.scene === scenes.levelClear) {
    drawStatusScreen("Level Clear", `${state.level.name} is complete. Box Boy keeps climbing.`);
  } else if (state.scene === scenes.gameOver) {
    drawStatusScreen("Mission Failed", state.message);
  } else if (state.scene === scenes.win) {
    drawStatusScreen("Story Complete", state.message);
  }
}

function renderHud() {
  if (state.scene === scenes.title) {
    hud.innerHTML = `
      <div class="stat"><span class="label">Mode</span><span class="value">Story Mode</span></div>
      <div class="stat"><span class="label">Genre</span><span class="value">2D Platformer</span></div>
      <div class="stat"><span class="label">Setting</span><span class="value">Detailed city skyline</span></div>
      <div class="stat"><span class="label">Promise</span><span class="value">No powers. Still heroic.</span></div>
    `;
    return;
  }

  if (state.scene === scenes.map) {
    hud.innerHTML = `
      <div class="stat"><span class="label">Map</span><span class="value">City Route</span></div>
      <div class="stat"><span class="label">Unlocked</span><span class="value">${state.highestUnlockedLevel + 1}/${levels.length}</span></div>
      <div class="stat"><span class="label">Selection</span><span class="value">${levels[state.mapSelection].name}</span></div>
      <div class="stat"><span class="label">Controls</span><span class="value">A/D or arrows, Enter, Escape</span></div>
    `;
    return;
  }

  if (!state.player || !state.level) return;
  hud.innerHTML = `
    <div class="stat"><span class="label">Stage</span><span class="value">${state.level.name}</span></div>
    <div class="stat"><span class="label">Health</span><span class="value">${"BOX ".repeat(state.player.hp).trim()}</span></div>
    <div class="stat"><span class="label">Jumps</span><span class="value">${state.player.jumpsLeft}/2</span></div>
    <div class="stat"><span class="label">Next Step</span><span class="value">${getPriorityText()}</span></div>
  `;
}

function checklistItem(done, text) {
  return `<p class="check ${done ? "done" : ""}"><span>${done ? "✓" : "•"}</span>${text}</p>`;
}

function renderMission() {
  if (state.scene === scenes.title) {
    mission.innerHTML = `
      <h2>Story Mode</h2>
      <p>This version is now a 12-level side-scrolling platformer with city backgrounds, route gimmicks, heavy guards, boss fights, and story cards between acts.</p>
      <p class="tiny">Jump with <kbd>Space</kbd>. Press <kbd>Space</kbd> again in midair to double jump. Hold <kbd>Space</kbd> while falling to glide. Press <kbd>F</kbd> for left punch and <kbd>G</kbd> for right punch.</p>
      <div class="legend-grid">
        <div class="legend-chip legend-star">Jump on enemies to bounce</div>
        <div class="legend-chip legend-toy">Green = civilian</div>
        <div class="legend-chip legend-boss">Red = boss objective</div>
      </div>
    `;
    return;
  }

  if (state.scene === scenes.map) {
    const selected = levels[state.mapSelection];
    mission.innerHTML = `
      <h2>City Map</h2>
      <p class="mission-lead">${selected.name}</p>
      <p class="tiny">${selected.story}</p>
      <div class="callout">
        <strong>Selected Stage:</strong>
        <p>${selected.goal}</p>
      </div>
      ${checklistItem(state.mapSelection <= state.highestUnlockedLevel, `Unlocked`)}
      ${checklistItem(state.mapSelection === state.highestUnlockedLevel, `Furthest available stage`)}
      <p><strong>Status:</strong> ${state.mapSelection <= state.highestUnlockedLevel ? "Ready to play." : "Locked until earlier levels are cleared."}</p>
      <p class="tiny">Use left/right to move the selection. Press Enter to play the selected unlocked level. Bosses sit at 3, 6, 9, and 12.</p>
    `;
    return;
  }

  if (!state.player || !state.level) return;
  mission.innerHTML = `
    <h2>${state.level.name}</h2>
    <p class="mission-lead">${state.level.goal}</p>
    <p class="tiny">${state.level.story}</p>
    <div class="callout">
      <strong>Do this now:</strong>
      <p>${getPriorityText()}</p>
    </div>
    ${checklistItem(state.player.rescues >= state.level.civiliansTarget, `Civilians rescued: ${state.player.rescues}/${state.level.civiliansTarget}`)}
    ${state.level.boss ? checklistItem(!state.boss, `Defeat ${state.level.boss.name}`) : ""}
    ${checklistItem(state.player.rescues >= state.level.civiliansTarget && !state.boss, `Reach the end beacon`)}
    <p><strong>Status:</strong> ${state.message}</p>
      <p class="tiny">Stomp enemies to bounce, punch them with <kbd>F</kbd> or <kbd>G</kbd>, use spring pads, moving lifts, wind lanes, and hidden manhole sewer shortcuts, and watch for heavy guards that take multiple hits.</p>
  `;
}

function frame(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0.016);
  state.lastTime = time;
  if (state.scene === scenes.playing) updateGame(dt);
  renderScene();
  renderHud();
  renderMission();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Escape"].includes(event.code)) event.preventDefault();
  const wasHeld = keys.has(event.code);
  keys.add(event.code);

  if (event.code === "Escape") {
    if (state.scene === scenes.playing || state.scene === scenes.story || state.scene === scenes.levelClear || state.scene === scenes.gameOver || state.scene === scenes.win) {
      state.mapSelection = state.levelIndex;
      setScene(scenes.map);
      return;
    }
    if (state.scene === scenes.map) {
      setScene(state.level ? scenes.story : scenes.title);
      return;
    }
  }

  if (event.code === "Enter") {
    if (state.scene === scenes.title) {
      startStoryMode();
    } else if (state.scene === scenes.map) {
      if (state.mapSelection <= state.highestUnlockedLevel) {
        resetLevel(state.mapSelection);
        setScene(scenes.story);
        state.storyCard = Math.min(storyBeats.length - 1, Math.floor(state.mapSelection / 3));
      }
    } else if (state.scene === scenes.story) {
      setScene(scenes.playing);
    } else if (state.scene === scenes.levelClear) {
      advanceLevel();
    } else if (state.scene === scenes.gameOver) {
      resetLevel(state.levelIndex);
      setScene(scenes.playing);
    } else if (state.scene === scenes.win) {
      setScene(scenes.title);
    }
  }

  if (state.scene === scenes.map) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      state.mapSelection = clamp(state.mapSelection - 1, 0, levels.length - 1);
      saveProgress();
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      state.mapSelection = clamp(state.mapSelection + 1, 0, levels.length - 1);
      saveProgress();
    }
    return;
  }

  if (state.scene !== scenes.playing) return;

  if (event.code === "Space" && !wasHeld && state.player.jumpsLeft > 0) {
    state.player.vy = -JUMP_SPEED;
    state.player.onGround = false;
    state.player.jumpsLeft -= 1;
  }

  if (event.code === "KeyF") {
    startPunch("left");
  }

  if (event.code === "KeyG") {
    startPunch("right");
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

loadSave();
renderHud();
renderMission();
requestAnimationFrame(frame);
