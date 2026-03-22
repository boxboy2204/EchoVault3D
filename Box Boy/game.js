const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const hud = document.getElementById("hud");
const mission = document.getElementById("mission");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = new Set();
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = {
  ctx: null,
  master: null,
  mode: "quiet",
  intervalId: null,
  step: 0,
};
const AUTHORED_LEVELS = new Set([
  "alley-run",
  "train-yard",
  "signal-bridge",
  "midtown-rise",
  "skyline-arc",
  "skycourt-terrace",
  "skyrail-chase",
  "neon-warrens",
  "blackout-heights",
]);

const GRAVITY = 1800;
const MOVE_SPEED = 265;
const CROUCH_SPEED = 108;
const JUMP_SPEED = 690;
const GLIDE_GRAVITY = 320;
const GLIDE_FALL_SPEED = 170;
const PLAYER_STAND_HEIGHT = 74;
const PLAYER_CROUCH_HEIGHT = 46;
const WORLD_FLOOR = 512;
const PUNCH_DURATION = 0.16;
const PUNCH_COOLDOWN = 0.24;
const LASER_CHARGE_TIME = 0.32;
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
    goal: "Clear Lantern Alley, crouch through the duct run, and rescue 4 civilians.",
    story:
      "A blackout hits the Old Market blocks after Monarch's crews move in. Box Boy starts in the alley because if he can save this block, people might finally believe he can reach the villain behind it.",
    background: "market-night",
    civiliansTarget: 4,
    outro: "The first block sees him land the rescues in public. The laughs get quieter.",
    endX: 5520,
    platforms: [
      { x: 0, y: 520, w: 5760, h: 140, type: "ground" },
      { x: 190, y: 430, w: 180, h: 20, type: "roof" },
      { x: 470, y: 360, w: 160, h: 20, type: "roof" },
      { x: 720, y: 320, w: 140, h: 20, type: "spring" },
      { x: 940, y: 390, w: 150, h: 20, type: "ac" },
      { x: 1180, y: 300, w: 180, h: 20, type: "roof" },
      { x: 1420, y: 444, w: 240, h: 18, type: "roof" },
      { x: 1410, y: 380, w: 256, h: 18, type: "roof" },
      { x: 1730, y: 340, w: 160, h: 20, type: "fireescape" },
      { x: 1990, y: 270, w: 190, h: 20, type: "roof" },
      { x: 2270, y: 410, w: 150, h: 20, type: "ac" },
      { x: 2460, y: 332, w: 180, h: 20, type: "fireescape" },
      { x: 2700, y: 254, w: 160, h: 20, type: "roof" },
      { x: 2920, y: 198, w: 160, h: 20, type: "roof" },
      { x: 3160, y: 300, w: 180, h: 20, type: "sign" },
      { x: 3390, y: 236, w: 170, h: 20, type: "roof" },
      { x: 3620, y: 168, w: 160, h: 20, type: "roof" },
      { x: 3890, y: 252, w: 170, h: 20, type: "roof" },
      { x: 4160, y: 196, w: 160, h: 20, type: "roof" },
      { x: 4380, y: 132, w: 170, h: 20, type: "roof" },
      { x: 4620, y: 214, w: 190, h: 20, type: "roof" },
      { x: 4870, y: 154, w: 170, h: 20, type: "roof" },
      { x: 5130, y: 92, w: 180, h: 20, type: "roof" },
      { x: 2440, y: 188, w: 120, h: 20, type: "roof" },
      { x: 2580, y: 150, w: 110, h: 20, type: "roof" },
      { x: 2720, y: 118, w: 120, h: 20, type: "roof" },
    ],
    civilians: [
      { x: 1240, y: 252, name: "Riley" },
      { x: 2140, y: 222, name: "Mrs. Vega" },
      { x: 3620, y: 120, name: "Mr. Holloway" },
      { x: 5170, y: 44, name: "Tara" },
    ],
    enemies: [
      { x: 610, type: "walker" },
      { x: 1120, type: "walker" },
      { x: 1520, y: 418, type: "walker" },
      { x: 1840, y: 306, type: "drone" },
      { x: 2360, type: "walker" },
      { x: 2850, y: 94, type: "drone" },
      { x: 3340, y: 210, type: "walker" },
      { x: 4010, y: 226, type: "walker" },
      { x: 4440, y: 108, type: "drone" },
      { x: 4920, y: 128, type: "walker" },
    ],
    windZones: [{ x: 2660, y: 70, w: 280, h: 210, fx: 48, fy: -110 }],
  },
  {
    id: "train-yard",
    name: "Level 2: Freightline Sprint",
    chapter: "Act 1: First Shift",
    goal: "Cross the freight district, ride the moving crane route, and rescue 4 civilians.",
    story:
      "Monarch's freight crews are locking down the district. If Box Boy can cross the crane line and bring people back, the rumor of a real hero stops sounding impossible.",
    background: "freight-dawn",
    civiliansTarget: 4,
    outro: "By the time Box Boy hits the rail tower, workers are pointing up instead of laughing.",
    endX: 5840,
    platforms: [
      { x: 0, y: 520, w: 6100, h: 140, type: "ground" },
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
      { x: 4150, y: 278, w: 180, h: 20, type: "train" },
      { x: 4420, y: 214, w: 170, h: 20, type: "container" },
      { x: 4680, y: 154, w: 160, h: 20, type: "crane" },
      { x: 4950, y: 236, w: 180, h: 20, type: "train" },
      { x: 5210, y: 176, w: 170, h: 20, type: "container" },
      { x: 5470, y: 118, w: 180, h: 20, type: "crane" },
      { x: 3170, y: 122, w: 120, h: 20, type: "container" },
      { x: 3320, y: 92, w: 110, h: 20, type: "container" },
      { x: 3470, y: 62, w: 120, h: 20, type: "container" },
    ],
    movingPlatforms: [
      { x: 2100, y: 220, w: 120, h: 18, type: "moving", axis: "y", range: 72, speed: 1.5, phase: 0 },
      { x: 2860, y: 280, w: 120, h: 18, type: "moving", axis: "x", range: 84, speed: 1.2, phase: 1.4 },
      { x: 4700, y: 250, w: 130, h: 18, type: "moving", axis: "x", range: 118, speed: 1.6, phase: 2.3 },
    ],
    civilians: [
      { x: 1650, y: 202, name: "Dockworker Lee" },
      { x: 2350, y: 232, name: "Nadia" },
      { x: 3940, y: 292, name: "Tamsin" },
      { x: 5560, y: 70, name: "Jules" },
    ],
    enemies: [
      { x: 560, type: "walker" },
      { x: 1160, y: 356, type: "drone" },
      { x: 1750, type: "walker" },
      { x: 2050, y: 306, type: "drone" },
      { x: 2660, type: "enforcer" },
      { x: 3240, y: 114, type: "drone" },
      { x: 3760, type: "walker" },
      { x: 4280, y: 252, type: "walker" },
      { x: 4710, y: 128, type: "drone" },
      { x: 5250, y: 150, type: "walker" },
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
    outro: "The Signal Warden drops out of the bridge lights. For the first time, Monarch loses a piece of the skyline.",
    endX: 3020,
    boss: {
      type: "signal",
      name: "Signal Warden",
      hp: 10,
      arenaStart: 1820,
      arenaEnd: 2880,
    },
    platforms: [
      { x: 0, y: 520, w: 3260, h: 140, type: "ground" },
      { x: 240, y: 390, w: 180, h: 20, type: "beam" },
      { x: 540, y: 330, w: 180, h: 20, type: "beam" },
      { x: 840, y: 280, w: 170, h: 20, type: "beam" },
      { x: 1150, y: 330, w: 160, h: 20, type: "beam" },
      { x: 1420, y: 240, w: 160, h: 20, type: "beam" },
      { x: 1620, y: 360, w: 170, h: 20, type: "beam" },
      { x: 1860, y: 300, w: 140, h: 20, type: "beam" },
      { x: 2060, y: 220, w: 120, h: 20, type: "beam" },
      { x: 2260, y: 320, w: 140, h: 20, type: "beam" },
      { x: 2460, y: 240, w: 120, h: 20, type: "beam" },
      { x: 2640, y: 320, w: 140, h: 20, type: "beam" },
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
    goal: "Cross the billboard district, ride the moving signs, crouch through service ducts, and rescue 4 civilians.",
    story:
      "Now the whole district is watching. Box Boy pushes higher into Midtown because every rooftop cleared gets him one step closer to Monarch's tower.",
    introDialog: "A whole crowd is looking up from Midtown now. If Box Boy can clear the sign district in public, Monarch's people lose the room.",
    background: "midtown-noon",
    civiliansTarget: 4,
    outro: "Midtown watches Box Boy string together one real save after another. The city stops treating him like a joke and starts following him block to block.",
    endX: 6180,
    platforms: [
      { x: 0, y: 520, w: 6420, h: 140, type: "ground" },
      { x: 220, y: 430, w: 170, h: 20, type: "roof" },
      { x: 470, y: 352, w: 150, h: 20, type: "roof" },
      { x: 700, y: 282, w: 160, h: 20, type: "roof" },
      { x: 980, y: 214, w: 180, h: 20, type: "sign" },
      { x: 1290, y: 340, w: 180, h: 20, type: "roof" },
      { x: 1540, y: 264, w: 190, h: 20, type: "sign" },
      { x: 1820, y: 194, w: 170, h: 20, type: "roof" },
      { x: 2080, y: 444, w: 250, h: 18, type: "roof" },
      { x: 2080, y: 378, w: 260, h: 18, type: "roof" },
      { x: 2450, y: 318, w: 170, h: 20, type: "roof" },
      { x: 2700, y: 244, w: 170, h: 20, type: "sign" },
      { x: 2970, y: 174, w: 160, h: 20, type: "roof" },
      { x: 3250, y: 250, w: 180, h: 20, type: "roof" },
      { x: 3520, y: 182, w: 180, h: 20, type: "roof" },
      { x: 3820, y: 116, w: 160, h: 20, type: "sign" },
      { x: 4110, y: 196, w: 180, h: 20, type: "roof" },
      { x: 4390, y: 130, w: 170, h: 20, type: "roof" },
      { x: 4680, y: 220, w: 180, h: 20, type: "roof" },
      { x: 4950, y: 146, w: 170, h: 20, type: "sign" },
      { x: 5230, y: 82, w: 170, h: 20, type: "roof" },
      { x: 5520, y: 158, w: 180, h: 20, type: "roof" },
      { x: 5810, y: 102, w: 180, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1200, y: 276, w: 136, h: 18, type: "moving", axis: "y", range: 96, speed: 1.4, phase: 0.4 },
      { x: 3380, y: 210, w: 132, h: 18, type: "moving", axis: "x", range: 118, speed: 1.5, phase: 1.7 },
      { x: 5060, y: 196, w: 136, h: 18, type: "moving", axis: "y", range: 112, speed: 1.6, phase: 2.2 },
    ],
    civilians: [
      { x: 1350, y: 292, name: "Theo" },
      { x: 2520, y: 270, name: "Ava" },
      { x: 3860, y: 68, name: "Mr. Ortega" },
      { x: 5860, y: 54, name: "Selene" },
    ],
    enemies: [
      { x: 610, type: "walker" },
      { x: 1100, y: 186, type: "drone" },
      { x: 1690, y: 236, type: "walker" },
      { x: 2580, y: 270, type: "walker" },
      { x: 3180, y: 146, type: "drone" },
      { x: 4320, y: 166, type: "walker" },
      { x: 5120, y: 116, type: "drone" },
      { x: 5660, y: 110, type: "walker" },
    ],
    checkpoints: [
      { x: 1780, y: 438, label: "Billboard Row" },
      { x: 3860, y: 438, label: "Service Ducts" },
    ],
  },
  {
    id: "skyline-arc",
    name: "Level 5: Skyline Arc",
    chapter: "Act 2: Midtown Pressure",
    goal: "Cross the skyline gaps, chain wind glides, beat the rooftop enforcer, and rescue 3 civilians.",
    story:
      "This is the part where a real superhero would fly. Box Boy cannot fly, but he can still cross Monarch's windblown skyline one desperate glide at a time.",
    introDialog: "The rooftops finally open up into full skyline gaps. Box Boy is not flying. He is just refusing to fall.",
    background: "skyline-sunset",
    civiliansTarget: 3,
    outro: "By the end of the skyline run, people are cheering from balconies. Box Boy is still improvising, but now the city believes he might really reach Monarch.",
    endX: 6020,
    platforms: [
      { x: 0, y: 520, w: 6260, h: 140, type: "ground" },
      { x: 180, y: 390, w: 160, h: 20, type: "roof" },
      { x: 450, y: 312, w: 130, h: 20, type: "roof" },
      { x: 720, y: 250, w: 150, h: 20, type: "roof" },
      { x: 1060, y: 186, w: 170, h: 20, type: "roof" },
      { x: 1420, y: 300, w: 170, h: 20, type: "roof" },
      { x: 1760, y: 220, w: 180, h: 20, type: "roof" },
      { x: 2120, y: 300, w: 180, h: 20, type: "roof" },
      { x: 2470, y: 204, w: 180, h: 20, type: "roof" },
      { x: 2820, y: 300, w: 180, h: 20, type: "roof" },
      { x: 3170, y: 204, w: 180, h: 20, type: "roof" },
      { x: 3520, y: 110, w: 190, h: 20, type: "roof" },
      { x: 3860, y: 228, w: 180, h: 20, type: "roof" },
      { x: 4190, y: 132, w: 170, h: 20, type: "roof" },
      { x: 4520, y: 220, w: 180, h: 20, type: "roof" },
      { x: 4860, y: 128, w: 170, h: 20, type: "roof" },
      { x: 5210, y: 228, w: 180, h: 20, type: "roof" },
      { x: 5560, y: 134, w: 180, h: 20, type: "roof" },
      { x: 3380, y: 62, w: 120, h: 20, type: "spring" },
      { x: 3600, y: 28, w: 110, h: 20, type: "roof" },
      { x: 3820, y: 8, w: 120, h: 20, type: "roof" },
    ],
    civilians: [
      { x: 1500, y: 252, name: "Paramedic Sloane" },
      { x: 3190, y: 156, name: "Jay" },
      { x: 5640, y: 86, name: "Niko" },
    ],
    enemies: [
      { x: 860, type: "walker" },
      { x: 1660, y: 190, type: "drone" },
      { x: 2340, type: "walker" },
      { x: 3300, type: "enforcer" },
      { x: 4160, y: 108, type: "drone" },
      { x: 5000, type: "walker" },
      { x: 5710, y: 104, type: "drone" },
    ],
    windZones: [
      { x: 860, y: 70, w: 500, h: 280, fx: 62, fy: -160 },
      { x: 3000, y: 0, w: 620, h: 220, fx: 78, fy: -128 },
      { x: 4660, y: 30, w: 620, h: 250, fx: 70, fy: -142 },
    ],
    checkpoints: [
      { x: 2040, y: 438, label: "Crosswind Tower" },
      { x: 4140, y: 438, label: "Glide Span" },
    ],
  },
  {
    id: "city-hall-siege",
    name: "Boss 2: City Hall Siege",
    chapter: "Act 2: Midtown Pressure",
    goal: "Break through the plaza lockdown and defeat the Graft King.",
    story:
      "The Graft King runs Monarch's civic lockdown. Box Boy heads straight for the barricade because every boss under Monarch is one less wall between him and the real target.",
    introDialog: "The plaza is full of barricades outside. Inside City Hall, the Graft King is waiting with missiles already armed.",
    background: "civic-night",
    civiliansTarget: 1,
    outro: "When the Graft King goes down, City Hall opens back up and the whole district starts saying the same thing: Box Boy might actually pull this off.",
    endX: 5020,
    boss: {
      type: "graft",
      name: "Graft King",
      hp: 12,
      arenaStart: 3490,
      arenaEnd: 4860,
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
    checkpoints: [{ x: 3160, y: 438, label: "City Hall Doors" }],
  },
  {
    id: "skycourt-terrace",
    name: "Level 7: Skycourt Terrace",
    chapter: "Act 3: Upper City",
    goal: "Cross the upper-city terraces, ride the lift decks, clear the low vault, and rescue 4 civilians.",
    story:
      "With the plaza open again, Box Boy heads into the upper city. Monarch's rich district looks clean from the street, but the rooftops are all traps and patrol routes.",
    introDialog: "The rooftops look polished up here, but the rich district is just another trap course with better stonework.",
    background: "midtown-noon",
    civiliansTarget: 4,
    outro: "The upper city finally sees Box Boy cut through its polished rooftops and security patrols without slowing down.",
    endX: 6420,
    platforms: [
      { x: 0, y: 520, w: 6640, h: 140, type: "ground" },
      { x: 180, y: 430, w: 170, h: 20, type: "ledge" },
      { x: 450, y: 350, w: 170, h: 20, type: "ledge" },
      { x: 730, y: 280, w: 170, h: 20, type: "ledge" },
      { x: 1060, y: 350, w: 160, h: 20, type: "roof" },
      { x: 1330, y: 270, w: 170, h: 20, type: "roof" },
      { x: 1650, y: 200, w: 180, h: 20, type: "roof" },
      { x: 1890, y: 438, w: 220, h: 18, type: "roof" },
      { x: 1890, y: 372, w: 230, h: 18, type: "roof" },
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
      { x: 5040, y: 220, w: 180, h: 20, type: "roof" },
      { x: 5330, y: 144, w: 170, h: 20, type: "roof" },
      { x: 5630, y: 84, w: 180, h: 20, type: "roof" },
      { x: 5940, y: 174, w: 190, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 930, y: 300, w: 110, h: 18, type: "moving", axis: "y", range: 110, speed: 1.6, phase: 0.2 },
      { x: 3610, y: 220, w: 110, h: 18, type: "moving", axis: "x", range: 130, speed: 1.8, phase: 1.2 },
      { x: 5420, y: 196, w: 118, h: 18, type: "moving", axis: "y", range: 140, speed: 1.6, phase: 2.2 },
    ],
    civilians: [
      { x: 1140, y: 302, name: "Elio" },
      { x: 2320, y: 390, name: "Carmen" },
      { x: 3560, y: 212, name: "Mr. Yuan" },
      { x: 5720, y: 36, name: "Priya" },
    ],
    enemies: [
      { x: 640, type: "walker" },
      { x: 1500, type: "walker" },
      { x: 2120, y: 344, type: "drone" },
      { x: 2980, type: "walker" },
      { x: 3920, y: 160, type: "drone" },
      { x: 4610, type: "walker" },
      { x: 5480, y: 112, type: "drone" },
      { x: 6040, type: "walker" },
    ],
    checkpoints: [
      { x: 1880, y: 438, label: "Stone Vault" },
      { x: 4300, y: 438, label: "Lift Terrace" },
    ],
  },
  {
    id: "skyrail-chase",
    name: "Level 8: Skyrail Chase",
    chapter: "Act 3: Upper City",
    goal: "Leap between moving rail cars, chain launch pads, and rescue 3 civilians.",
    story:
      "Monarch's crews start moving gear toward the central tower on the skyrail. Box Boy stays on the chase even when the whole route keeps shifting under his feet.",
    introDialog: "The rail line is moving now. If Box Boy misses the rhythm, the whole chase turns into a fall.",
    background: "freight-dawn",
    civiliansTarget: 3,
    outro: "The whole rail route sees Box Boy stay on the chase. Even Monarch's crews start panicking about how far he has come.",
    endX: 6780,
    platforms: [
      { x: 0, y: 520, w: 7000, h: 140, type: "ground" },
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
      { x: 5240, y: 200, w: 180, h: 20, type: "container" },
      { x: 5570, y: 120, w: 180, h: 20, type: "train" },
      { x: 5900, y: 200, w: 180, h: 20, type: "container" },
      { x: 6230, y: 126, w: 180, h: 20, type: "train" },
    ],
    movingPlatforms: [
      { x: 1500, y: 370, w: 112, h: 18, type: "moving", axis: "x", range: 150, speed: 2.2, phase: 0.1 },
      { x: 3430, y: 250, w: 112, h: 18, type: "moving", axis: "x", range: 160, speed: 2.4, phase: 1.8 },
      { x: 5410, y: 264, w: 116, h: 18, type: "moving", axis: "x", range: 168, speed: 2.6, phase: 0.9 },
    ],
    civilians: [
      { x: 1780, y: 212, name: "Mina" },
      { x: 3390, y: 142, name: "Rook" },
      { x: 6310, y: 78, name: "Nurse Ada" },
    ],
    enemies: [
      { x: 690, type: "walker" },
      { x: 1590, type: "enforcer" },
      { x: 2460, y: 220, type: "drone" },
      { x: 3180, type: "walker" },
      { x: 4100, y: 140, type: "drone" },
      { x: 4750, type: "walker" },
      { x: 5660, y: 168, type: "drone" },
      { x: 6400, type: "walker" },
    ],
    windZones: [
      { x: 4040, y: 20, w: 550, h: 220, fx: 70, fy: -140 },
      { x: 5660, y: 10, w: 620, h: 220, fx: 74, fy: -150 },
    ],
    checkpoints: [
      { x: 2840, y: 438, label: "Rail Split" },
      { x: 5200, y: 438, label: "Launch Span" },
    ],
  },
  {
    id: "rivet-rex",
    name: "Boss 3: Rivet Rex",
    chapter: "Act 3: Upper City",
    goal: "Bait Rivet Rex into the foundry walls, punish the stun, and survive the whole roof collapse.",
    story:
      "Rivet Rex is Monarch's rooftop bruiser, a charging wrecking-machine turned loose over the foundry. If Box Boy can survive him, the city will know this is not pretend anymore.",
    outro: "Rivet Rex folds in a shower of sparks. The upper city finally sees Box Boy beat a monster-sized threat in public.",
    background: "bridge-storm",
    civiliansTarget: 1,
    endX: 3540,
    boss: {
      type: "rivet",
      name: "Rivet Rex",
      hp: 13,
      arenaStart: 2140,
      arenaEnd: 3460,
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
      { x: 2200, y: 420, w: 180, h: 20, type: "beam" },
      { x: 2480, y: 338, w: 140, h: 20, type: "beam" },
      { x: 2720, y: 248, w: 180, h: 20, type: "beam" },
      { x: 3010, y: 342, w: 140, h: 20, type: "beam" },
      { x: 3240, y: 420, w: 160, h: 20, type: "beam" },
      { x: 2140, y: 250, w: 40, h: 270, type: "beam" },
      { x: 3420, y: 250, w: 40, h: 270, type: "beam" },
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
    goal: "Navigate the neon backstreets, take the side vents, and rescue 4 civilians before the blackout patrol closes in.",
    story:
      "The lower skyline is glowing again, but Monarch's crews own every straight road. Box Boy dives into the side routes and vents because the hard way is the only open one.",
    introDialog: "The lower skyline is tighter, meaner, and full of trap routes. Box Boy has to cut through the side streets instead of taking the obvious path.",
    background: "market-night",
    civiliansTarget: 4,
    outro: "The warrens light back up behind him. Down on the street, people start pointing toward Monarch's tower instead of away from it.",
    endX: 6760,
    platforms: [
      { x: 0, y: 520, w: 6980, h: 140, type: "ground" },
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
      { x: 5450, y: 214, w: 170, h: 20, type: "roof" },
      { x: 5750, y: 140, w: 170, h: 20, type: "roof" },
      { x: 6060, y: 214, w: 170, h: 20, type: "fireescape" },
      { x: 6370, y: 136, w: 170, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1120, y: 180, w: 110, h: 18, type: "moving", axis: "y", range: 120, speed: 1.9, phase: 0.8 },
      { x: 3490, y: 120, w: 110, h: 18, type: "moving", axis: "x", range: 126, speed: 1.4, phase: 2.8 },
      { x: 5900, y: 250, w: 118, h: 18, type: "moving", axis: "y", range: 140, speed: 1.5, phase: 2.1 },
    ],
    civilians: [
      { x: 1270, y: 262, name: "Marta" },
      { x: 2440, y: 272, name: "Wes" },
      { x: 3960, y: 62, name: "Ivy" },
      { x: 6480, y: 86, name: "Dax" },
    ],
    enemies: [
      { x: 760, type: "walker" },
      { x: 1690, y: 190, type: "drone" },
      { x: 2580, type: "walker" },
      { x: 3330, type: "enforcer" },
      { x: 4360, y: 150, type: "drone" },
      { x: 5010, type: "walker" },
      { x: 5860, y: 114, type: "drone" },
      { x: 6440, type: "walker" },
    ],
    windZones: [
      { x: 2920, y: 70, w: 420, h: 200, fx: 52, fy: -100 },
      { x: 5860, y: 40, w: 420, h: 210, fx: 58, fy: -104 },
    ],
    checkpoints: [
      { x: 2720, y: 438, label: "Neon Junction" },
      { x: 5340, y: 438, label: "Vent Market" },
    ],
  },
  {
    id: "blackout-heights",
    name: "Level 11: Blackout Heights",
    chapter: "Act 4: Last Push",
    goal: "Glide through the blackout towers, survive the storm lanes, beat the heavy guard, and rescue 4 civilians.",
    story:
      "The power grid fails again just as Monarch seals the last district. With the skyline dark, Box Boy has to make his own route through the tower blackout.",
    introDialog: "No lights, no safe route, no backup. This is the closest the city gets to seeing how hard Box Boy is pushing for the tower.",
    background: "civic-night",
    civiliansTarget: 4,
    outro: "When the blackout route clears, the whole last district can see the tower. So can Box Boy.",
    endX: 7120,
    platforms: [
      { x: 0, y: 520, w: 7360, h: 140, type: "ground" },
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
      { x: 5800, y: 96, w: 180, h: 20, type: "roof" },
      { x: 6120, y: 196, w: 180, h: 20, type: "roof" },
      { x: 6450, y: 112, w: 170, h: 20, type: "roof" },
      { x: 6780, y: 204, w: 180, h: 20, type: "roof" },
    ],
    movingPlatforms: [
      { x: 1320, y: 290, w: 116, h: 18, type: "moving", axis: "x", range: 140, speed: 1.7, phase: 0.4 },
      { x: 4650, y: 110, w: 116, h: 18, type: "moving", axis: "y", range: 150, speed: 2.0, phase: 1.7 },
      { x: 6200, y: 240, w: 120, h: 18, type: "moving", axis: "x", range: 150, speed: 1.9, phase: 0.9 },
    ],
    civilians: [
      { x: 1220, y: 142, name: "Nell" },
      { x: 2500, y: 162, name: "Omar" },
      { x: 4200, y: 112, name: "Syd" },
      { x: 6900, y: 154, name: "Mara's Brother" },
    ],
    enemies: [
      { x: 760, type: "walker" },
      { x: 1700, type: "enforcer" },
      { x: 2660, y: 170, type: "drone" },
      { x: 3600, type: "walker" },
      { x: 4540, y: 120, type: "drone" },
      { x: 5360, type: "walker" },
      { x: 6260, y: 150, type: "drone" },
      { x: 7020, type: "walker" },
    ],
    windZones: [
      { x: 760, y: 40, w: 700, h: 260, fx: 82, fy: -180 },
      { x: 4300, y: 0, w: 820, h: 240, fx: 68, fy: -130 },
      { x: 6060, y: 0, w: 880, h: 240, fx: 76, fy: -148 },
    ],
    checkpoints: [
      { x: 2900, y: 438, label: "Blackout Spire" },
      { x: 5660, y: 438, label: "Storm Lane" },
    ],
  },
  {
    id: "finale",
    name: "Final Boss: Monarch",
    chapter: "Act 4: Last Push",
    goal: "Reach Monarch's rooftop, rescue Mara, and defeat the city's biggest villain.",
    story:
      "At the top of the skyline, Monarch finally steps out in person with the whole city watching below. This is the proof Box Boy came for.",
    introDialog: "Everything in the story points here. No gadgets, no powers, just Box Boy and the biggest villain in the city.",
    outro: "Monarch falls, and the whole skyline finally sees what Box Boy has been trying to prove from the beginning.",
    background: "finale-red",
    civiliansTarget: 1,
    endX: 3320,
    boss: {
      type: "monarch",
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
  if (!level.boss && !AUTHORED_LEVELS.has(level.id)) {
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
      if ((platform.type === "roof" || platform.type === "ledge" || platform.type === "sign" || platform.type === "container") && platform.y < 420 && platform.w >= 90) {
        const count = platform.w > 150 ? 2 : 1;
        for (let i = 0; i < count; i += 1) {
          const offset = count === 2 ? (i === 0 ? 18 : platform.w - 54) : Math.max(12, (platform.w / 2) - 18);
          const upperPlatform = platform.y < 240;
          extraEnemies.push({
            x: platform.x + offset,
            y: platform.y - 26,
            type: upperPlatform
              ? (((i + Math.floor(platform.x / 120)) % 2 === 0) ? "walker" : "drone")
              : "walker",
          });
        }
      }
    }
    level.enemies.push(...extraEnemies.slice(0, 24));
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
  checkpoints: [],
  checkpointIndex: -1,
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
    state.checkpointIndex = Math.max(-1, save.checkpointIndex ?? -1);
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
    checkpointIndex: state.checkpointIndex,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function initAudio() {
  if (audio.ctx || !AudioContextClass) return;
  audio.ctx = new AudioContextClass();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.28;
  audio.master.connect(audio.ctx.destination);
  audio.step = 0;
}

function ensureAudio() {
  initAudio();
  if (!audio.ctx) return;
  const startNow = () => {
    const desiredMode = getMusicMode();
    setMusicMode(desiredMode);
  };
  if (audio.ctx.state === "suspended") {
    audio.ctx.resume().then(startNow).catch(() => {});
  } else {
    startNow();
  }
}

function playTone(freq, time, duration, type, gainValue) {
  if (!audio.ctx || !audio.master) return;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(gainValue, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(time);
  osc.stop(time + duration + 0.03);
}

function playSfx(config) {
  if (!audio.ctx || !audio.master) return;
  const now = audio.ctx.currentTime;
  const tones = Array.isArray(config) ? config : [config];
  for (const tone of tones) {
    playTone(tone.freq, now + (tone.offset || 0), tone.duration, tone.type || "square", tone.gain);
  }
}

function noteToFreq(semitone) {
  return 220 * (2 ** (semitone / 12));
}

function getMusicMode() {
  if (!(state.scene === scenes.playing || state.scene === scenes.story || state.scene === scenes.title)) return "quiet";
  if (state.scene === scenes.title) return "title";
  if (!state.level) return "city-1";
  if (state.boss) {
    if (state.boss.type === "signal") return "boss-signal";
    if (state.boss.type === "graft") return "boss-graft";
    if (state.boss.type === "rivet") return "boss-rivet";
    if (state.boss.type === "monarch") return "boss-monarch";
  }
  const chapterIndex = Math.min(3, Math.floor(state.levelIndex / 3));
  return `city-${chapterIndex + 1}`;
}

function scheduleMusicStep(mode, time, step) {
  const tracks = {
    title: {
      lead: [7, 10, 12, 15, 12, 10, 7, 5],
      bass: [0, -5, -2, -7],
      cadence: 210,
      bassType: "triangle",
      leadType: "sawtooth",
      bassGain: 0.11,
      leadGain: 0.08,
    },
    "city-1": {
      lead: [0, 3, 5, 7, 10, 7, 5, 3],
      bass: [0, -5, -2, -7],
      cadence: 220,
      bassType: "triangle",
      leadType: "sawtooth",
      bassGain: 0.11,
      leadGain: 0.08,
    },
    "city-2": {
      lead: [2, 5, 7, 9, 7, 5, 4, 0],
      bass: [-2, -7, -4, -9],
      cadence: 205,
      bassType: "triangle",
      leadType: "square",
      bassGain: 0.11,
      leadGain: 0.075,
    },
    "city-3": {
      lead: [5, 7, 10, 12, 10, 7, 5, 3],
      bass: [0, 3, -2, -4],
      cadence: 190,
      bassType: "sine",
      leadType: "square",
      bassGain: 0.1,
      leadGain: 0.085,
    },
    "city-4": {
      lead: [0, 2, 3, 7, 8, 7, 3, 2],
      bass: [-5, -2, -7, -9],
      cadence: 180,
      bassType: "triangle",
      leadType: "sawtooth",
      bassGain: 0.12,
      leadGain: 0.085,
    },
    "boss-signal": {
      lead: [12, 15, 17, 19, 22, 19, 17, 15],
      bass: [7, 5, 3, 10],
      cadence: 120,
      bassType: "triangle",
      leadType: "square",
      bassGain: 0.17,
      leadGain: 0.13,
    },
    "boss-graft": {
      lead: [10, 12, 14, 17, 14, 12, 10, 7],
      bass: [0, -3, 2, -5],
      cadence: 132,
      bassType: "sawtooth",
      leadType: "square",
      bassGain: 0.16,
      leadGain: 0.12,
    },
    "boss-rivet": {
      lead: [5, 8, 10, 12, 15, 12, 10, 8],
      bass: [-5, -5, 0, -2],
      cadence: 112,
      bassType: "triangle",
      leadType: "sawtooth",
      bassGain: 0.18,
      leadGain: 0.12,
    },
    "boss-monarch": {
      lead: [14, 12, 10, 17, 19, 17, 14, 10],
      bass: [2, -2, -5, 0],
      cadence: 126,
      bassType: "sine",
      leadType: "square",
      bassGain: 0.18,
      leadGain: 0.13,
    },
  };
  const track = tracks[mode] || tracks["city-1"];
  const lead = track.lead;
  const bass = track.bass;
  const leadNote = noteToFreq(lead[step % lead.length]);
  const bassNote = noteToFreq(bass[step % bass.length] - 12);
  playTone(bassNote, time, mode.startsWith("boss-") ? 0.24 : 0.36, track.bassType, track.bassGain);
  playTone(noteToFreq((bass[step % bass.length] - 5)), time + 0.02, mode.startsWith("boss-") ? 0.18 : 0.22, "sine", mode.startsWith("boss-") ? 0.06 : 0.04);
  if (step % 2 === 0) playTone(leadNote, time, mode.startsWith("boss-") ? 0.2 : 0.24, track.leadType, track.leadGain);
  if (!mode.startsWith("boss-") && step % 4 === 1) playTone(noteToFreq(lead[(step + 2) % lead.length] - 12), time + 0.07, 0.16, "square", 0.035);
  if (mode.startsWith("boss-") && step % 4 === 2) playTone(noteToFreq(24), time, 0.12, "square", 0.1);
}

function setMusicMode(mode) {
  if (!audio.ctx) return;
  if (audio.mode === mode && audio.intervalId) return;
  audio.mode = mode;
  audio.step = 0;
  if (audio.intervalId) {
    window.clearInterval(audio.intervalId);
    audio.intervalId = null;
  }
  if (mode === "quiet") return;
  const cadenceMap = {
    title: 210,
    "city-1": 220,
    "city-2": 205,
    "city-3": 190,
    "city-4": 180,
    "boss-signal": 120,
    "boss-graft": 132,
    "boss-rivet": 112,
    "boss-monarch": 126,
  };
  const cadence = cadenceMap[mode] || 220;
  const tick = () => {
    if (!audio.ctx || audio.mode === "quiet") return;
    scheduleMusicStep(audio.mode, audio.ctx.currentTime, audio.step);
    audio.step += 1;
  };
  tick();
  audio.intervalId = window.setInterval(tick, cadence);
}

function updateMusic() {
  if (!audio.ctx) return;
  const nextMode = getMusicMode();
  setMusicMode(nextMode);
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
    h: PLAYER_STAND_HEIGHT,
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
    punchHeld: null,
    punchHoldTime: 0,
    laserFired: false,
  };
}

function getPlayerHeight(player, crouching = player.crouching) {
  return crouching ? PLAYER_CROUCH_HEIGHT : PLAYER_STAND_HEIGHT;
}

function getPlayerBounds(player, crouching = player.crouching) {
  const height = getPlayerHeight(player, crouching);
  return {
    x: player.x,
    y: player.y + (PLAYER_STAND_HEIGHT - height),
    w: player.w,
    h: height,
  };
}

function canPlayerStand(player) {
  const bounds = getPlayerBounds(player, false);
  return !getPlatforms().some((platform) => aabb(bounds.x, bounds.y, bounds.w, bounds.h, platform.x, platform.y, platform.w, platform.h));
}

function makeEnemy(base) {
  const isDrone = base.type === "drone";
  const isEnforcer = base.type === "enforcer";
  const spawnY = base.y ?? (isDrone ? 280 : isEnforcer ? 454 : 470);
  const hp = isEnforcer ? 4 : 2;
  return {
    x: base.x,
    y: spawnY,
    w: isDrone ? 34 : isEnforcer ? 52 : 38,
    h: isDrone ? 26 : isEnforcer ? 52 : 36,
    type: base.type,
    vx: isDrone ? 0 : (Math.random() > 0.5 ? 1 : -1) * (isEnforcer ? 52 : 70),
    baseY: spawnY,
    phase: rand(0, Math.PI * 2),
    hp,
    maxHp: hp,
    cooldown: rand(0.4, 1.2),
  };
}

function makeBoss(def) {
  return {
    type: def.type,
    name: def.name,
    x: def.arenaStart + 220,
    y: def.type === "monarch" ? 388 : def.type === "graft" ? 398 : def.type === "rivet" ? 396 : 280,
    w: def.type === "monarch" ? 126 : def.type === "graft" ? 124 : def.type === "rivet" ? 206 : 120,
    h: def.type === "monarch" ? 110 : def.type === "graft" ? 108 : def.type === "rivet" ? 122 : 72,
    hp: def.hp,
    maxHp: def.hp,
    dir: 1,
    cooldown: 0,
    phase: 0,
    vulnerable: def.type === "signal",
    stun: 0,
    attack: "idle",
    telegraph: 0,
    slamFlash: 0,
    chargeTarget: 0,
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
  state.checkpoints = getCheckpoints(level);
  state.checkpointIndex = -1;
  state.cameraX = 0;
  state.cameraY = 0;
  state.message = level.story;
  state.transitionTimer = 2.8;
  saveProgress();
}

function getCheckpoints(level) {
  if (level.checkpoints?.length) return level.checkpoints;
  if (level.boss) return [{ x: Math.max(420, level.boss.arenaStart - 420), y: 438, label: "Arena Gate" }];
  return [
    { x: Math.floor(level.endX * 0.36), y: 438, label: "Checkpoint 1" },
    { x: Math.floor(level.endX * 0.72), y: 438, label: "Checkpoint 2" },
  ];
}

function respawnAtCheckpoint() {
  const checkpoint = state.checkpoints[state.checkpointIndex];
  state.player = makePlayer();
  if (checkpoint) {
    state.player.x = checkpoint.x;
    state.player.y = checkpoint.y;
    state.message = `${checkpoint.label}. Back in the run.`;
  } else {
    state.message = "Back at the start. Keep moving.";
  }
  state.projectiles = [];
  state.particles = [];
  state.cameraX = 0;
  state.cameraY = 0;
  state.transitionTimer = 0.8;
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
  return state.level.platforms.concat(
    state.dynamicPlatforms,
    getSewerPlatforms(),
    [{ x: state.level.endX - 120, y: 520, w: 520, h: 140, type: "ground" }],
  );
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
    { x: 1440, y: 818, w: 620, h: 20, type: "sewer", requires: "market-sewer-a" },
    { x: 2090, y: 786, w: 74, h: 18, type: "sewer", requires: "market-sewer-a" },
    { x: 2150, y: 754, w: 74, h: 18, type: "sewer", requires: "market-sewer-a" },
    { x: 2210, y: 722, w: 74, h: 18, type: "sewer", requires: "market-sewer-a" },
  ],
  "train-yard": [
    { x: 2600, y: 818, w: 660, h: 20, type: "sewer", requires: "yard-sewer-a" },
    { x: 3290, y: 786, w: 74, h: 18, type: "sewer", requires: "yard-sewer-a" },
    { x: 3350, y: 754, w: 74, h: 18, type: "sewer", requires: "yard-sewer-a" },
    { x: 3410, y: 722, w: 74, h: 18, type: "sewer", requires: "yard-sewer-a" },
  ],
  "neon-warrens": [
    { x: 3220, y: 818, w: 670, h: 20, type: "sewer", requires: "neon-sewer-a" },
    { x: 3920, y: 786, w: 74, h: 18, type: "sewer", requires: "neon-sewer-a" },
    { x: 3980, y: 754, w: 74, h: 18, type: "sewer", requires: "neon-sewer-a" },
    { x: 4040, y: 722, w: 74, h: 18, type: "sewer", requires: "neon-sewer-a" },
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
    if (state.boss.type === "graft") return "Punch Graft King's missile at the last second to send it back into him.";
    if (state.boss.type === "signal") return "Wait for Signal Warden to overcharge, then punch while the shield drops.";
    return "Avoid Monarch's volleys and slam, then punish the opening when he lands.";
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
  player.crouching = (crouchHeld && player.onGround) || (player.crouching && !canPlayerStand(player));

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
  if (player.punchHeld) {
    player.punchHoldTime += dt;
    if (!player.laserFired && player.punchHoldTime >= LASER_CHARGE_TIME) {
      fireHeldLaser(player.punchHeld);
    }
  }
}

function resolveHorizontal(player) {
  const bounds = getPlayerBounds(player);
  for (const platform of getPlatforms()) {
    if (!aabb(bounds.x, bounds.y, bounds.w, bounds.h, platform.x, platform.y, platform.w, platform.h)) continue;
    if (player.vx > 0) player.x = platform.x - player.w;
    if (player.vx < 0) player.x = platform.x + platform.w;
  }
}

function resolveVertical(player) {
  player.onGround = false;
  player.supportPlatform = null;
  const bounds = getPlayerBounds(player);
  for (const platform of getPlatforms()) {
    if (!aabb(bounds.x, bounds.y, bounds.w, bounds.h, platform.x, platform.y, platform.w, platform.h)) continue;
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
      player.y = platform.y + platform.h - (PLAYER_STAND_HEIGHT - getPlayerHeight(player));
      player.vy = 0;
    }
  }
}

function rescueCivilian(civ) {
  civ.rescued = true;
  state.player.rescues += 1;
  state.totalRescues += 1;
  state.message = `${civ.name} is safe. The city is starting to notice.`;
  playSfx([
    { freq: 392, duration: 0.16, gain: 0.09, type: "triangle" },
    { freq: 587, duration: 0.2, gain: 0.07, type: "square", offset: 0.05 },
  ]);
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
  playSfx({ freq: 160, duration: 0.22, gain: 0.08, type: "sawtooth" });
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
  playSfx({ freq: side === "right" ? 300 : 250, duration: 0.08, gain: 0.06, type: "square" });
}

function beginPunchHold(side) {
  const player = state.player;
  if (!player || state.scene !== scenes.playing) return;
  player.punchHeld = side;
  player.punchHoldTime = 0;
  player.laserFired = false;
  startPunch(side);
}

function endPunchHold(side) {
  const player = state.player;
  if (!player || player.punchHeld !== side) return;
  player.punchHeld = null;
  player.punchHoldTime = 0;
  player.laserFired = false;
}

function getPunchOrigin(player, side) {
  const armY = player.y + (player.crouching ? 62 : 56);
  if (side === "right") {
    return { x: player.x + 53, y: armY };
  }
  return { x: player.x - 17, y: armY };
}

function fireHeldLaser(side) {
  const player = state.player;
  if (!player) return;
  player.laserFired = true;
  player.punchHeld = null;
  player.punchHoldTime = 0;
  player.punchCooldown = 0.42;
  player.punchTimer = 0;
  const dir = side === "right" ? 1 : -1;
  const origin = getPunchOrigin(player, side);
  spawnProjectile(
    origin.x,
    origin.y,
    dir * 560,
    0,
    "#7ee8ff",
    "player",
  );
  state.message = `Box Boy fires a ${side} laser.`;
  playSfx([
    { freq: 680, duration: 0.08, gain: 0.08, type: "sawtooth" },
    { freq: 1020, duration: 0.14, gain: 0.05, type: "square", offset: 0.02 },
  ]);
}

function updateRescuesAndHazards() {
  const playerBounds = getPlayerBounds(state.player);
  for (const civ of state.civilians) {
    if (!civ.rescued && aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, civ.x, civ.y, civ.w, civ.h)) {
      rescueCivilian(civ);
    }
  }

  for (const hazard of getHazards()) {
    if (aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, hazard.x, hazard.y, hazard.w, hazard.h)) {
      damagePlayer(hazard.x);
    }
  }

  for (const hole of getManholes()) {
    if (!hole.trap || state.player.sewerCooldown > 0) continue;
    if (!aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, hole.x, hole.y - 6, hole.w, hole.h + 14)) continue;
    if (!state.player.onGround) continue;
    state.unlockedSewers.add(hole.sewerId);
    state.player.x = hole.exitX;
    state.player.y = hole.exitY;
    state.player.vy = 80;
    state.player.onGround = false;
    state.player.sewerCooldown = 0.8;
    state.message = "A hidden manhole drops Box Boy into a sewer shortcut.";
    playSfx([{ freq: 210, duration: 0.08, gain: 0.05, type: "triangle" }, { freq: 120, duration: 0.22, gain: 0.05, type: "sine", offset: 0.05 }]);
    spawnParticles(hole.x + hole.w / 2, hole.y + 6, "#8ac6ff", 18);
  }

  for (let i = 0; i < state.checkpoints.length; i += 1) {
    const checkpoint = state.checkpoints[i];
    if (i <= state.checkpointIndex) continue;
    if (state.player.x + state.player.w / 2 >= checkpoint.x) {
      state.checkpointIndex = i;
      state.message = `${checkpoint.label} reached.`;
      playSfx([
        { freq: 330, duration: 0.12, gain: 0.07, type: "triangle" },
        { freq: 494, duration: 0.16, gain: 0.05, type: "square", offset: 0.04 },
      ]);
      spawnParticles(checkpoint.x, checkpoint.y - 20, "#ffe082", 16);
      saveProgress();
    }
  }
}

function updateEnemies(dt) {
  const playerBounds = getPlayerBounds(state.player);
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

    if (aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
      const stomping = state.player.vy > 120 && playerBounds.y + playerBounds.h - 12 < enemy.y + 10;
      if (stomping) {
        state.player.vy = enemy.type === "enforcer" ? -470 : -420;
        enemy.vx *= -1;
        enemy.phase += Math.PI;
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          state.totalDefeats += 1;
          state.message = enemy.type === "enforcer"
            ? "Box Boy stomps the heavy guard down and bounces clear."
            : "Box Boy stomps the enemy and bounces upward.";
          playSfx([
            { freq: enemy.type === "enforcer" ? 170 : 210, duration: 0.08, gain: 0.08, type: "square" },
            { freq: enemy.type === "enforcer" ? 120 : 160, duration: 0.15, gain: 0.06, type: "triangle", offset: 0.02 },
          ]);
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + 4, "#ffe082", enemy.type === "enforcer" ? 20 : 14);
          saveProgress();
        } else {
          state.message = enemy.type === "enforcer"
            ? "Box Boy bounces off the heavy guard and dents the armor."
            : "Box Boy stomps the enemy and bounces upward.";
          playSfx({ freq: enemy.type === "enforcer" ? 180 : 220, duration: 0.11, gain: 0.07, type: "triangle" });
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + 4, "#ffe082", enemy.type === "enforcer" ? 16 : 10);
        }
      } else {
        damagePlayer(enemy.x);
      }
    }

    if (state.player.punchTimer > 0) {
      const hitboxX = state.player.punchSide === "right" ? state.player.x + state.player.w : state.player.x - 38;
      if (aabb(hitboxX, state.player.y + 16, 38, 26, enemy.x, enemy.y, enemy.w, enemy.h)) {
        enemy.hp -= 1;
        state.player.punchTimer = 0;
        if (enemy.hp <= 0) {
          state.totalDefeats += 1;
          state.message = enemy.type === "enforcer" ? "Heavy guard down." : "Direct punch. Enemy down.";
          playSfx([{ freq: 180, duration: 0.1, gain: 0.08, type: "square" }, { freq: 120, duration: 0.18, gain: 0.06, type: "triangle", offset: 0.03 }]);
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ffcf7e", enemy.type === "enforcer" ? 22 : 14);
          saveProgress();
        } else {
          state.message = "Solid hit. Keep punching.";
          playSfx({ freq: 240, duration: 0.08, gain: 0.05, type: "square" });
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ffd89b", 10);
        }
      }
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
}

function spawnProjectile(x, y, vx, vy, color, owner = "enemy") {
  const defaults = owner === "player"
    ? { w: 24, h: 8, life: 0.9, gravity: true }
    : { w: 14, h: 14, life: 4, gravity: true };
  state.projectiles.push({ x, y, vx, vy, color, owner, ...defaults });
}

function updateBoss(dt) {
  if (!state.boss) return;
  const boss = state.boss;
  boss.cooldown -= dt;
  boss.phase += dt;
  boss.stun = Math.max(0, boss.stun - dt);
  const lowHp = boss.hp <= Math.ceil(boss.maxHp * 0.5);

  if (boss.type === "signal") {
    if (boss.attack === "overload") {
      boss.vulnerable = true;
      boss.y = 226 + Math.sin(boss.phase * 4.5) * 6;
      if (boss.stun <= 0) {
        boss.attack = "idle";
        boss.vulnerable = false;
        boss.cooldown = lowHp ? 0.65 : 0.95;
      }
    } else if (boss.attack === "telegraph") {
      boss.vulnerable = false;
      boss.telegraph -= dt;
      boss.x += Math.sin(boss.phase * 10) * 22 * dt;
      boss.y = 210 + Math.sin(boss.phase * 2.6) * 18;
      if (boss.telegraph <= 0) {
        boss.attack = "overload";
        boss.stun = lowHp ? 1.25 : 1.05;
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, -210, 160, "#8ac6ff");
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, 0, 190, "#b8d9ff");
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, 210, 160, "#8ac6ff");
        if (lowHp) {
          spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, -110, 240, "#d3e4ff");
          spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, 110, 240, "#d3e4ff");
        }
        playSfx([{ freq: 360, duration: 0.1, gain: 0.07, type: "square" }, { freq: 270, duration: 0.2, gain: 0.05, type: "triangle", offset: 0.03 }]);
      }
    } else {
      boss.vulnerable = false;
      boss.x += Math.cos(boss.phase) * (lowHp ? 110 : 70) * dt;
      boss.y = 220 + Math.sin(boss.phase * (lowHp ? 2.4 : 1.7)) * (lowHp ? 64 : 48);
      if (boss.cooldown <= 0) {
        boss.attack = "telegraph";
        boss.telegraph = lowHp ? 0.45 : 0.7;
        playSfx([{ freq: 240, duration: 0.08, gain: 0.06, type: "square" }, { freq: 320, duration: 0.12, gain: 0.05, type: "sine", offset: 0.03 }]);
      }
    }
  } else if (boss.type === "graft") {
    boss.vulnerable = false;
    const baseY = 384 + Math.sin(boss.phase * 1.5) * 10;
    const hoverTarget = clamp(state.player.x + 220, state.level.boss.arenaStart + 140, state.level.boss.arenaEnd - boss.w - 90);
    boss.x += Math.sign(hoverTarget - boss.x) * (lowHp ? 124 : 92) * dt;
    boss.y = baseY;
    if (boss.cooldown <= 0) {
      boss.cooldown = lowHp ? 1.05 : 1.35;
      boss.attack = "telegraph";
      boss.telegraph = lowHp ? 0.42 : 0.56;
      playSfx([{ freq: 250, duration: 0.08, gain: 0.06, type: "square" }, { freq: 198, duration: 0.14, gain: 0.05, type: "triangle", offset: 0.03 }]);
    }
    if (boss.attack === "telegraph") {
      boss.telegraph -= dt;
      if (boss.telegraph <= 0) {
        boss.attack = "idle";
        const targetX = state.player.x + state.player.w / 2;
        const targetY = state.player.y + 26;
        const originX = boss.x + 18;
        const originY = boss.y + boss.h - 18;
        const dx = targetX - originX;
        const dy = targetY - originY;
        const length = Math.max(1, Math.hypot(dx, dy));
        const speed = lowHp ? 260 : 220;
        const volley = lowHp ? 2 : 1;
        for (let i = 0; i < volley; i += 1) {
          state.projectiles.push({
            x: boss.x + 18 + (i * 48),
            y: boss.y + boss.h - 18,
            vx: (dx / length) * speed,
            vy: (dy / length) * speed + (i === 0 ? -10 : 10),
            w: 18,
            h: 18,
            color: i === 0 ? "#ffc16c" : "#ffe29a",
            life: 4.2,
            owner: "boss-missile",
            gravity: false,
            reflectable: true,
            explosive: true,
          });
        }
        playSfx([{ freq: 320, duration: 0.08, gain: 0.07, type: "sawtooth" }, { freq: 460, duration: 0.1, gain: 0.04, type: "square", offset: 0.03 }]);
      }
    }
  } else if (boss.type === "rivet") {
    boss.slamFlash = Math.max(0, boss.slamFlash - dt);
    if (boss.attack === "charge") {
      boss.x += boss.dir * (lowHp ? 380 : 300) * dt;
      if (boss.x < state.level.boss.arenaStart + 40 || boss.x + boss.w > state.level.boss.arenaEnd - 40) {
        boss.x = clamp(boss.x, state.level.boss.arenaStart + 40, state.level.boss.arenaEnd - boss.w - 40);
        boss.attack = "stunned";
        boss.stun = lowHp ? 1.55 : 1.9;
        boss.vulnerable = true;
        boss.dir *= -1;
        boss.slamFlash = 0.22;
        playSfx([
          { freq: 110, duration: 0.18, gain: 0.12, type: "sawtooth" },
          { freq: 74, duration: 0.24, gain: 0.09, type: "triangle", offset: 0.03 },
        ]);
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffd19f", 24);
      }
    } else if (boss.attack === "telegraph") {
      boss.vulnerable = false;
      boss.telegraph -= dt;
      boss.x += Math.sin(boss.phase * 8) * 34 * dt;
      if (boss.telegraph <= 0) {
        boss.attack = "charge";
        boss.dir = boss.chargeTarget > boss.x ? 1 : -1;
        playSfx([{ freq: 220, duration: 0.09, gain: 0.08, type: "square" }, { freq: 164, duration: 0.14, gain: 0.05, type: "triangle", offset: 0.03 }]);
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
      const targetX = clamp(state.player.x - 40, state.level.boss.arenaStart + 140, state.level.boss.arenaEnd - boss.w - 140);
      boss.x += Math.sign(targetX - boss.x) * (lowHp ? 120 : 86) * dt;
      if (boss.cooldown <= 0) {
        boss.attack = "telegraph";
        boss.chargeTarget = state.player.x + (state.player.w / 2);
        boss.telegraph = lowHp ? 0.48 : 0.7;
        boss.cooldown = lowHp ? 0.82 : 1.05;
      }
    }
    boss.y = 396 + Math.sin(boss.phase * (boss.attack === "charge" ? 12 : 4)) * (boss.attack === "charge" ? 2 : 1);
  } else if (boss.type === "monarch") {
    if (boss.attack === "slam") {
      boss.vulnerable = false;
      boss.x += (boss.chargeTarget - boss.x) * Math.min(1, dt * 5.4);
      boss.y += (lowHp ? 460 : 390) * dt;
      if (boss.y >= 394) {
        boss.y = 394;
        boss.attack = "overload";
        boss.vulnerable = true;
        boss.stun = lowHp ? 1.35 : 1.05;
        spawnProjectile(boss.x + 24, boss.y + boss.h - 18, -180, -80, "#ff9f70");
        spawnProjectile(boss.x + boss.w - 24, boss.y + boss.h - 18, 180, -80, "#ffcf7e");
        playSfx([{ freq: 130, duration: 0.14, gain: 0.1, type: "sawtooth" }, { freq: 82, duration: 0.24, gain: 0.08, type: "triangle", offset: 0.03 }]);
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h, "#ffd39c", 24);
      }
    } else if (boss.attack === "telegraph") {
      boss.vulnerable = false;
      boss.telegraph -= dt;
      boss.y = 316 + Math.sin(boss.phase * 8) * 8;
      if (boss.telegraph <= 0) {
        boss.attack = "slam";
        playSfx([{ freq: 240, duration: 0.08, gain: 0.07, type: "square" }, { freq: 170, duration: 0.14, gain: 0.05, type: "triangle", offset: 0.02 }]);
      }
    } else if (boss.attack === "overload") {
      boss.vulnerable = true;
      if (boss.stun <= 0) {
        boss.attack = "idle";
        boss.vulnerable = false;
        boss.cooldown = lowHp ? 0.95 : 1.25;
      }
    } else {
      boss.vulnerable = false;
      boss.x += boss.dir * (lowHp ? 130 : 86) * dt;
      boss.y = 388 + Math.sin(boss.phase * 2.2) * 10;
      if (boss.x < state.level.boss.arenaStart + 40 || boss.x + boss.w > state.level.boss.arenaEnd - 40) {
        boss.dir *= -1;
      }
      if (boss.cooldown <= 0) {
        if ((Math.floor(boss.phase * 10) % 2) === 0) {
          boss.cooldown = lowHp ? 0.72 : 1.05;
          spawnProjectile(boss.x + 30, boss.y + 48, -180, 0, "#ff9f70");
          spawnProjectile(boss.x + boss.w - 30, boss.y + 48, 180, 0, "#ffcf7e");
          if (lowHp) {
            spawnProjectile(boss.x + boss.w / 2, boss.y + 18, 0, -160, "#ffdcb1");
          }
        } else {
          boss.attack = "telegraph";
          boss.telegraph = lowHp ? 0.52 : 0.78;
          boss.chargeTarget = clamp(state.player.x - (boss.w / 2) + 18, state.level.boss.arenaStart + 40, state.level.boss.arenaEnd - boss.w - 40);
          boss.y = 300;
        }
      }
    }
  } else {
    boss.vulnerable = false;
  }

  const playerBounds = getPlayerBounds(state.player);
  if (aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, boss.x, boss.y, boss.w, boss.h)) {
    const stomping = state.player.vy > 120 && playerBounds.y + playerBounds.h - 10 < boss.y + 14;
    if (stomping) {
      state.player.vy = -430;
      state.message = `${boss.name} shrugs off the stomp, but Box Boy bounces clear.`;
    } else {
      damagePlayer(boss.x);
    }
  }

  if (state.player.punchTimer > 0) {
    const hitboxX = state.player.punchSide === "right" ? state.player.x + state.player.w : state.player.x - 40;
    const bossHitX = boss.type === "rivet" && boss.vulnerable ? boss.x - 18 : boss.x;
    const bossHitY = boss.type === "rivet" && boss.vulnerable ? boss.y - 10 : boss.y;
    const bossHitW = boss.type === "rivet" && boss.vulnerable ? boss.w + 36 : boss.w;
    const bossHitH = boss.type === "rivet" && boss.vulnerable ? boss.h + 18 : boss.h;
    if (aabb(hitboxX, playerBounds.y + 6, 40, 32, bossHitX, bossHitY, bossHitW, bossHitH)) {
      state.player.punchTimer = 0;
      if (boss.type === "graft") {
        state.message = "Direct punches will not work. Reflect a missile back at him.";
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#b7c8da", 8);
        return;
      }
        if (boss.vulnerable) {
          boss.hp -= 1;
          state.message = boss.hp <= 0 ? `${boss.name} is finished.` : `${boss.name} reels from the punch.`;
          playSfx([{ freq: 210, duration: 0.08, gain: 0.08, type: "square" }, { freq: 150, duration: 0.16, gain: 0.05, type: "triangle", offset: 0.02 }]);
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
  const playerBounds = getPlayerBounds(state.player);
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    if (projectile.gravity !== false && projectile.owner !== "player" && projectile.owner !== "reflected") projectile.vy += 240 * dt;
    projectile.life -= dt;

    if (projectile.reflectable && state.player.punchTimer > 0) {
      const hitboxX = state.player.punchSide === "right" ? state.player.x + state.player.w : state.player.x - 40;
      const hitboxY = playerBounds.y + 6;
      if (aabb(hitboxX, hitboxY, 40, 32, projectile.x, projectile.y, projectile.w, projectile.h)) {
        projectile.owner = "reflected";
        projectile.reflectable = false;
        projectile.gravity = false;
        projectile.color = "#fff2a8";
        const boss = state.boss;
        if (boss) {
          const dx = (boss.x + boss.w / 2) - projectile.x;
          const dy = (boss.y + boss.h / 2) - projectile.y;
          const length = Math.max(1, Math.hypot(dx, dy));
          projectile.vx = (dx / length) * 340;
          projectile.vy = (dy / length) * 340;
          state.player.punchTimer = 0;
          state.message = "Perfect timing. The missile flies back at Graft King.";
          playSfx([{ freq: 390, duration: 0.08, gain: 0.08, type: "square" }, { freq: 520, duration: 0.12, gain: 0.05, type: "triangle", offset: 0.03 }]);
        }
      }
    }

    if (projectile.owner !== "player" && projectile.owner !== "reflected"
      && aabb(playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h, projectile.x, projectile.y, projectile.w, projectile.h)) {
      damagePlayer(projectile.x);
      if (projectile.owner === "boss-missile") {
        state.message = "Too late. The missile explodes on Box Boy.";
        playSfx([{ freq: 92, duration: 0.18, gain: 0.12, type: "sawtooth" }, { freq: 66, duration: 0.26, gain: 0.08, type: "triangle", offset: 0.03 }]);
        spawnParticles(projectile.x, projectile.y, "#ffb274", 24);
      }
      projectile.life = 0;
    }

    if (projectile.owner === "player") {
      for (const enemy of state.enemies) {
        if (enemy.hp > 0 && aabb(projectile.x, projectile.y, projectile.w, projectile.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
          enemy.hp -= 1;
          projectile.life = 0;
          if (enemy.hp <= 0) {
            state.totalDefeats += 1;
            state.message = "Laser hit. Enemy down.";
            spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#7ee8ff", 16);
          } else {
            state.message = "Laser hit. Enemy injured.";
            spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#9cefff", 10);
          }
          break;
        }
      }
      if (state.boss && projectile.life > 0 && aabb(projectile.x, projectile.y, projectile.w, projectile.h, state.boss.x, state.boss.y, state.boss.w, state.boss.h)) {
        if (state.boss.vulnerable) {
          state.boss.hp -= 1;
          state.message = `${state.boss.name} gets tagged by the laser.`;
          playSfx([{ freq: 320, duration: 0.08, gain: 0.06, type: "square" }, { freq: 240, duration: 0.14, gain: 0.05, type: "triangle", offset: 0.02 }]);
          if (state.boss.hp <= 0) saveProgress();
        }
        projectile.life = 0;
      }
    }

    if (projectile.owner === "reflected" && state.boss
      && aabb(projectile.x, projectile.y, projectile.w, projectile.h, state.boss.x, state.boss.y, state.boss.w, state.boss.h)) {
      state.boss.hp -= 1;
      state.message = state.boss.hp <= 0
        ? `${state.boss.name} takes the full blast and goes down.`
        : `${state.boss.name} gets blown back by his own missile.`;
      playSfx([{ freq: 180, duration: 0.08, gain: 0.09, type: "square" }, { freq: 110, duration: 0.18, gain: 0.06, type: "triangle", offset: 0.02 }]);
      spawnParticles(projectile.x, projectile.y, "#ffd39c", 22);
      projectile.life = 0;
      if (state.boss.hp <= 0) saveProgress();
    }

    for (const platform of getPlatforms()) {
      if (aabb(projectile.x, projectile.y, projectile.w, projectile.h, platform.x, platform.y, platform.w, platform.h)) {
        if (projectile.owner === "boss-missile" || projectile.owner === "reflected") {
          spawnParticles(projectile.x, projectile.y, projectile.owner === "reflected" ? "#fff0b2" : "#ffb274", 18);
          playSfx([{ freq: projectile.owner === "reflected" ? 150 : 96, duration: 0.12, gain: 0.08, type: "sawtooth" }]);
          projectile.life = 0;
          continue;
        }
        if (projectile.owner !== "player" || platform.type !== "sewer") projectile.life = 0;
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
    state.message = state.level.outro || `${state.level.name} cleared.`;
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
  if (state.player && state.player.y > 620) {
    ctx.fillStyle = "#050608";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 12; i += 1) {
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(0, i * 44, WIDTH, 2);
    }
    return;
  }
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

  if (state.level?.id === "city-hall-siege") {
    const facadeX = worldToScreen(3220);
    const entryX = worldToScreen(3450);
    ctx.fillStyle = "rgba(208,214,229,0.92)";
    ctx.fillRect(facadeX, 106, 310, 390);
    ctx.fillStyle = "rgba(127,139,166,0.95)";
    ctx.fillRect(facadeX + 28, 120, 32, 376);
    ctx.fillRect(facadeX + 120, 120, 32, 376);
    ctx.fillRect(facadeX + 214, 120, 32, 376);
    ctx.fillRect(facadeX + 12, 118, 284, 16);
    ctx.fillRect(facadeX + 12, 166, 284, 10);
    ctx.fillStyle = "rgba(52,63,88,0.95)";
    ctx.fillRect(facadeX + 82, 256, 130, 240);
    ctx.fillStyle = "rgba(255,232,183,0.22)";
    ctx.fillRect(facadeX + 98, 272, 98, 180);
    ctx.fillStyle = "rgba(43,50,67,0.88)";
    if (entryX < WIDTH) {
      ctx.fillRect(entryX, 0, WIDTH - entryX, HEIGHT);
      for (let i = 0; i < 8; i += 1) {
        const panelX = entryX + 32 + (i * 96);
        ctx.fillStyle = "rgba(98,108,136,0.52)";
        ctx.fillRect(panelX, 62, 34, 372);
        ctx.fillStyle = "rgba(236,214,173,0.18)";
        ctx.fillRect(panelX + 6, 90, 22, 126);
      }
      ctx.fillStyle = "rgba(167,144,103,0.36)";
      ctx.fillRect(entryX, 438, WIDTH - entryX, 58);
      ctx.fillStyle = "rgba(204,183,147,0.16)";
      for (let i = 0; i < WIDTH - entryX; i += 36) ctx.fillRect(entryX + i, 450, 18, 2);
    }
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
  const palette = [
    { shirt: "#d97f7f", pants: "#4f5d7d", hair: "#5d3c2a", skin: "#f0c3a2" },
    { shirt: "#7ea6d9", pants: "#3f4d61", hair: "#2f2a2c", skin: "#d9ab86" },
    { shirt: "#8bc18b", pants: "#445144", hair: "#6a5134", skin: "#e7bf9d" },
    { shirt: "#d9bf7e", pants: "#5d4a3c", hair: "#3f2a22", skin: "#c99673" },
  ][Math.abs(Math.floor(civ.x / 120)) % 4];
  ctx.fillStyle = "rgba(141, 235, 175, 0.14)";
  ctx.beginPath();
  ctx.arc(x + 13, y + 16, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.skin;
  ctx.beginPath();
  ctx.arc(x + 13, y + 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.hair;
  ctx.fillRect(x + 6, y + 2, 14, 5);
  ctx.fillStyle = palette.shirt;
  ctx.fillRect(x + 7, y + 16, 12, 16);
  ctx.fillStyle = palette.pants;
  ctx.fillRect(x + 8, y + 32, 4, 10);
  ctx.fillRect(x + 14, y + 32, 4, 10);
  ctx.fillStyle = palette.skin;
  ctx.fillRect(x + 3, y + 18, 4, 10);
  ctx.fillRect(x + 19, y + 18, 4, 10);
  ctx.fillStyle = "#f6fbff";
  ctx.fillRect(x + 10, y + 11, 2, 2);
  ctx.fillRect(x + 15, y + 11, 2, 2);
  ctx.fillStyle = "rgba(131, 231, 173, 0.18)";
  ctx.fillRect(x - 2, y + 10, 30, 34);
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
  if (boss.type === "monarch") {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x + 18, y + boss.h + 4, boss.w - 24, 10);
    ctx.fillStyle = "#20152a";
    ctx.fillRect(x + 30, y + 30, 52, 44);
    ctx.fillStyle = "#5a2340";
    ctx.fillRect(x + 24, y + 18, 64, 22);
    ctx.fillStyle = "#e6c6aa";
    ctx.fillRect(x + 42, y + 8, 24, 18);
    ctx.fillStyle = "#14151f";
    ctx.fillRect(x + 38, y + 2, 32, 10);
    ctx.fillStyle = "#8b2f55";
    ctx.fillRect(x + 20, y + 24, 12, 52);
    ctx.fillRect(x + 80, y + 24, 12, 52);
    ctx.fillStyle = "#d9b14f";
    ctx.fillRect(x + 44, y + 2, 20, 4);
    ctx.fillRect(x + 38, y + 6, 6, 4);
    ctx.fillRect(x + 64, y + 6, 6, 4);
    ctx.fillStyle = "#7de4ff";
    ctx.fillRect(x + 28, y + 46, 16, 8);
    ctx.fillRect(x + 68, y + 46, 16, 8);
    ctx.fillStyle = "#271828";
    ctx.fillRect(x + 38, y + 74, 12, 28);
    ctx.fillRect(x + 62, y + 74, 12, 28);
    ctx.fillStyle = "#ffefbd";
    ctx.fillRect(x + 8, y + 50, 18, 7);
    ctx.fillRect(x + boss.w - 26, y + 50, 18, 7);
  } else if (boss.type === "graft") {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 16, y + boss.h + 6, boss.w - 24, 8);
    ctx.fillStyle = "#2c3242";
    ctx.fillRect(x + 34, y + 26, 56, 42);
    ctx.fillStyle = "#616f86";
    ctx.fillRect(x + 28, y + 10, 68, 22);
    ctx.fillStyle = "#cfd6df";
    ctx.fillRect(x + 46, y + 2, 28, 18);
    ctx.fillStyle = "#171a24";
    ctx.fillRect(x + 44, y - 4, 32, 8);
    ctx.fillStyle = "#f04f66";
    ctx.fillRect(x + 36, y + 18, 12, 8);
    ctx.fillRect(x + 74, y + 18, 12, 8);
    ctx.fillStyle = "#7789a8";
    ctx.fillRect(x + 16, y + 26, 16, 52);
    ctx.fillRect(x + 92, y + 26, 16, 52);
    ctx.fillStyle = boss.attack === "telegraph" ? "#ffd989" : "#ffc965";
    ctx.fillRect(x + 10, y + 44, 28, 10);
    ctx.fillRect(x + boss.w - 38, y + 44, 28, 10);
    ctx.fillStyle = "#a9cfff";
    ctx.fillRect(x + 48, y + 36, 14, 10);
    ctx.fillRect(x + 68, y + 36, 14, 10);
    ctx.fillStyle = "#2a2231";
    ctx.fillRect(x + 44, y + 68, 12, 28);
    ctx.fillRect(x + 72, y + 68, 12, 28);
    ctx.fillStyle = "#9ea9bb";
    ctx.fillRect(x + 38, y + 78, 10, 24);
    ctx.fillRect(x + 78, y + 78, 10, 24);
    if (boss.attack === "telegraph") {
      ctx.fillStyle = "rgba(255,216,141,0.25)";
      ctx.fillRect(x - 10, y - 6, boss.w + 20, boss.h + 12);
    }
  } else if (boss.type === "rivet") {
    const bodyFlash = boss.slamFlash > 0 ? "#ffd1a1" : "#84424b";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x + 40, y + boss.h + 1, boss.w - 70, 12);
    ctx.fillStyle = bodyFlash;
    ctx.fillRect(x + 72, y + 34, 74, 34);
    ctx.fillRect(x + 104, y + 18, 50, 22);
    ctx.fillStyle = "#6a343c";
    ctx.fillRect(x + 44, y + 26, 34, 12);
    ctx.fillRect(x + 144, y + 42, 30, 12);
    ctx.fillRect(x + 22, y + 18, 24, 10);
    ctx.fillStyle = "#a86c44";
    ctx.fillRect(x + 14, y + 22, 28, 14);
    ctx.fillRect(x + 170, y + 42, 26, 12);
    ctx.fillRect(x + 56, y + 58, 14, 8);
    ctx.fillStyle = "#d8a76d";
    ctx.fillRect(x + 116, y + 24, 32, 10);
    ctx.fillRect(x + 16, y + 24, 12, 8);
    ctx.fillStyle = "#332029";
    ctx.fillRect(x + 176, y + 44, 22, 10);
    ctx.fillRect(x + 10, y + 22, 8, 6);
    ctx.fillStyle = "#f6d59c";
    ctx.fillRect(x + 138, y + 28, 8, 5);
    ctx.fillStyle = "#ffb454";
    ctx.fillRect(x + 114, y + 22, 6, 6);
    ctx.fillRect(x + 128, y + 22, 6, 6);
    ctx.fillStyle = "#3b1f26";
    ctx.fillRect(x + 88, y + 68, 18, 46);
    ctx.fillRect(x + 120, y + 66, 20, 48);
    ctx.fillRect(x + 66, y + 50, 10, 14);
    ctx.fillRect(x + 76, y + 50, 8, 12);
    ctx.fillStyle = "#7b4d31";
    ctx.fillRect(x + 66, y + 60, 96, 6);
    ctx.fillRect(x + 38, y + 28, 30, 6);
    ctx.fillRect(x + 30, y + 20, 18, 5);
    ctx.fillRect(x + 150, y + 20, 16, 8);
    ctx.fillRect(x + 166, y + 22, 14, 10);
    ctx.fillStyle = boss.attack === "telegraph" ? "#ffefb8" : "#d6a370";
    ctx.fillRect(x + 4, y + 26, 16, 7);
    ctx.fillRect(x + boss.w - 20, y + 48, 16, 7);
    ctx.fillStyle = "#d2d8e6";
    ctx.fillRect(x + 92, y + 36, 2, 30);
    ctx.fillRect(x + 118, y + 34, 2, 32);
    ctx.fillRect(x + 146, y + 20, 2, 18);
    if (boss.attack === "telegraph") {
      ctx.fillStyle = "rgba(255,224,160,0.35)";
      ctx.fillRect(x - 14, y + 10, boss.w + 28, boss.h - 12);
    }
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
  if (projectile.owner === "player") {
    ctx.fillRect(x, y, projectile.w, projectile.h);
    ctx.fillStyle = "#eaffff";
    ctx.fillRect(x, y + 2, projectile.w, 4);
  } else if (projectile.owner === "boss-missile" || projectile.owner === "reflected") {
    ctx.fillRect(x + 4, y + 4, projectile.w - 8, projectile.h - 8);
    ctx.fillStyle = projectile.owner === "reflected" ? "#fffbe0" : "#d7dde8";
    ctx.fillRect(x + 1, y + 6, 6, projectile.h - 12);
    ctx.fillStyle = projectile.owner === "reflected" ? "#ffd56e" : "#ff884d";
    ctx.beginPath();
    ctx.moveTo(x + projectile.w - 4, y + projectile.h / 2);
    ctx.lineTo(x + projectile.w + 8, y + 4);
    ctx.lineTo(x + projectile.w + 8, y + projectile.h - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = projectile.owner === "reflected" ? "#fffbe0" : "#ffc965";
    ctx.fillRect(x + 8, y + 8, projectile.w - 14, 3);
  } else {
    ctx.beginPath();
    ctx.arc(x + projectile.w / 2, y + projectile.h / 2, projectile.w / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBossArenaMarkers() {
  if (!state.level?.boss) return;
  if (state.level.boss.type === "graft") return;
  const startX = worldToScreen(state.level.boss.arenaStart);
  const endX = worldToScreen(state.level.boss.arenaEnd);
  ctx.fillStyle = "rgba(255,214,125,0.18)";
  ctx.fillRect(startX - 8, 40, 16, HEIGHT - 84);
  ctx.fillRect(endX - 8, 40, 16, HEIGHT - 84);
  ctx.fillStyle = "rgba(255,239,189,0.46)";
  for (let y = 60; y < HEIGHT - 60; y += 28) {
    ctx.fillRect(startX - 8, y, 16, 8);
    ctx.fillRect(endX - 8, y, 16, 8);
  }
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
  const crouching = player.crouching;
  const legOffset = moving ? Math.sin(player.walkCycle) * 4 : 0;
  const armOffset = moving ? Math.cos(player.walkCycle) * 3 : 0;
  const trailSign = gliding ? -player.facing : moving ? -Math.sign(player.vx) : 0;
  const capeSpread = gliding ? 46 : moving ? 24 : 8;
  const capeLift = gliding ? -8 : moving ? -2 : crouching ? 12 : 12;
  const capeHem = gliding ? 28 : moving ? 50 : crouching ? 62 : 62;
  const torsoY = crouching ? y + 50 : y + 34;
  const headY = crouching ? y + 40 : y + 24;
  const legY = crouching ? y + 70 : y + 60;
  const boxY = crouching ? y + 24 : y + 8;

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
      [x + 16, y + (crouching ? 72 : 68)],
      [x + 34, y + (crouching ? 64 : 60)],
      [x + 32, y + (crouching ? 42 : 30)],
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
  ctx.fillRect(x + 11, torsoY, 18, crouching ? 16 : 28);
  ctx.fillStyle = "#e0b08a";
  ctx.fillRect(x + 14, headY, 12, 10);
  ctx.fillStyle = "#2f3953";
  ctx.fillRect(x + 9, legY, 10, crouching ? 12 : 20);
  ctx.fillRect(x + 21, legY, 10, crouching ? 12 : 20);
  ctx.fillStyle = "#4d5c82";
  ctx.fillRect(x + 9, torsoY, 22, 10);
  ctx.fillRect(x + 7, torsoY + 10, 26, 8);
  ctx.fillStyle = "#f0d4bc";
  ctx.fillRect(x + 3 - armOffset * 0.25, torsoY + 12 + armOffset * 0.15, 6, 11);
  ctx.fillRect(x + 31 - armOffset * 0.25, torsoY + 12 - armOffset * 0.15, 6, 11);
  ctx.fillStyle = "#c79663";
  ctx.fillRect(x - 1 + armOffset * 0.3, torsoY + 10 + armOffset * 0.15, 10, 14);
  ctx.fillRect(x + 31 + armOffset * 0.3, torsoY + 10 - armOffset * 0.15, 10, 14);
  ctx.fillRect(x + 7, y + (crouching ? 82 : 76) + legOffset, 12, 10);
  ctx.fillRect(x + 21, y + (crouching ? 82 : 76) - legOffset, 12, 10);
  ctx.fillStyle = "#7f5735";
  ctx.fillRect(x + 7, y + 86 + legOffset, 12, 8);
  ctx.fillRect(x + 21, y + 86 - legOffset, 12, 8);

  ctx.fillStyle = "#c79663";
  ctx.fillRect(x + 6, boxY, 28, 24);
  ctx.strokeStyle = "#7d552f";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, boxY, 28, 24);
  ctx.beginPath();
  ctx.moveTo(x + 20, boxY);
  ctx.lineTo(x + 20, boxY + 24);
  ctx.moveTo(x + 6, boxY + 12);
  ctx.lineTo(x + 34, boxY + 12);
  ctx.stroke();
  ctx.fillStyle = "#4c2e1a";
  ctx.fillRect(x + 12, boxY + 8, 16, 4);
  ctx.fillStyle = "#f0e2cb";
  ctx.fillRect(x + 16, headY + 10, 8, 4);
  ctx.fillStyle = "#8d633b";
  ctx.fillRect(x - 2 + armOffset * 0.3, torsoY + 12 + armOffset * 0.15, 4, 8);
  ctx.fillRect(x + 38 + armOffset * 0.3, torsoY + 12 - armOffset * 0.15, 4, 8);
  ctx.fillRect(x + 8, y + (crouching ? 84 : 78) + legOffset, 4, 8);
  ctx.fillRect(x + 28, y + (crouching ? 84 : 78) - legOffset, 4, 8);
  ctx.fillStyle = "#f0e2cb";
  ctx.fillRect(x + 11, torsoY + 1, 2, 14);
  ctx.fillRect(x + 27, torsoY + 1, 2, 14);

  if (player.punchTimer > 0) {
    const punchX = player.punchSide === "right" ? x + 45 : x - 19;
    ctx.fillStyle = "#e0b08a";
    ctx.fillRect(punchX, torsoY + 12, 14, 6);
    ctx.fillStyle = "#c79663";
    ctx.fillRect(player.punchSide === "right" ? x + 33 : x - 15, torsoY + 10, 20, 10);
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

function drawCheckpoint(checkpoint, active) {
  const x = worldToScreen(checkpoint.x);
  const y = worldToScreenY(checkpoint.y);
  ctx.fillStyle = active ? "#ffd36c" : "rgba(220,231,255,0.42)";
  ctx.fillRect(x - 4, y - 44, 8, 48);
  ctx.fillStyle = active ? "#ffefb8" : "#dce7ff";
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 42);
  ctx.lineTo(x + 28, y - 32);
  ctx.lineTo(x + 4, y - 20);
  ctx.closePath();
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
  ctx.font = "700 20px Verdana";
  ctx.fillText(state.level.name, 34, 46);
  ctx.font = "15px Verdana";
  drawWrappedText(getPriorityText(), 34, 72, 340, 16, "#17345f");

  if (state.boss) {
    drawPanel(632, 20, 278, 28, "rgba(255,255,255,0.82)");
    ctx.fillStyle = "#ff936e";
    ctx.fillRect(638, 26, (state.boss.hp / state.boss.maxHp) * 266, 16);
    ctx.fillStyle = "#17345f";
    ctx.font = "700 12px Verdana";
    ctx.fillText(state.boss.name.toUpperCase(), 644, 40);
  }

  drawPanel(372, 18, 258, 32, "rgba(255, 220, 118, 0.96)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 13px Verdana";
  ctx.fillText("J/K PUNCH   HOLD FOR LASER", 386, 39);
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
  drawBossArenaMarkers();
  for (let i = 0; i < state.checkpoints.length; i += 1) drawCheckpoint(state.checkpoints[i], i <= state.checkpointIndex);
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
  drawPanel(88, 54, 784, 388, "rgba(255,255,255,0.92)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText(state.level.chapter, 128, 96);
  ctx.font = "800 38px Verdana";
  drawWrappedText(storyBeats[state.storyCard].title, 128, 138, 690, 40, "#17345f");
  ctx.font = "18px Verdana";
  let cy = drawWrappedText(storyBeats[state.storyCard].body, 128, 198, 690, 28, "#17345f");
  if (state.level.introDialog) {
    drawPanel(124, cy + 8, 702, 62, "rgba(20,35,61,0.86)");
    ctx.fillStyle = "#fff1b8";
    ctx.font = "700 15px Trebuchet MS";
    drawWrappedText(state.level.introDialog, 146, cy + 34, 660, 18, "#fff1b8");
    cy += 82;
  }
  drawPanel(124, cy + 8, 702, 114, "rgba(19,52,95,0.08)");
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillStyle = "#17345f";
  ctx.fillText(state.level.name, 146, cy + 36);
  ctx.font = "18px Verdana";
  cy = drawWrappedText(state.level.story, 146, cy + 64, 664, 26, "#17345f");
  drawButton(224, 454, 512, 48, "PRESS ENTER TO START THE STAGE", "700 18px Trebuchet MS");
}

function drawTitle() {
  drawParallax("skyline-sunset");
  drawPanel(138, 84, 694, 336, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 52px Verdana";
  ctx.fillText("BOX BOY", 352, 152);
  ctx.font = "800 28px Verdana";
  ctx.fillText("Rise Against Monarch", 330, 190);
  ctx.font = "18px Verdana";
  drawWrappedText("A story-mode platformer about a powerless hero trying to defeat the biggest villain in the city and prove he belongs in the skyline.", 154, 242, 632, 24, "#17345f");
  drawWrappedText("Run, jump, double jump, glide with the blanket cape, clear parkour routes, rescue civilians, and fight through Monarch's districts.", 154, 288, 632, 24, "#17345f");
  drawWrappedText("Controls: move with WASD or arrows, jump with Space, jump again for a double jump, hold Space to glide, punch with J and K. Press Escape anytime to open the city map.", 146, 334, 644, 22, "#17345f");
  drawButton(322, 448, 314, 48, "PRESS ENTER TO START", "700 20px Trebuchet MS");
}

function drawStatusScreen(title, body) {
  drawParallax("civic-night");
  ctx.font = "18px Verdana";
  const bodyHeight = Math.max(24, Math.ceil(ctx.measureText(body).width / 534) * 24);
  const outroText = state.scene === scenes.levelClear ? (state.level?.outro || "") : "";
  const outroHeight = outroText ? Math.max(22, Math.ceil(ctx.measureText(outroText).width / 500) * 22) : 0;
  const outroPanelHeight = outroText ? outroHeight + 32 : 0;
  const contentHeight = 144 + bodyHeight + (outroText ? outroPanelHeight + 20 : 0) + 88;
  const panelHeight = Math.max(286, contentHeight);
  const panelY = Math.max(62, Math.floor((HEIGHT - panelHeight) / 2));
  drawPanel(160, panelY, 640, panelHeight, "rgba(255,247,220,0.95)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 34px Verdana";
  ctx.textAlign = "center";
  ctx.fillText(title, 480, panelY + 94);
  ctx.textAlign = "left";
  ctx.font = "18px Verdana";
  let cy = drawWrappedText(body, 214, panelY + 130, 534, 24, "#17345f");
  if (outroText) {
    drawPanel(208, cy + 14, 544, outroPanelHeight, "rgba(19,52,95,0.08)");
    cy = drawWrappedText(outroText, 228, cy + 40, 500, 22, "#17345f");
  }
  ctx.fillText(`Total rescues: ${state.totalRescues}`, 214, cy + 18);
  ctx.fillText(`Enemies defeated: ${state.totalDefeats}`, 214, cy + 46);
  ctx.fillText("Press Enter to continue.", 214, cy + 78);
}

function drawMapScreen() {
  drawParallax("civic-night");
  drawPanel(18, 18, 924, 500, "rgba(255,255,255,0.84)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 42px Verdana";
  ctx.fillText("City Map", 54, 78);
  ctx.font = "16px Verdana";
  drawWrappedText("Choose a level. Locked stages open after you clear the previous one. Press Enter to play. Press Escape to leave the map.", 54, 108, 850, 22, "#17345f");

  const nodes = [
    { x: 108, y: 370 }, { x: 176, y: 322 }, { x: 256, y: 258 }, { x: 344, y: 214 },
    { x: 432, y: 246 }, { x: 526, y: 304 }, { x: 612, y: 364 }, { x: 700, y: 318 },
    { x: 786, y: 254 }, { x: 850, y: 198 }, { x: 894, y: 248 }, { x: 918, y: 174 },
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
    if (levels[i].boss) {
      ctx.fillStyle = "#ff9d7a";
      ctx.fillRect(node.x - 4, node.y - 28, 8, 8);
      ctx.fillRect(node.x - 10, node.y - 22, 20, 4);
    }
    if (selected) {
      drawPanel(node.x - 54, node.y + 26, 132, 28, unlocked ? "rgba(20,35,61,0.88)" : "rgba(70,79,98,0.88)");
      ctx.fillStyle = "#f4f8ff";
      ctx.font = "700 11px Trebuchet MS";
      drawWrappedText(unlocked ? levels[i].name : "LOCKED", node.x - 42, node.y + 44, 104, 14, "#f4f8ff");
    }
  }

  const current = levels[state.mapSelection];
  drawPanel(40, 388, 448, 100, "rgba(20,35,61,0.92)");
  ctx.fillStyle = "#fff1b8";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText(current.name, 62, 416);
  ctx.font = "14px Trebuchet MS";
  drawWrappedText(current.goal, 62, 440, 388, 18, "#edf6ff");
  ctx.fillStyle = "#8fd6ff";
  ctx.fillText(state.mapSelection <= state.highestUnlockedLevel ? "Status: Unlocked" : "Status: Locked", 62, 474);
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
      <p class="tiny">Jump with <kbd>Space</kbd>. Press <kbd>Space</kbd> again in midair to double jump. Hold <kbd>Space</kbd> while falling to glide. Tap <kbd>J</kbd> or <kbd>K</kbd> to punch, or hold them to fire a laser.</p>
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
    ${checklistItem(state.checkpointIndex >= 0, `Checkpoint active: ${state.checkpointIndex >= 0 ? state.checkpoints[state.checkpointIndex].label : "None"}`)}
    <p><strong>Status:</strong> ${state.message}</p>
      <p class="tiny">Stomp enemies to bounce, tap <kbd>J</kbd>/<kbd>K</kbd> to punch, hold them to fire lasers, use checkpoints, crouch tunnels, moving lifts, wind lanes, hidden sewer shortcuts, and watch for heavy guards that take multiple hits.</p>
  `;
}

function frame(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0.016);
  state.lastTime = time;
  if (state.scene === scenes.playing) updateGame(dt);
  updateMusic();
  renderScene();
  renderHud();
  renderMission();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Escape"].includes(event.code)) event.preventDefault();
  ensureAudio();
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
      respawnAtCheckpoint();
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

  if (event.code === "KeyJ" && !wasHeld) {
    beginPunchHold("left");
  }

  if (event.code === "KeyK" && !wasHeld) {
    beginPunchHold("right");
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  if (event.code === "KeyJ") endPunchHold("left");
  if (event.code === "KeyK") endPunchHold("right");
});

window.addEventListener("pointerdown", () => {
  ensureAudio();
});

loadSave();
renderHud();
renderMission();
requestAnimationFrame(frame);
