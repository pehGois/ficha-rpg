const STORAGE_KEY = 'ficha_rpg';
const FALHAS_MAX = 5;
const DEFAULT_CONDITIONS = ['Nos Portões da Morte', 'Louco', 'Inconsciente'];

let customConditions = [];
let activeConditions = new Set();
let trainings = [];
let abilities = [];
let effects = [];
let clocks = [];
let falhasFilled = 0;
let photoData = null;
