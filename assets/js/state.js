const STORAGE_TABS_KEY = 'ficha_rpg_tabs_v1';
const FALHAS_MAX = 5;
let effects = [];
let clocks = [];
let counters = [];
let weapons = [];
let gridItems = [];
let repertoires = {
  FORÇA: [],
  INTELIGÊNCIA: []
};
let pericias = {};
let falhasFilled = 0;
let photoData = null;
let activeSheetPane = 'book';

let sheets = [];
let activeSheetId = null;

function createDefaultArchetypeData() {
  return {
    nome: '',
    objetivo: {
      texto: '',
      concluido: false
    },
    talentos: [],
    dadiva: {
      nome: '',
      custoXp: '',
      descricao: ''
    }
  };
}

let archetype = createDefaultArchetypeData();
