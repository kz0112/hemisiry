import type { MoleculeId } from "./molecules"

/*
 * ─────────────────────────────────────────────────────────────────────────
 *  SKETCHFAB 3D МОДЕЛЬДЕРІ
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Осы жерге әр молекуланың Sketchfab сілтемесін қоясың.
 *
 *  ҚАЛАЙ ТАБУ КЕРЕК:
 *   1. https://sketchfab.com сайтына кір.
 *   2. Қажет молекуланы тауып аш (мыс. "water molecule").
 *   3. Модель астындағы "Embed" батырмасын бас.
 *   4. Шыққан кодтан src="..." ішіндегі сілтемені көшір.
 *      Ол мынадай түрде болады:
 *        https://sketchfab.com/models/XXXXXXXXXXXX/embed
 *   5. Сол сілтемені төмендегі тиісті молекуланың жанына қой.
 *
 *  МАҢЫЗДЫ:
 *   • "" (бос) қалдырсаң — ол молекула бұрынғыдай ішкі 3D көрсеткішпен
 *     (ball-and-stick) көрсетіледі. Ешнәрсе сынбайды.
 *   • Сілтеме қойсаң — сол молекула Sketchfab моделімен ауысады.
 *   • Тек "/embed" аяқталатын сілтемені пайдалан (жай бет сілтемесі емес).
 *
 *  МЫСАЛ:
 *    water: "https://sketchfab.com/models/1234567890abcdef/embed",
 */

export const SKETCHFAB_MODELS: Record<MoleculeId, string> = {
  // Су молекуласы (H₂O)
  water: "https://sketchfab.com/models/8c9261e164a7493eb29f53cd06adf3b1/embed",
  // Метан (CH₄)
  methane: "",
  // Көмірқышқыл газы (CO₂)
  "carbon-dioxide": "",
  // Сутегі молекуласы (H₂)
  hydrogen: "",
  // Оттегі молекуласы (O₂)
  oxygen: "",
  // Азот молекуласы (N₂)
  nitrogen: "",
  // Аммиак (NH₃)
  ammonia: "",
  // Хлорсутек (HCl)
  "hydrogen-chloride": "",
  // Ас тұзы — кристалл торы (NaCl)
  "sodium-chloride": "",
  // Оттегі атомы (O)
  "oxygen-atom": "",
  // Су молекулалары — сұйық (H₂O)ₙ
  "water-cluster": "",
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
