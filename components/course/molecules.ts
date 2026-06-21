/*
 * ─────────────────────────────────────────────────────────────────────────
 *  3D МОЛЕКУЛА ДЕРЕКТЕРІ (ball-and-stick)
 *  Әр молекула атомдар (el + 3D координат) мен байланыстардан (bond) тұрады.
 *  Координаттар шартты бірлікте, нақты валенттік бұрыштарға жуықтатылған.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ElementInfo = {
  symbol: string
  name: string
  /** CPK-стиліне жуық түс */
  color: string
  /** сфера радиусы (шартты) */
  radius: number
}

/** Атом түстері мен радиустары (күлгін түстен аулақ — өрнектік нұсқаулыққа сай) */
export const ELEMENTS: Record<string, ElementInfo> = {
  H: { symbol: "H", name: "Сутегі", color: "#f1f5f9", radius: 0.32 },
  C: { symbol: "C", name: "Көміртегі", color: "#334155", radius: 0.46 },
  N: { symbol: "N", name: "Азот", color: "#3b82f6", radius: 0.44 },
  O: { symbol: "O", name: "Оттегі", color: "#ef4444", radius: 0.42 },
  Cl: { symbol: "Cl", name: "Хлор", color: "#22c55e", radius: 0.5 },
  Na: { symbol: "Na", name: "Натрий", color: "#f59e0b", radius: 0.58 },
  S: { symbol: "S", name: "Күкірт", color: "#eab308", radius: 0.5 },
  Fe: { symbol: "Fe", name: "Темір", color: "#b45309", radius: 0.6 },
  Mg: { symbol: "Mg", name: "Магний", color: "#84cc16", radius: 0.56 },
  Zn: { symbol: "Zn", name: "Мырыш", color: "#94a3b8", radius: 0.58 },
  Ca: { symbol: "Ca", name: "Кальций", color: "#a3e635", radius: 0.62 },
}

export type Atom = { el: keyof typeof ELEMENTS; pos: [number, number, number] }
export type Bond = { a: number; b: number; order?: 1 | 2 | 3; ionic?: boolean }

export type Molecule = {
  id: string
  name: string
  formula: string
  /** геометрия сипаттамасы (бұрыштық, сызықтық, т.б.) */
  geometry: string
  /** қысқа түсініктеме */
  info: string
  atoms: Atom[]
  bonds: Bond[]
}

export type MoleculeId =
  | "water"
  | "methane"
  | "carbon-dioxide"
  | "hydrogen"
  | "oxygen"
  | "nitrogen"
  | "ammonia"
  | "hydrogen-chloride"
  | "sodium-chloride"
  | "oxygen-atom"
  | "water-cluster"

export const MOLECULES: Record<MoleculeId, Molecule> = {
  water: {
    id: "water",
    name: "Су молекуласы",
    formula: "H₂O",
    geometry: "Бұрыштық (104.5°)",
    info: "Оттегі екі сутегімен ковалентті байланыс түзеді. Молекула полюсті, сондықтан су жақсы еріткіш.",
    atoms: [
      { el: "O", pos: [0, 0, 0] },
      { el: "H", pos: [0.76, 0.59, 0] },
      { el: "H", pos: [-0.76, 0.59, 0] },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
    ],
  },
  methane: {
    id: "methane",
    name: "Метан",
    formula: "CH₄",
    geometry: "Тетраэдрлік (109.5°)",
    info: "Көміртегі төрт сутегімен байланысады. Табиғи газдың негізгі компоненті.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "H", pos: [0.63, 0.63, 0.63] },
      { el: "H", pos: [-0.63, -0.63, 0.63] },
      { el: "H", pos: [-0.63, 0.63, -0.63] },
      { el: "H", pos: [0.63, -0.63, -0.63] },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
    ],
  },
  "carbon-dioxide": {
    id: "carbon-dioxide",
    name: "Көмірқышқыл газы",
    formula: "CO₂",
    geometry: "Сызықтық (180°)",
    info: "Көміртегі екі оттегімен қос байланыс түзеді. Тыныс шығарғанда бөлінеді, фотосинтезге қажет.",
    atoms: [
      { el: "C", pos: [0, 0, 0] },
      { el: "O", pos: [1.16, 0, 0] },
      { el: "O", pos: [-1.16, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  hydrogen: {
    id: "hydrogen",
    name: "Сутегі молекуласы",
    formula: "H₂",
    geometry: "Сызықтық",
    info: "Екі сутегі атомы бір ковалентті байланыспен қосылады. Ең жеңіл газ.",
    atoms: [
      { el: "H", pos: [-0.37, 0, 0] },
      { el: "H", pos: [0.37, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1 }],
  },
  oxygen: {
    id: "oxygen",
    name: "Оттегі молекуласы",
    formula: "O₂",
    geometry: "Сызықтық (қос байланыс)",
    info: "Екі оттегі атомы қос байланыспен қосылады. Жану мен тыныс алуға қажет.",
    atoms: [
      { el: "O", pos: [-0.6, 0, 0] },
      { el: "O", pos: [0.6, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 2 }],
  },
  nitrogen: {
    id: "nitrogen",
    name: "Азот молекуласы",
    formula: "N₂",
    geometry: "Сызықтық (үш байланыс)",
    info: "Азот атомдары мықты үштік байланыспен қосылады. Ауаның 78%-ы азот.",
    atoms: [
      { el: "N", pos: [-0.55, 0, 0] },
      { el: "N", pos: [0.55, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1, order: 3 }],
  },
  ammonia: {
    id: "ammonia",
    name: "Аммиак",
    formula: "NH₃",
    geometry: "Пирамидалық (107°)",
    info: "Азот үш сутегімен байланысып, пирамида тәрізді молекула түзеді. Тыңайтқыш өндірісінде қолданылады.",
    atoms: [
      { el: "N", pos: [0, 0.3, 0] },
      { el: "H", pos: [0.94, -0.2, 0] },
      { el: "H", pos: [-0.47, -0.2, 0.82] },
      { el: "H", pos: [-0.47, -0.2, -0.82] },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
    ],
  },
  "hydrogen-chloride": {
    id: "hydrogen-chloride",
    name: "Хлорсутек",
    formula: "HCl",
    geometry: "Сызықтық (полюсті)",
    info: "Сутегі мен хлор арасындағы полюсті ковалентті байланыс. Суда еріп, тұз қышқылын береді.",
    atoms: [
      { el: "H", pos: [-0.7, 0, 0] },
      { el: "Cl", pos: [0.55, 0, 0] },
    ],
    bonds: [{ a: 0, b: 1 }],
  },
  "sodium-chloride": {
    id: "sodium-chloride",
    name: "Ас тұзы (кристалл торы)",
    formula: "NaCl",
    geometry: "Кубтық иондық тор",
    info: "Na⁺ және Cl⁻ иондары кезектесіп орналасады. Иондық байланыс — қарама-қарсы зарядтардың тартылуы.",
    atoms: [
      { el: "Na", pos: [-0.8, -0.8, -0.8] },
      { el: "Cl", pos: [0.8, -0.8, -0.8] },
      { el: "Cl", pos: [-0.8, 0.8, -0.8] },
      { el: "Na", pos: [0.8, 0.8, -0.8] },
      { el: "Cl", pos: [-0.8, -0.8, 0.8] },
      { el: "Na", pos: [0.8, -0.8, 0.8] },
      { el: "Na", pos: [-0.8, 0.8, 0.8] },
      { el: "Cl", pos: [0.8, 0.8, 0.8] },
    ],
    bonds: [
      { a: 0, b: 1, ionic: true },
      { a: 0, b: 2, ionic: true },
      { a: 0, b: 4, ionic: true },
      { a: 3, b: 1, ionic: true },
      { a: 3, b: 2, ionic: true },
      { a: 3, b: 7, ionic: true },
      { a: 5, b: 1, ionic: true },
      { a: 5, b: 4, ionic: true },
      { a: 5, b: 7, ionic: true },
      { a: 6, b: 2, ionic: true },
      { a: 6, b: 4, ionic: true },
      { a: 6, b: 7, ionic: true },
    ],
  },
  "oxygen-atom": {
    id: "oxygen-atom",
    name: "Оттегі атомы",
    formula: "O",
    geometry: "Жеке атом",
    info: "Ядрода 8 протон, 8 нейтрон. Айналасында 8 электрон екі қабатта қозғалады.",
    atoms: [{ el: "O", pos: [0, 0, 0] }],
    bonds: [],
  },
  "water-cluster": {
    id: "water-cluster",
    name: "Су молекулалары (сұйық)",
    formula: "(H₂O)ₙ",
    geometry: "Сутектік байланыстар",
    info: "Сұйық суда молекулалар сутектік байланыстармен бір-біріне жақын ұсталады.",
    atoms: [
      { el: "O", pos: [0, 0, 0] },
      { el: "H", pos: [0.76, 0.59, 0] },
      { el: "H", pos: [-0.76, 0.59, 0] },
      { el: "O", pos: [1.9, -0.6, 0.4] },
      { el: "H", pos: [2.66, -0.01, 0.4] },
      { el: "H", pos: [1.14, -0.01, 0.4] },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 3, b: 4 },
      { a: 3, b: 5 },
    ],
  },
}
