export type Category =
  | "alkali"
  | "alkaline"
  | "transition"
  | "post"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble"
  | "lanthanide"
  | "actinide"

export type Element = {
  n: number
  sym: string
  name: string
  nameKz: string
  cat: Category
  x: number
  y: number
  mass: string
}

// [number, symbol, english name, kazakh name, category, group(x), period(y), mass]
type Row = [number, string, string, string, Category, number, number, string]

const RAW: Row[] = [
  [1, "H", "Hydrogen", "Сутегі", "nonmetal", 1, 1, "1.008"],
  [2, "He", "Helium", "Гелий", "noble", 18, 1, "4.003"],
  [3, "Li", "Lithium", "Литий", "alkali", 1, 2, "6.94"],
  [4, "Be", "Beryllium", "Бериллий", "alkaline", 2, 2, "9.012"],
  [5, "B", "Boron", "Бор", "metalloid", 13, 2, "10.81"],
  [6, "C", "Carbon", "Көміртегі", "nonmetal", 14, 2, "12.011"],
  [7, "N", "Nitrogen", "Азот", "nonmetal", 15, 2, "14.007"],
  [8, "O", "Oxygen", "Оттегі", "nonmetal", 16, 2, "15.999"],
  [9, "F", "Fluorine", "Фтор", "halogen", 17, 2, "18.998"],
  [10, "Ne", "Neon", "Неон", "noble", 18, 2, "20.180"],
  [11, "Na", "Sodium", "Натрий", "alkali", 1, 3, "22.990"],
  [12, "Mg", "Magnesium", "Магний", "alkaline", 2, 3, "24.305"],
  [13, "Al", "Aluminium", "Алюминий", "post", 13, 3, "26.982"],
  [14, "Si", "Silicon", "Кремний", "metalloid", 14, 3, "28.085"],
  [15, "P", "Phosphorus", "Фосфор", "nonmetal", 15, 3, "30.974"],
  [16, "S", "Sulfur", "Күкірт", "nonmetal", 16, 3, "32.06"],
  [17, "Cl", "Chlorine", "Хлор", "halogen", 17, 3, "35.45"],
  [18, "Ar", "Argon", "Аргон", "noble", 18, 3, "39.948"],
  [19, "K", "Potassium", "Калий", "alkali", 1, 4, "39.098"],
  [20, "Ca", "Calcium", "Кальций", "alkaline", 2, 4, "40.078"],
  [21, "Sc", "Scandium", "Скандий", "transition", 3, 4, "44.956"],
  [22, "Ti", "Titanium", "Титан", "transition", 4, 4, "47.867"],
  [23, "V", "Vanadium", "Ванадий", "transition", 5, 4, "50.942"],
  [24, "Cr", "Chromium", "Хром", "transition", 6, 4, "51.996"],
  [25, "Mn", "Manganese", "Марганец", "transition", 7, 4, "54.938"],
  [26, "Fe", "Iron", "Темір", "transition", 8, 4, "55.845"],
  [27, "Co", "Cobalt", "Кобальт", "transition", 9, 4, "58.933"],
  [28, "Ni", "Nickel", "Никель", "transition", 10, 4, "58.693"],
  [29, "Cu", "Copper", "Мыс", "transition", 11, 4, "63.546"],
  [30, "Zn", "Zinc", "Мырыш", "transition", 12, 4, "65.38"],
  [31, "Ga", "Gallium", "Галлий", "post", 13, 4, "69.723"],
  [32, "Ge", "Germanium", "Германий", "metalloid", 14, 4, "72.630"],
  [33, "As", "Arsenic", "Мышьяк", "metalloid", 15, 4, "74.922"],
  [34, "Se", "Selenium", "Селен", "nonmetal", 16, 4, "78.971"],
  [35, "Br", "Bromine", "Бром", "halogen", 17, 4, "79.904"],
  [36, "Kr", "Krypton", "Криптон", "noble", 18, 4, "83.798"],
  [37, "Rb", "Rubidium", "Рубидий", "alkali", 1, 5, "85.468"],
  [38, "Sr", "Strontium", "Стронций", "alkaline", 2, 5, "87.62"],
  [39, "Y", "Yttrium", "Иттрий", "transition", 3, 5, "88.906"],
  [40, "Zr", "Zirconium", "Цирконий", "transition", 4, 5, "91.224"],
  [41, "Nb", "Niobium", "Ниобий", "transition", 5, 5, "92.906"],
  [42, "Mo", "Molybdenum", "Молибден", "transition", 6, 5, "95.95"],
  [43, "Tc", "Technetium", "Технеций", "transition", 7, 5, "98"],
  [44, "Ru", "Ruthenium", "Рутений", "transition", 8, 5, "101.07"],
  [45, "Rh", "Rhodium", "Родий", "transition", 9, 5, "102.91"],
  [46, "Pd", "Palladium", "Палладий", "transition", 10, 5, "106.42"],
  [47, "Ag", "Silver", "Күміс", "transition", 11, 5, "107.87"],
  [48, "Cd", "Cadmium", "Кадмий", "transition", 12, 5, "112.41"],
  [49, "In", "Indium", "Индий", "post", 13, 5, "114.82"],
  [50, "Sn", "Tin", "Қалайы", "post", 14, 5, "118.71"],
  [51, "Sb", "Antimony", "Сурьма", "metalloid", 15, 5, "121.76"],
  [52, "Te", "Tellurium", "Теллур", "metalloid", 16, 5, "127.60"],
  [53, "I", "Iodine", "Йод", "halogen", 17, 5, "126.90"],
  [54, "Xe", "Xenon", "Ксенон", "noble", 18, 5, "131.29"],
  [55, "Cs", "Caesium", "Цезий", "alkali", 1, 6, "132.91"],
  [56, "Ba", "Barium", "Барий", "alkaline", 2, 6, "137.33"],
  [72, "Hf", "Hafnium", "Гафний", "transition", 4, 6, "178.49"],
  [73, "Ta", "Tantalum", "Тантал", "transition", 5, 6, "180.95"],
  [74, "W", "Tungsten", "Вольфрам", "transition", 6, 6, "183.84"],
  [75, "Re", "Rhenium", "Рений", "transition", 7, 6, "186.21"],
  [76, "Os", "Osmium", "Осмий", "transition", 8, 6, "190.23"],
  [77, "Ir", "Iridium", "Иридий", "transition", 9, 6, "192.22"],
  [78, "Pt", "Platinum", "Платина", "transition", 10, 6, "195.08"],
  [79, "Au", "Gold", "Алтын", "transition", 11, 6, "196.97"],
  [80, "Hg", "Mercury", "Сынап", "transition", 12, 6, "200.59"],
  [81, "Tl", "Thallium", "Таллий", "post", 13, 6, "204.38"],
  [82, "Pb", "Lead", "Қорғасын", "post", 14, 6, "207.2"],
  [83, "Bi", "Bismuth", "Висмут", "post", 15, 6, "208.98"],
  [84, "Po", "Polonium", "Полоний", "metalloid", 16, 6, "209"],
  [85, "At", "Astatine", "Астат", "halogen", 17, 6, "210"],
  [86, "Rn", "Radon", "Радон", "noble", 18, 6, "222"],
  [87, "Fr", "Francium", "Франций", "alkali", 1, 7, "223"],
  [88, "Ra", "Radium", "Радий", "alkaline", 2, 7, "226"],
  [104, "Rf", "Rutherfordium", "Резерфордий", "transition", 4, 7, "267"],
  [105, "Db", "Dubnium", "Дубний", "transition", 5, 7, "268"],
  [106, "Sg", "Seaborgium", "Сиборгий", "transition", 6, 7, "269"],
  [107, "Bh", "Bohrium", "Борий", "transition", 7, 7, "270"],
  [108, "Hs", "Hassium", "Хассий", "transition", 8, 7, "269"],
  [109, "Mt", "Meitnerium", "Мейтнерий", "transition", 9, 7, "278"],
  [110, "Ds", "Darmstadtium", "Дармштадтий", "transition", 10, 7, "281"],
  [111, "Rg", "Roentgenium", "Рентгений", "transition", 11, 7, "282"],
  [112, "Cn", "Copernicium", "Коперниций", "transition", 12, 7, "285"],
  [113, "Nh", "Nihonium", "Нихоний", "post", 13, 7, "286"],
  [114, "Fl", "Flerovium", "Флеровий", "post", 14, 7, "289"],
  [115, "Mc", "Moscovium", "Московий", "post", 15, 7, "290"],
  [116, "Lv", "Livermorium", "Ливерморий", "post", 16, 7, "293"],
  [117, "Ts", "Tennessine", "Теннессин", "halogen", 17, 7, "294"],
  [118, "Og", "Oganesson", "Оганесон", "noble", 18, 7, "294"],
  // Lanthanides (row 9)
  [57, "La", "Lanthanum", "Лантан", "lanthanide", 3, 9, "138.91"],
  [58, "Ce", "Cerium", "Церий", "lanthanide", 4, 9, "140.12"],
  [59, "Pr", "Praseodymium", "Празеодим", "lanthanide", 5, 9, "140.91"],
  [60, "Nd", "Neodymium", "Неодим", "lanthanide", 6, 9, "144.24"],
  [61, "Pm", "Promethium", "Прометий", "lanthanide", 7, 9, "145"],
  [62, "Sm", "Samarium", "Самарий", "lanthanide", 8, 9, "150.36"],
  [63, "Eu", "Europium", "Европий", "lanthanide", 9, 9, "151.96"],
  [64, "Gd", "Gadolinium", "Гадолиний", "lanthanide", 10, 9, "157.25"],
  [65, "Tb", "Terbium", "Тербий", "lanthanide", 11, 9, "158.93"],
  [66, "Dy", "Dysprosium", "Диспрозий", "lanthanide", 12, 9, "162.50"],
  [67, "Ho", "Holmium", "Гольмий", "lanthanide", 13, 9, "164.93"],
  [68, "Er", "Erbium", "Эрбий", "lanthanide", 14, 9, "167.26"],
  [69, "Tm", "Thulium", "Тулий", "lanthanide", 15, 9, "168.93"],
  [70, "Yb", "Ytterbium", "Иттербий", "lanthanide", 16, 9, "173.05"],
  [71, "Lu", "Lutetium", "Лютеций", "lanthanide", 17, 9, "174.97"],
  // Actinides (row 10)
  [89, "Ac", "Actinium", "Актиний", "actinide", 3, 10, "227"],
  [90, "Th", "Thorium", "Торий", "actinide", 4, 10, "232.04"],
  [91, "Pa", "Protactinium", "Протактиний", "actinide", 5, 10, "231.04"],
  [92, "U", "Uranium", "Уран", "actinide", 6, 10, "238.03"],
  [93, "Np", "Neptunium", "Нептуний", "actinide", 7, 10, "237"],
  [94, "Pu", "Plutonium", "Плутоний", "actinide", 8, 10, "244"],
  [95, "Am", "Americium", "Америций", "actinide", 9, 10, "243"],
  [96, "Cm", "Curium", "Кюрий", "actinide", 10, 10, "247"],
  [97, "Bk", "Berkelium", "Берклий", "actinide", 11, 10, "247"],
  [98, "Cf", "Californium", "Калифорний", "actinide", 12, 10, "251"],
  [99, "Es", "Einsteinium", "Эйнштейний", "actinide", 13, 10, "252"],
  [100, "Fm", "Fermium", "Фермий", "actinide", 14, 10, "257"],
  [101, "Md", "Mendelevium", "Менделевий", "actinide", 15, 10, "258"],
  [102, "No", "Nobelium", "Нобелий", "actinide", 16, 10, "259"],
  [103, "Lr", "Lawrencium", "Лоуренсий", "actinide", 17, 10, "266"],
]

export const ELEMENTS: Element[] = RAW.map(([n, sym, name, nameKz, cat, x, y, mass]) => ({
  n,
  sym,
  name,
  nameKz,
  cat,
  x,
  y,
  mass,
}))

export const CATEGORY_LABELS: Record<Category, string> = {
  alkali: "Сілтілік металдар",
  alkaline: "Сілтілік-жер металдар",
  transition: "Өтпелі металдар",
  post: "Постөтпелі металдар",
  metalloid: "Жартылай металдар",
  nonmetal: "Бейметалдар",
  halogen: "Галогендер",
  noble: "Инертті газдар",
  lanthanide: "Лантаноидтар",
  actinide: "Актиноидтар",
}

// Soft, mostly green-leaning palette so the table stays light and on-theme
export const CATEGORY_COLORS: Record<Category, { bg: string; fg: string; dot: string }> = {
  alkali: { bg: "#e9f7ef", fg: "#1c6b43", dot: "#2f9e63" },
  alkaline: { bg: "#eef7ea", fg: "#3d6b1c", dot: "#6aae34" },
  transition: { bg: "#eafaf4", fg: "#0f6b54", dot: "#16a37e" },
  post: { bg: "#f0f6ef", fg: "#4a6140", dot: "#7c9a6b" },
  metalloid: { bg: "#f4f6e9", fg: "#6b651c", dot: "#a89a2f" },
  nonmetal: { bg: "#e7f6f0", fg: "#15705a", dot: "#1fae87" },
  halogen: { bg: "#eaf4f7", fg: "#1c5a6b", dot: "#2f8fae" },
  noble: { bg: "#f1eff8", fg: "#4a3d7a", dot: "#7a6bb0" },
  lanthanide: { bg: "#f7f0ea", fg: "#7a5a3d", dot: "#b08a6b" },
  actinide: { bg: "#f7ece9", fg: "#7a423d", dot: "#b06b6b" },
}
