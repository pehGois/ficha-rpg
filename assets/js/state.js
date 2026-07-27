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

function createDefaultArchetypeData() {
  return {
    nome: '',
    xp: '',
    ideaisMaiores: {
      desafio: false,
      antecedente: false,
      dificuldade: false
    },
    ideaisMenores: [],
    poderes: [],
    peculiaridade: {
      nome: '',
      custoXp: '',
      descricao: ''
    },
    sombra: {
      marcacoes: [
        { id: `arq-${Date.now()}-0`, label: 'XP ≤ 0', descricao: '' },
        { id: `arq-${Date.now()}-1`, label: 'XP ≤ 5', descricao: '' },
        { id: `arq-${Date.now()}-2`, label: 'XP ≤ 10', descricao: '' }
      ]
    }
  };
}

let archetype = createDefaultArchetypeData();
