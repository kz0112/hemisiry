"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Trophy,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Clock,
  HelpCircle,
  Sparkles,
  FlaskConical,
  Beaker,
  ListChecks,
  Target,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LESSONS, LAB_WORKS, type Lesson, type LabWork, type Grade, type LabKind } from "./course-data"
import { Diagram } from "./course-illustrations"
import { MoleculeViewer } from "./molecule-viewer"
import { VirtualLab } from "../lab/virtual-lab"
import { getSimForLab } from "../lab/lab-sims"

type Stage = "list" | "intro" | "quiz" | "result" | "lab"
type Tab = "lessons" | "labs"

const KIND_LABEL: Record<LabKind, string> = {
  lab: "Зертханалық",
  practical: "Практикалық",
  demo: "Көрсетілім",
}

export function CourseView() {
  const [stage, setStage] = useState<Stage>("list")
  const [grade, setGrade] = useState<Grade>(7)
  const [tab, setTab] = useState<Tab>("lessons")
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lab, setLab] = useState<LabWork | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState<Record<string, number>>({})

  const gradeLessons = useMemo(() => LESSONS.filter((l) => l.grade === grade), [grade])
  const gradeLabs = useMemo(() => LAB_WORKS.filter((l) => l.grade === grade), [grade])

  const openLesson = (l: Lesson) => {
    setLesson(l)
    setQIndex(0)
    setSelected(null)
    setLocked(false)
    setScore(0)
    setStage("intro")
  }

  const openLab = (l: LabWork) => {
    setLab(l)
    setStage("lab")
  }

  const openLabById = (id: string) => {
    const found = LAB_WORKS.find((l) => l.id === id)
    if (found) openLab(found)
  }

  const choose = (i: number) => {
    if (locked) return
    setSelected(i)
    setLocked(true)
    if (lesson && i === lesson.questions[qIndex].answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (!lesson) return
    if (qIndex + 1 < lesson.questions.length) {
      setQIndex((q) => q + 1)
      setSelected(null)
      setLocked(false)
    } else {
      setCompleted((c) => ({ ...c, [lesson.id]: Math.max(c[lesson.id] ?? 0, score) }))
      setStage("result")
    }
  }

  /* ---------------------------- lesson / lab list ---------------------------- */
  if (stage === "list") {
    const doneInGrade = gradeLessons.filter((l) => completed[l.id] !== undefined).length
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <BookOpen className="size-3.5 text-primary" />
              Интерактивті химия курсы
            </span>
            <h1 className="text-balance text-3xl font-semibold text-foreground">Сыныпты таңдап, білімінді тексер</h1>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
              Сыныбыңды таңда, сабақтар мен зертханалық жұмыстарды аш. Әр сабақта суретті түсініктемелер, өмірден
              алынған мысалдар мен сұрақтар бар. Барлығы тегін, тіркеусіз.
            </p>
          </div>

          {/* grade selector */}
          <div className="mt-6 flex gap-3">
            {([7, 8] as Grade[]).map((g) => {
              const isActive = grade === g
              const count = LESSONS.filter((l) => l.grade === g).length
              return (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                      isActive ? "bg-primary-foreground/15" : "bg-secondary text-primary",
                    )}
                  >
                    {g}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold">{g}-сынып</span>
                    <span
                      className={cn(
                        "block text-xs",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {count} сабақ
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* lessons / labs tabs */}
          <div className="mt-5 inline-flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setTab("lessons")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === "lessons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <GraduationLike />
              Сабақтар
            </button>
            <button
              onClick={() => setTab("labs")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === "labs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Beaker className="size-4" />
              Зертханалық жұмыстар
            </button>
          </div>

          {tab === "lessons" ? (
            <>
              {/* progress */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Trophy className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {grade}-сынып: аяқталған сабақтар: {doneInGrade} / {gradeLessons.length}
                  </p>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${gradeLessons.length ? (doneInGrade / gradeLessons.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gradeLessons.map((l) => {
                  const best = completed[l.id]
                  return (
                    <button
                      key={l.id}
                      onClick={() => openLesson(l)}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                    >
                      {l.image && (
                        <div className="relative h-36 w-full overflow-hidden bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={l.image || "/placeholder.svg"}
                            alt={l.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-xl bg-card/85 text-xl backdrop-blur">
                            {l.emoji}
                          </span>
                          {best !== undefined && (
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                              <CheckCircle2 className="size-3.5" />
                              {best}/{l.questions.length}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">{l.title}</h2>
                        <p className="text-xs text-muted-foreground">{l.summary}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {l.minutes} мин
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HelpCircle className="size-3.5" />
                          {l.questions.length} сұрақ
                        </span>
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Оқуды бастау
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {gradeLabs.map((l) => {
                const sim = getSimForLab(l.id)
                const cover = l.image ?? sim?.image
                return (
                <button
                  key={l.id}
                  onClick={() => openLab(l)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  {cover && (
                    <div className="relative h-32 w-full overflow-hidden bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover || "/placeholder.svg"}
                        alt={l.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-card/85 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground backdrop-blur">
                        {KIND_LABEL[l.kind]}
                      </span>
                      {sim && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                          <Beaker className="size-3.5" />
                          3D зертхана
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="text-xs font-semibold text-primary">{l.no}</p>
                    <h2 className="text-pretty text-base font-semibold text-foreground">{l.title}</h2>
                    <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{l.goal}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Толық нұсқаулық
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  </div>
                </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ------------------------------- lab detail ------------------------------- */
  if (stage === "lab" && lab) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => setStage("list")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Тізімге оралу
          </button>

          <div className="mt-5 flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Beaker className="size-7" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary">{lab.no}</span>
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  {KIND_LABEL[lab.kind]}
                </span>
                <span className="text-xs text-muted-foreground">{lab.grade}-сынып</span>
              </div>
              <h1 className="mt-1 text-balance text-2xl font-semibold text-foreground">{lab.title}</h1>
            </div>
          </div>

          {(() => {
            const sim = getSimForLab(lab.id)
            const cover = lab.image ?? sim?.image
            return (
              <>
                {cover && (
                  <figure className="mt-5 overflow-hidden rounded-2xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover || "/placeholder.svg"} alt={lab.title} className="h-52 w-full object-cover" />
                  </figure>
                )}
                {sim && (
                  <div className="mt-5">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Beaker className="size-4 text-primary" />
                      Виртуалды зертхана — өзің тәжірибе жаса
                    </p>
                    <VirtualLab sim={sim} />
                  </div>
                )}
              </>
            )
          })()}

          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Target className="size-4" />
                Мақсаты
              </p>
              <p className="text-pretty text-sm leading-relaxed text-foreground/80">{lab.goal}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ClipboardList className="size-4 text-primary" />
                Құрал-жабдықтар
              </p>
              <div className="flex flex-wrap gap-2">
                {lab.materials.map((m, i) => (
                  <span key={i} className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ListChecks className="size-4 text-primary" />
                Орындау реті
              </p>
              <ol className="flex flex-col gap-2.5">
                {lab.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-pretty text-sm leading-relaxed text-foreground/80">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-pretty text-sm leading-relaxed text-secondary-foreground">
                <span className="font-semibold">Күтілетін нәтиже: </span>
                {lab.result}
              </p>
            </div>
          </div>

          <button
            onClick={() => setStage("list")}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Дайын
            <Check className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!lesson) return null

  /* ------------------------------- intro / reading ------------------------------- */
  if (stage === "intro") {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => setStage("list")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Сабақтарға оралу
          </button>

          {/* lesson header */}
          <div className="mt-5 flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl">
              {lesson.emoji}
            </span>
            <div>
              <h1 className="text-balance text-2xl font-semibold text-foreground">{lesson.title}</h1>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">{lesson.intro}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {lesson.minutes} мин оқу
                </span>
                <span className="inline-flex items-center gap-1">
                  <HelpCircle className="size-3.5" />
                  {lesson.questions.length} сұрақ
                </span>
              </div>
            </div>
          </div>

          {/* hero image */}
          {lesson.image && (
            <figure className="mt-5 overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lesson.image || "/placeholder.svg"} alt={lesson.title} className="h-56 w-full object-cover" />
            </figure>
          )}

          {/* 3D molecule for the lesson */}
          {lesson.molecule && (
            <div className="mt-4">
              <MoleculeViewer id={lesson.molecule} />
            </div>
          )}

          {/* related interactive virtual lab */}
          {lesson.lab &&
            (() => {
              const relLab = LAB_WORKS.find((l) => l.id === lesson.lab)
              const relSim = lesson.lab ? getSimForLab(lesson.lab) : null
              if (!relLab || !relSim) return null
              return (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <Beaker className="size-4" />
                      Осы тақырыпқа виртуалды зертхана
                    </p>
                    <button
                      onClick={() => openLabById(relLab.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-card px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      Толық нұсқаулық
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-pretty text-xs leading-relaxed text-foreground/70">
                    {relLab.no} · {relLab.title}. Қадамдарды басып, шыны ыдыстағы өзгерістерді өзің бақыла.
                  </p>
                  <div className="mt-3">
                    <VirtualLab sim={relSim} />
                  </div>
                </div>
              )
            })()}

          {/* reading sections */}
          <article className="mt-6 flex flex-col gap-5">
            {lesson.sections.map((s, i) => {
              if (s.type === "text") {
                return (
                  <div key={i}>
                    {s.heading && <h2 className="mb-1.5 text-lg font-semibold text-foreground">{s.heading}</h2>}
                    <p className="text-pretty text-sm leading-relaxed text-foreground/80">{s.body}</p>
                  </div>
                )
              }
              if (s.type === "diagram") {
                return <Diagram key={i} kind={s.kind} caption={s.caption} />
              }
              if (s.type === "example") {
                return (
                  <div key={i} className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <FlaskConical className="size-4" />
                      {s.title}
                    </p>
                    <p className="text-pretty text-sm leading-relaxed text-foreground/80">{s.body}</p>
                  </div>
                )
              }
              // fact
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-pretty text-sm leading-relaxed text-secondary-foreground">
                    <span className="font-semibold">Қызық дерек: </span>
                    {s.body}
                  </p>
                </div>
              )
            })}
          </article>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
            <Lightbulb className="size-4 shrink-0 text-primary" />
            Оқып болдың ба? Енді {lesson.questions.length} сұрақпен біліміңді тексер!
          </div>

          <button
            onClick={() => setStage("quiz")}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Сұрақтарды бастау
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------- result ------------------------------ */
  if (stage === "result") {
    const total = lesson.questions.length
    const pct = Math.round((score / total) * 100)
    const great = pct >= 67
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div
            className={cn(
              "mx-auto flex size-20 items-center justify-center rounded-full",
              great ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
            )}
          >
            <Trophy className="size-9" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {great ? "Жарайсың!" : "Жақсы талпыныс!"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lesson.title} бойынша нәтижең
          </p>
          <p className="mt-4 text-4xl font-bold text-primary tabular-nums">
            {score} / {total}
          </p>
          <p className="text-sm text-muted-foreground">Дұрыс жауап ({pct}%)</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => openLesson(lesson)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" />
              Қайталау
            </button>
            <button
              onClick={() => setStage("list")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              Басқа сабақ
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------- quiz ------------------------------- */
  const question = lesson.questions[qIndex]
  const isCorrect = selected === question.answer
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
      <div className="mx-auto max-w-2xl">
        {/* progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{lesson.title}</span>
          <span className="text-muted-foreground">
            Сұрақ {qIndex + 1} / {lesson.questions.length}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((qIndex + (locked ? 1 : 0)) / lesson.questions.length) * 100}%` }}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-balance text-lg font-semibold text-foreground">{question.q}</h2>

          <div className="mt-5 flex flex-col gap-3">
            {question.options.map((opt, i) => {
              const isAnswer = i === question.answer
              const isPicked = i === selected
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={locked}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                    !locked && "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                    locked && isAnswer && "border-primary bg-primary/10 text-foreground",
                    locked && isPicked && !isAnswer && "border-destructive bg-destructive/10 text-foreground",
                    locked && !isAnswer && !isPicked && "border-border opacity-60",
                  )}
                >
                  {opt}
                  {locked && isAnswer && <Check className="size-5 shrink-0 text-primary" />}
                  {locked && isPicked && !isAnswer && <X className="size-5 shrink-0 text-destructive" />}
                </button>
              )
            })}
          </div>

          {locked && (
            <div
              className={cn(
                "mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2",
                isCorrect
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-border bg-secondary text-foreground",
              )}
            >
              <p className="mb-1 font-semibold">
                {isCorrect ? "Дұрыс!" : "Қате — есте сақта:"}
              </p>
              {question.explain}
            </div>
          )}

          {locked && (
            <button
              onClick={next}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {qIndex + 1 < lesson.questions.length ? "Келесі сұрақ" : "Нәтижені көру"}
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* small inline icon to avoid extra import name clash */
function GraduationLike() {
  return <BookOpen className="size-4" />
}
