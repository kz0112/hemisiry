import type { MoleculeId } from "./molecules"

/*
 * ─────────────────────────────────────────────────────────────────────────
 *  SKETCHFAB 3D МОДЕЛЬДЕРІ — ӘР САБАҚ ҮШІН
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Әр сабақтың жоғарғы жағындағы 3D модельді Sketchfab моделімен ауыстырасың.
 *  Төмендегі тізімде ӘРБІР САБАҚТЫҢ өз жолы бар — сол жолға сілтемені қоясың.
 *
 *  ҚАЛАЙ ТАБУ КЕРЕК:
 *   1. https://sketchfab.com сайтына кір.
 *   2. Қажет модельді тауып аш (мыс. "water molecule", "atom").
 *   3. Модель астындағы "Embed" батырмасын бас.
 *   4. Шыққан кодтан src="..." ішіндегі сілтемені көшір.
 *      Ол мынадай түрде болады:
 *        https://sketchfab.com/models/XXXXXXXXXXXX/embed
 *   5. Сол сілтемені төмендегі тиісті САБАҚТЫҢ жанындағы "" ішіне қой.
 *
 *  МАҢЫЗДЫ:
 *   • "" (бос) қалдырсаң — ол сабақ бұрынғыдай ішкі 3D көрсеткішпен
 *     (ball-and-stick) көрсетіледі. Ешнәрсе сынбайды.
 *   • Сілтеме қойсаң — сол сабақтың моделі Sketchfab моделімен ауысады.
 *   • Жай бет сілтемесін де қоюға болады — код оны өзі "/embed" түріне келтіреді.
 *
 *  МЫСАЛ:
 *    intro7: "https://sketchfab.com/models/1234567890abcdef/embed",
 */

/** Әр сабақтың id-іне сәйкес Sketchfab сілтемесі. Бос болса — ішкі 3D көрсеткіш. */
export const LESSON_SKETCHFAB: Record<string, string> = {
  /* ======================= 7-СЫНЫП ======================= */
  // Химия пәніне кіріспе
  intro7: "",
  // Атом құрылысы
  atom: "",
  // Химиялық элементтер
  elements7: "",
  // Заттың агрегаттық күйлері
  states: "",
  // Физикалық және химиялық құбылыстар
  phenomena7: "",
  // Ауа. Оттегі. Жану
  "air-oxygen7": "",
  // Су. Ерітінділер
  water7: "",
  // Қышқылдар мен негіздер
  acid: "",
  // pH шкаласы
  ph: "",

  /* ======================= 8-СЫНЫП ======================= */
  // Атом құрылысы. Изотоптар
  atom8: "",
  // Периодтық заң
  periodic8: "",
  // Химиялық байланыс
  bond: "",
  // Зат мөлшері. Моль
  mole8: "",
  // Химиялық реакция түрлері
  reactions: "",
  // Бейорганикалық қосылыстар
  classes8: "",
  // Электролиттік диссоциация
  dissociation8: "",
  // Тотығу-тотықсыздану
  redox: "",
}

/*
 * (Қосымша) Молекула бойынша ортақ сілтеме. Сабақтың өз сілтемесі бос болса,
 * код осы жерден молекулаға сәйкес сілтемені іздейді. Қаласаң ғана толтыр —
 * әдетте жоғарыдағы сабақ бойынша тізімді пайдалану жеткілікті.
 */
export const SKETCHFAB_MODELS: Record<MoleculeId, string> = {
  water: "",
  methane: "",
  "carbon-dioxide": "",
  hydrogen: "",
  oxygen: "",
  nitrogen: "",
  ammonia: "",
  "hydrogen-chloride": "",
  "sodium-chloride": "",
  "oxygen-atom": "",
  "water-cluster": "",
}

/**
 * Сабақ пен молекула бойынша Sketchfab сілтемесін табады.
 * Алдымен сабақтың өз сілтемесін, болмаса молекула сілтемесін қайтарады.
 */
export function resolveSketchfabUrl(lessonId: string | undefined, moleculeId: MoleculeId): string {
  const byLesson = lessonId ? (LESSON_SKETCHFAB[lessonId] ?? "") : ""
  if (byLesson.trim()) return normalizeSketchfabUrl(byLesson)
  const byMolecule = SKETCHFAB_MODELS[moleculeId] ?? ""
  if (byMolecule.trim()) return normalizeSketchfabUrl(byMolecule)
  return ""
}

/** Sketchfab сілтемесін біркелкі embed түріне келтіреді (артық параметрлерсіз). */
export function normalizeSketchfabUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  // егер "/embed" жоқ болса — қосып береміз
  const base = trimmed.split("?")[0].replace(/\/$/, "")
  const withEmbed = base.endsWith("/embed") ? base : `${base}/embed`
  // автостарт + UI жеңілдету параметрлері
  return `${withEmbed}?autospin=0.2&autostart=1&preload=1&ui_theme=dark`
}
