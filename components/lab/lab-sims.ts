/*
 * ─────────────────────────────────────────────────────────────────────────
 *  ВИРТУАЛДЫ ЗЕРТХАНА СИМУЛЯЦИЯЛАРЫ
 *  Әр зертханалық жұмысқа интерактивті 3D тәжірибе конфигурациясы.
 *  Студент қадамдарды басып, шыны ыдыстағы өзгерістерді бақылайды.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type SimEffect = {
  color?: string
  /** толтыру деңгейін тікелей орнату (0..1) */
  level?: number
  /** деңгейге қосу */
  add?: number
  bubbling?: number
  precipitate?: number
  heating?: boolean
  temp?: number
  smoke?: number
  glow?: boolean
  litBulb?: boolean
}

export type SimStep = {
  label: string
  observation: string
  /** батырма/тамшы түсі */
  color?: string
  effect: SimEffect
}

export type LabSim = {
  id: string
  startColor?: string
  startLevel?: number
  /** спиртшам/жанарғы көрсету */
  burner?: boolean
  /** ток өткізгіштік шамы */
  bulb?: boolean
  /** illustration photo */
  image?: string
  steps: SimStep[]
  conclusion: string
}

export const LAB_SIMS: Record<string, LabSim> = {
  filtration: {
    id: "filtration",
    image: "/labs/lab-filtration.png",
    startColor: "#a8a29e",
    startLevel: 0.5,
    burner: true,
    steps: [
      { label: "Лас тұзды суда ерітіңіз", color: "#a8a29e", observation: "Су лайланды — құм мен тұз араласты.", effect: { color: "#a8a29e", level: 0.55 } },
      { label: "Қоспаны сүзгіден өткізіңіз", color: "#cbd5e1", observation: "Құм сүзгіде қалды, ерітінді мөлдірленді.", effect: { color: "#e0f2fe", precipitate: 0 } },
      { label: "Спиртшаммен буландырыңыз", color: "#f97316", observation: "Су буланып, температура көтерілді.", effect: { heating: true, temp: 95, smoke: 0.8, level: 0.2 } },
      { label: "Нәтижені бақылаңыз", color: "#f8fafc", observation: "Таза тұз кристалдары қалды!", effect: { heating: false, temp: 40, smoke: 0, precipitate: 0.9, color: "#f1f5f9", level: 0.12 } },
    ],
    conclusion: "Қоспаны еріту → сүзу → буландыру арқылы физикалық тәсілмен бөлдік. Таза ас тұзы алынды.",
  },

  "reaction-signs": {
    id: "reaction-signs",
    image: "/labs/lab-reaction.png",
    startColor: "#bae6fd",
    startLevel: 0.4,
    steps: [
      { label: "Түссіз ерітінділерді құйыңыз", color: "#e0f2fe", observation: "Бастапқы ерітінді мөлдір көк түсті.", effect: { color: "#bae6fd" } },
      { label: "Екінші реагентті қосыңыз", color: "#f59e0b", observation: "Түс өзгерді — химиялық реакция белгісі!", effect: { color: "#f59e0b", add: 0.15 } },
      { label: "Тұнба түзілуін бақылаңыз", color: "#facc15", observation: "Түбіне тұнба шөкті — жаңа зат түзілді.", effect: { precipitate: 0.8 } },
      { label: "Газ бөлінуін тексеріңіз", color: "#22c55e", observation: "Көпіршіктер пайда болды — газ бөлінді.", effect: { bubbling: 0.8 } },
    ],
    conclusion: "Түс өзгеруі, тұнба түзілуі және газ бөлінуі — химиялық реакцияның негізгі белгілері.",
  },

  dissolve: {
    id: "dissolve",
    image: "/labs/lab-heat.png",
    startColor: "#dbeafe",
    startLevel: 0.5,
    steps: [
      { label: "Суға кристалл салыңыз", color: "#e2e8f0", observation: "Кристалдар суда ери бастады.", effect: { color: "#eff6ff" } },
      { label: "Шыны таяқшамен араластырыңыз", color: "#bfdbfe", observation: "Кристалдар толық еріді, ерітінді біртекті.", effect: { color: "#dbeafe", bubbling: 0.2 } },
      { label: "Температураны өлшеңіз", color: "#3b82f6", observation: "Ерітінді суыды — еру жылу сіңіреді (эндотермиялық).", effect: { temp: 12, bubbling: 0 } },
    ],
    conclusion: "Кейбір заттар еріген кезде жылу сіңіреді, сондықтан ерітінді салқындайды.",
  },

  boiling: {
    id: "boiling",
    image: "/labs/lab-heat.png",
    startColor: "#dbeafe",
    startLevel: 0.55,
    burner: true,
    steps: [
      { label: "Спиртшамды жағыңыз", color: "#f97316", observation: "Су қыза бастады, температура артып келеді.", effect: { heating: true, temp: 55 } },
      { label: "Қыздыруды жалғастырыңыз", color: "#fb923c", observation: "Түбінде ұсақ көпіршіктер пайда болды.", effect: { temp: 85, bubbling: 0.4 } },
      { label: "Қайнауды бақылаңыз", color: "#ef4444", observation: "Су 100°C-та қайнады, бу қарқынды бөлінді.", effect: { temp: 100, bubbling: 1, smoke: 1 } },
    ],
    conclusion: "Су 100°C температурада қайнайды. Қайнау кезінде температура тұрақты болады.",
  },

  combustion: {
    id: "combustion",
    image: "/labs/lab-flame.png",
    startColor: "#fde68a",
    startLevel: 0.15,
    burner: true,
    steps: [
      { label: "Балауыз шамды жағыңыз", color: "#f97316", observation: "Жалын пайда болды, балауыз балқи бастады.", effect: { heating: true, temp: 60, smoke: 0.3 } },
      { label: "Шыны ыдыспен жабыңыз", color: "#94a3b8", observation: "Ыдыс ішкі қабырғасында су тамшылары пайда болды.", effect: { smoke: 0.6, temp: 70 } },
      { label: "Жалынды бақылаңыз", color: "#64748b", observation: "Оттегі азайып, жалын сөнді — жануға O₂ қажет.", effect: { heating: false, temp: 45, smoke: 0.1 } },
    ],
    conclusion: "Жану — оттегімен жүретін реакция. Көмірқышқыл газы мен су буы түзіледі.",
  },

  indicator: {
    id: "indicator",
    image: "/labs/lab-acidbase.png",
    startColor: "#e0f2fe",
    startLevel: 0.45,
    steps: [
      { label: "Лакмус индикаторын қосыңыз", color: "#a78bfa", observation: "Индикатор бейтарап ортада күлгін-көк түсті.", effect: { color: "#c7d2fe" } },
      { label: "Қышқыл тамызыңыз (HCl)", color: "#ef4444", observation: "Индикатор қызарды — орта қышқыл.", effect: { color: "#f87171", add: 0.1 } },
      { label: "Сілті тамызыңыз (NaOH)", color: "#3b82f6", observation: "Индикатор көк түске айналды — орта сілтілі.", effect: { color: "#60a5fa", add: 0.1 } },
    ],
    conclusion: "Индикаторлар орта түрін көрсетеді: қышқылда қызыл, сілтіде көк, бейтарапта аралық түс.",
  },

  neutralize: {
    id: "neutralize",
    image: "/labs/lab-acidbase.png",
    startColor: "#f87171",
    startLevel: 0.4,
    steps: [
      { label: "Қышқыл + индикатор", color: "#ef4444", observation: "Орта қышқыл — ерітінді қызыл (pH ≈ 2).", effect: { color: "#f87171" } },
      { label: "Сілтіні аз-аздан құйыңыз", color: "#fbbf24", observation: "pH өсіп келеді, түс сарғайды (pH ≈ 5).", effect: { color: "#fbbf24", add: 0.15 } },
      { label: "Дәл нейтралдаңыз", color: "#22c55e", observation: "pH = 7! Тұз бен су түзілді.", effect: { color: "#22c55e", glow: true } },
      { label: "Артық сілті құйсаңыз", color: "#3b82f6", observation: "Орта сілтіленді (pH > 7) — асырып жібердік.", effect: { color: "#60a5fa", add: 0.1, glow: false } },
    ],
    conclusion: "HCl + NaOH → NaCl + H₂O. Нейтралдау — қышқыл мен негіздің әрекеттесуі, pH 7-ге жетеді.",
  },

  "metal-acid": {
    id: "metal-acid",
    image: "/labs/lab-acidbase.png",
    startColor: "#f87171",
    startLevel: 0.4,
    steps: [
      { label: "Тұз қышқылын құйыңыз", color: "#ef4444", observation: "Ыдыста түссіз қышқыл (HCl).", effect: { color: "#fca5a5" } },
      { label: "Мырыш түйіршіктерін салыңыз", color: "#94a3b8", observation: "Көпіршіктер басталды — сутегі (H₂) бөлінуде!", effect: { bubbling: 0.9, temp: 38 } },
      { label: "Реакцияны бақылаңыз", color: "#fb923c", observation: "Ыдыс жылынды — реакция экзотермиялық.", effect: { temp: 55, bubbling: 1, color: "#fed7aa" } },
    ],
    conclusion: "Zn + 2HCl → ZnCl₂ + H₂↑. Белсенді металл қышқылмен әрекеттесіп, сутегі газын бөледі.",
  },

  "gas-test": {
    id: "gas-test",
    image: "/labs/lab-acidbase.png",
    startColor: "#e0f2fe",
    startLevel: 0.4,
    steps: [
      { label: "Әк суын дайындаңыз", color: "#f8fafc", observation: "Әк суы (Ca(OH)₂) — мөлдір түссіз ерітінді.", effect: { color: "#f1f5f9" } },
      { label: "Көмірқышқыл газын жіберіңіз", color: "#cbd5e1", observation: "Газ көпіршіктеп өтуде…", effect: { bubbling: 0.7 } },
      { label: "Нәтижені бақылаңыз", color: "#e2e8f0", observation: "Әк суы лайланды — CO₂ дәлелденді!", effect: { precipitate: 0.85, bubbling: 0.2, color: "#e2e8f0" } },
    ],
    conclusion: "CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O. Лайлану — көмірқышқыл газына сапалық реакция.",
  },

  conductivity: {
    id: "conductivity",
    image: "/labs/lab-electro.png",
    startColor: "#dbeafe",
    startLevel: 0.5,
    bulb: true,
    steps: [
      { label: "Таза суға электрод батырыңыз", color: "#e0f2fe", observation: "Шам жанбады — таза су ток өткізбейді.", effect: { litBulb: false } },
      { label: "Ас тұзын ерітіңіз (NaCl)", color: "#f8fafc", observation: "Тұз иондарға ыдырады (Na⁺, Cl⁻).", effect: { color: "#cffafe" } },
      { label: "Қайтадан тексеріңіз", color: "#fbbf24", observation: "Шам жанды — ерітінді ток өткізеді!", effect: { litBulb: true, glow: true } },
    ],
    conclusion: "Электролиттер суда иондарға ыдырап, электр тогын өткізеді. Таза су — нашар өткізгіш.",
  },

  "ion-exchange": {
    id: "ion-exchange",
    image: "/labs/lab-reaction.png",
    startColor: "#bfdbfe",
    startLevel: 0.4,
    steps: [
      { label: "Тұз ерітіндісін құйыңыз", color: "#93c5fd", observation: "Мөлдір көк ерітінді (мыс. BaCl₂).", effect: { color: "#bfdbfe" } },
      { label: "Екінші тұзды қосыңыз", color: "#e2e8f0", observation: "Ерітінділер араласты.", effect: { color: "#dbeafe", add: 0.15 } },
      { label: "Тұнба түзілуін бақылаңыз", color: "#f8fafc", observation: "Ақ тұнба шөкті — алмасу реакциясы өтті!", effect: { precipitate: 0.9, color: "#eff6ff" } },
    ],
    conclusion: "Иондық алмасу реакциясы тұнба, газ немесе су түзілгенде аяғына дейін жүреді.",
  },

  oxide: {
    id: "oxide",
    image: "/labs/lab-reaction.png",
    startColor: "#dbeafe",
    startLevel: 0.45,
    steps: [
      { label: "Оксидті суға салыңыз", color: "#e2e8f0", observation: "Оксид суда ери бастады.", effect: { color: "#eff6ff", temp: 30 } },
      { label: "Индикатор қосыңыз", color: "#a78bfa", observation: "Индикатор қосылды.", effect: { color: "#c7d2fe" } },
      { label: "Ортаны анықтаңыз", color: "#3b82f6", observation: "Көк түс — негіздік оксид сілтілі орта берді.", effect: { color: "#60a5fa" } },
    ],
    conclusion: "Металл оксидтері сумен әрекеттесіп негіз (сілті) түзеді; бейметалл оксидтері қышқыл береді.",
  },

  observe: {
    id: "observe",
    image: "/labs/lab-electro.png",
    startColor: "#dbeafe",
    startLevel: 0.4,
    steps: [
      { label: "Үлгіні ыдысқа салыңыз", color: "#cbd5e1", observation: "Заттың түсі мен агрегаттық күйін жазыңыз.", effect: { color: "#e2e8f0" } },
      { label: "Суда еруін тексеріңіз", color: "#bfdbfe", observation: "Зат суда ерігенін/ерімегенін бақылаңыз.", effect: { color: "#dbeafe", bubbling: 0.2 } },
      { label: "Қасиеттерін салыстырыңыз", color: "#22c55e", observation: "Қасиеттер бойынша заттарды ажыраттыңыз.", effect: { bubbling: 0, glow: true } },
    ],
    conclusion: "Әр заттың өзіне тән физикалық қасиеттері (түс, иіс, еру, күй) болады.",
  },
}

/** Зертханалық жұмыс id → симуляция id */
export const SIM_BY_LAB: Record<string, string> = {
  // 7-сынып
  "l7-p1": "observe",
  "l7-1": "observe",
  "l7-2": "filtration",
  "l7-3": "reaction-signs",
  "l7-4": "dissolve",
  "l7-5": "boiling",
  "l7-6": "combustion",
  "l7-p2": "combustion",
  "l7-7": "indicator",
  "l7-8": "neutralize",
  "l7-9": "metal-acid",
  "l7-10": "gas-test",
  "l7-p3": "gas-test",
  "l7-p4": "observe",
  "l7-11": "gas-test",
  // 8-сынып
  "l8-p1": "filtration",
  "l8-1": "reaction-signs",
  "l8-2": "oxide",
  "l8-3": "metal-acid",
  "l8-4": "neutralize",
  "l8-5": "ion-exchange",
  "l8-6": "conductivity",
  "l8-7": "ion-exchange",
  "l8-p2": "observe",
}

export function getSimForLab(labId: string): LabSim | null {
  const simId = SIM_BY_LAB[labId]
  return simId ? LAB_SIMS[simId] : null
}
