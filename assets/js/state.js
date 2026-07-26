const STORAGE_KEY = 'ficha_rpg';
const STORAGE_TABS_KEY = 'ficha_rpg_tabs_v1';
const FALHAS_MAX = 5;
let trainings = [];
let abilities = [];
let effects = [];
let clocks = [];
let counters = [];
let weapons = [];
let inventory = [];
let pericias = {};
let falhasFilled = 0;
let photoData = null;
let activeSheetPane = 'book';

let sheets = [];
let activeSheetId = null;
