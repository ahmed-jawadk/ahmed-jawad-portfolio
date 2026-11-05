<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { formatMonth, fullName, profile } from '@/data/profile'
import { useTheme } from '@/composables/useTheme'
import { hasFinePointer, prefersReducedMotion } from '@/composables/useReducedMotion'

/**
 * Auto-types a short intro when scrolled into view, then hands the prompt
 * to the visitor. Clicking, typing or tapping a chip skips the intro.
 * Monospace is used here and nowhere else on the site.
 */
const emit = defineEmits<{ openProject: [slug: string] }>()

type Kind = 'input' | 'out' | 'dim' | 'accent' | 'error'
interface Line {
  id: number
  kind: Kind
  text: string
}

const USER = 'ahmed@baghdad'
const INTRO = ['whoami', 'cat skills.txt', 'ls projects/', 'git log --oneline']
const CHIPS = ['help', 'about', 'projects', 'skills', 'log', 'contact', 'theme', 'clear']

const { set: setTheme, theme } = useTheme()

const root = ref<HTMLElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const lines = ref<Line[]>([])
const typed = ref('')
const phase = ref<'idle' | 'typing' | 'interactive'>('idle')
const value = ref('')

let nextId = 0
let skipping = false
let introPromise: Promise<void> | null = null
const history: string[] = []
let historyIndex = -1
const timers = new Set<number>()

// ---------- output helpers ----------
function print(text: string | string[], kind: Kind = 'out') {
  for (const t of Array.isArray(text) ? text : [text]) lines.value.push({ id: nextId++, kind, text: t })
  scrollToBottom()
}

function scrollToBottom() {
  void nextTick(() => {
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function wait(ms: number) {
  if (skipping) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      resolve()
    }, ms)
    timers.add(id)
  })
}

function shortHash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

const baghdadTime = () =>
  new Date().toLocaleString('en-GB', {
    timeZone: profile.location.timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

// ---------- commands ----------
interface Command {
  desc: string
  alias?: string
  hidden?: boolean
  run: (args: string[]) => void
}

const commands: Record<string, Command> = {
  help: {
    desc: 'list commands',
    run: () => {
      print('available commands', 'accent')
      for (const [name, cmd] of Object.entries(commands)) {
        if (cmd.hidden) continue
        print(`  ${name.padEnd(12)}${cmd.desc}${cmd.alias ? `  (${cmd.alias})` : ''}`)
      }
    },
  },
  whoami: {
    desc: 'short version',
    run: () => {
      print(`${fullName.toLowerCase()} — ${profile.role.toLowerCase()} @ ${profile.company.toLowerCase()}`)
      print(`${profile.location.city.toLowerCase()}, ${profile.location.country.toLowerCase()} · vue 3 / typescript / tailwind`, 'dim')
    },
  },
  about: {
    desc: 'long version',
    run: () => print([profile.headline, '', profile.summary]),
  },
  skills: {
    desc: 'what I work with',
    alias: 'cat skills.txt',
    run: () => {
      const groups = new Map<string, string[]>()
      for (const s of profile.skills) groups.set(s.group, [...(groups.get(s.group) ?? []), s.name])
      for (const [group, names] of groups) print(`${group.toLowerCase().padEnd(12)}${names.join(' · ')}`)
      print(`${'speaks'.padEnd(12)}${profile.spokenLanguages.map((l) => `${l.name} (${l.level})`).join(' · ')}`)
    },
  },
  projects: {
    desc: 'things I’ve shipped',
    alias: 'ls projects/',
    run: () => {
      profile.projects.forEach((p, i) => {
        print(`${String(i + 1).padStart(2, '0')}  ${`${p.slug}/`.padEnd(14)}${p.kind.padEnd(24)}${p.year}`)
      })
      print("type 'open <name>' for details, e.g. open enjaz-erp", 'dim')
    },
  },
  open: {
    desc: 'open a project',
    alias: 'open enjaz-erp',
    run: (args) => {
      const slug = (args[0] ?? '').replace(/\/$/, '')
      const project = profile.projects.find((p) => p.slug === slug)
      if (!project) {
        print(`open: no such project: ${slug || '(none)'}`, 'error')
        print(`try: ${profile.projects.map((p) => p.slug).join(', ')}`, 'dim')
        return
      }
      print(`opening ${project.title}…`, 'dim')
      emit('openProject', project.slug)
    },
  },
  experience: {
    desc: 'where I’ve worked and studied',
    run: () => {
      for (const e of profile.experience) {
        const range = e.start === e.end ? formatMonth(e.start) : `${formatMonth(e.start)} — ${e.end ? formatMonth(e.end) : 'now'}`
        print(`${range.padEnd(22)}${e.role} · ${e.org}`)
      }
    },
  },
  log: {
    desc: 'career as a commit log',
    alias: 'git log --oneline',
    run: () => {
      const messages: Record<string, string> = {
        Freelance: 'feat',
        'Full-time': 'feat',
        'Part-time': 'feat',
        Education: 'chore',
        Award: 'perf',
      }
      profile.experience.forEach((e, i) => {
        const head = i === 0 ? ' (HEAD -> main)' : ''
        const what = e.type === 'Education' ? `graduate — ${e.role}, ${e.org}` : `${e.project ?? e.org} — ${e.role}`
        print(`${shortHash(e.id)}${head} ${messages[e.type] ?? 'feat'}: ${what.toLowerCase()} · ${formatMonth(e.end && e.type === 'Education' ? e.end : e.start)}`)
      })
      print(`${shortHash('init')} init: hello, world · ${formatMonth(profile.education.start)}`)
    },
  },
  contact: {
    desc: 'how to reach me',
    run: () => {
      print(`email     ${profile.email}`)
      print(`github    ${profile.links.github.replace('https://', '')}`)
      if (profile.links.linkedin) print(`linkedin  ${profile.links.linkedin.replace('https://', '')}`)
      print(`company   ${profile.links.companyLinkedin.replace('https://', '')}`)
      print("type 'copy' to copy the email address", 'dim')
    },
  },
  copy: {
    desc: 'copy my email',
    hidden: true,
    run: () => {
      navigator.clipboard
        ?.writeText(profile.email)
        .then(() => print(`copied ${profile.email} to clipboard`, 'accent'))
        .catch(() => print('clipboard unavailable — select the address above', 'error'))
    },
  },
  cv: {
    desc: 'download my CV (pdf)',
    run: () => {
      print('opening cv.pdf…', 'dim')
      window.open(profile.links.cv, '_blank', 'noopener')
    },
  },
  theme: {
    desc: 'toggle theme',
    alias: 'theme light',
    run: (args) => {
      const arg = args[0]
      const next = arg === 'light' || arg === 'dark' ? arg : theme.value === 'dark' ? 'light' : 'dark'
      setTheme(next)
      print(`theme → ${next}`, 'accent')
    },
  },
  date: {
    desc: 'local time in Baghdad',
    run: () => print(`${baghdadTime()} (GMT+3)`),
  },
  clear: {
    desc: 'clear the screen',
    run: () => {
      lines.value = []
    },
  },
  ls: {
    desc: '',
    hidden: true,
    run: (args) => {
      if ((args[0] ?? '').startsWith('projects')) return commands.projects?.run([])
      print('projects/   skills.txt   contact.md   cv.pdf')
    },
  },
  cat: {
    desc: '',
    hidden: true,
    run: (args) => {
      const file = args[0] ?? ''
      if (file === 'skills.txt') return commands.skills?.run([])
      if (file === 'contact.md') return commands.contact?.run([])
      if (file === 'cv.pdf') return print("cat: cv.pdf: binary file — try 'cv'", 'error')
      print(`cat: ${file || '(missing operand)'}: no such file`, 'error')
    },
  },
  git: {
    desc: '',
    hidden: true,
    run: (args) => {
      if (args[0] === 'log') return commands.log?.run([])
      if (args[0] === 'status') return print('on branch main — nothing to commit, working tree clean')
      print(`git: '${args[0] ?? ''}' is not something this shell knows. try 'git log'`, 'error')
    },
  },
  pwd: { desc: '', hidden: true, run: () => print('/home/ahmed/portfolio') },
  echo: { desc: '', hidden: true, run: (args) => print(args.join(' ')) },
  sudo: { desc: '', hidden: true, run: () => print('ahmed is not in the sudoers file. this incident will be reported.', 'error') },
  exit: { desc: '', hidden: true, run: () => print("there's no leaving — but 'contact' works.", 'dim') },
}

function execute(raw: string) {
  const input = raw.trim()
  lines.value.push({ id: nextId++, kind: 'input', text: input })
  if (!input) return scrollToBottom()
  if (history[0] !== input) history.unshift(input)
  historyIndex = -1

  const [name = '', ...args] = input.split(/\s+/)
  const command = commands[name.toLowerCase()]
  if (command) command.run(args)
  else {
    print(`zsh: command not found: ${name}`, 'error')
    print("type 'help' for a list of commands", 'dim')
  }
  scrollToBottom()
}

// ---------- intro ----------
async function typeOut(text: string) {
  typed.value = ''
  for (const ch of text) {
    if (skipping) break
    typed.value += ch
    await wait(34 + Math.random() * 60)
  }
  typed.value = text
  await wait(260)
  typed.value = ''
}

function playIntro() {
  if (introPromise) return introPromise
  introPromise = (async () => {
    phase.value = 'typing'
    print(`Last login: ${baghdadTime()} on ttys001`, 'dim')
    await wait(500)
    for (const cmd of INTRO) {
      await typeOut(cmd)
      execute(cmd)
      await wait(650)
    }
    print("your turn — type 'help', or tap a command below.", 'accent')
    phase.value = 'interactive'
  })()
  return introPromise
}

/** Finish the intro instantly (any interaction, or reduced motion). */
async function skipIntro() {
  skipping = true
  timers.forEach((id) => clearTimeout(id))
  timers.clear()
  await playIntro()
}

async function runChip(cmd: string) {
  await skipIntro()
  execute(cmd)
  if (hasFinePointer()) inputEl.value?.focus({ preventScroll: true })
}

async function focusInput() {
  if (window.getSelection()?.toString()) return // let people select text
  await skipIntro()
  await nextTick()
  inputEl.value?.focus({ preventScroll: true })
}

function submit() {
  execute(value.value)
  value.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex < history.length - 1) historyIndex++
    value.value = history[historyIndex] ?? value.value
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    historyIndex = Math.max(-1, historyIndex - 1)
    value.value = historyIndex === -1 ? '' : (history[historyIndex] ?? '')
  } else if (e.key === 'Tab' && value.value.trim()) {
    const partial = value.value.trim().toLowerCase()
    const match = Object.keys(commands).find((c) => c.startsWith(partial) && !commands[c]?.hidden)
    if (match) {
      e.preventDefault()
      value.value = `${match} `
    }
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault()
    lines.value = []
  }
}

const { stop } = useIntersectionObserver(
  root,
  (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    stop()
    if (prefersReducedMotion()) skipping = true
    void playIntro()
  },
  { threshold: 0.35 },
)

onMounted(() => {
  if (!('IntersectionObserver' in window)) void skipIntro()
})

onBeforeUnmount(() => {
  skipping = true
  timers.forEach((id) => clearTimeout(id))
})
</script>

<template>
  <div ref="root" class="term">
    <div class="term-bar">
      <span class="term-dots" aria-hidden="true"><i /><i /><i /></span>
      <span class="term-title">{{ USER }} — ~/portfolio — zsh</span>
      <span class="term-size" aria-hidden="true">80×24</span>
    </div>

    <div ref="scroller" class="term-body" data-lenis-prevent @click="focusInput">
      <div role="log" aria-live="polite" aria-label="Terminal output">
        <p v-for="line in lines" :key="line.id" class="line" :class="`line--${line.kind}`">
          <template v-if="line.kind === 'input'">
            <span class="p-user">{{ USER }}</span> <span class="p-path">~</span> <span class="p-sign">$</span>
            {{ line.text }}
          </template>
          <template v-else>{{ line.text }}</template>
        </p>
      </div>

      <p v-if="phase !== 'interactive'" class="line line--input" aria-hidden="true">
        <span class="p-user">{{ USER }}</span> <span class="p-path">~</span> <span class="p-sign">$</span>
        {{ typed }}<span class="caret" />
      </p>
      <form v-else class="line line--input prompt" @submit.prevent="submit">
        <label for="term-input" class="prompt-label">
          <span class="p-user">{{ USER }}</span> <span class="p-path">~</span> <span class="p-sign">$</span>
          <span class="sr-only">Type a command, for example help</span>
        </label>
        <input
          id="term-input"
          ref="inputEl"
          v-model="value"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          enterkeyhint="go"
          @keydown="onKeydown"
        />
      </form>
    </div>

    <div class="chips" role="group" aria-label="Run a command">
      <button v-for="chip in CHIPS" :key="chip" type="button" class="chip press" @click="runChip(chip)">
        {{ chip }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* outer 22 = inner 16 + padding 6 */
.term {
  padding: 6px;
  border-radius: 22px;
  background: var(--ground-3);
  box-shadow: var(--shadow-lg);
  font-family: var(--font-mono);
}
.term-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 12px;
  font-size: 12.5px;
  color: var(--ink-3);
}
.term-dots {
  display: flex;
  gap: 6px;
}
.term-dots i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--ground-4);
}
.term-title {
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.term-body {
  height: clamp(340px, 52vh, 460px);
  overflow-y: auto;
  padding: 18px 20px 20px;
  border-radius: 16px;
  background: var(--ground);
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink-2);
  cursor: text;
  scrollbar-width: thin;
  scrollbar-color: var(--ground-4) transparent;
}
.line {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1.65em;
}
.line--input {
  color: var(--ink);
}
.line--dim {
  color: var(--ink-3);
}
.line--accent {
  color: var(--accent-ink);
}
.line--error {
  color: var(--ink);
}
.line--error::before {
  content: '✕ ';
  color: var(--ink-3);
}
.p-user {
  color: var(--accent-ink);
}
.p-path {
  color: var(--ink-2);
}
.p-sign {
  color: var(--ink-3);
}
.prompt {
  display: flex;
  align-items: baseline;
  gap: 0.6ch;
}
.prompt-label {
  flex: none;
}
.prompt input {
  flex: 1;
  min-width: 0;
  background: transparent;
  color: var(--ink);
  font: inherit;
  caret-color: var(--accent);
  outline: none;
}
.caret {
  display: inline-block;
  width: 0.6em;
  height: 1.15em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: var(--accent);
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 4px 4px;
}
.chip {
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--ground-4);
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 13px;
  transition: transform 160ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .chip:hover {
    color: var(--accent-ink);
  }
}
@media (max-width: 640px) {
  .term-body {
    font-size: 12.5px;
    padding: 14px;
  }
  .term-size {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
