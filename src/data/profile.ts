/**
 * Every piece of CV content on the site lives here.
 * Edit this file — components read from it and never hard-code copy.
 * Anything marked TODO is missing real data: fill it in or leave it null
 * (the UI hides null links instead of inventing them).
 */

export type ExperienceType = 'Full-time' | 'Part-time' | 'Freelance' | 'Education' | 'Award'

export interface Experience {
  id: string
  role: string
  org: string
  /** Optional link for the organisation (e.g. its LinkedIn page). */
  orgUrl?: string
  /** Optional project name shown next to the organisation. */
  project?: string
  type: ExperienceType
  location: string
  /** 'YYYY-MM' */
  start: string
  /** 'YYYY-MM', or null while ongoing. */
  end: string | null
  summary: string
  points: string[]
  tags: string[]
}

export interface Project {
  slug: string
  title: string
  kind: string
  year: string
  role: string
  /** Short status shown on the card, e.g. 'In production'. */
  outcome: string
  /** One line for the list row. */
  summary: string
  /** Concrete things built or achieved — shown as a list on the card and in the detail view. */
  highlights: string[]
  /** Paragraphs for the detail view. */
  description: string[]
  stack: string[]
  /** Public URL, or null if there isn't one (e.g. internal software). */
  link: string | null
  /** Path under /public, e.g. '/projects/enjaz.webp'. null → designed typographic cover. */
  image: string | null
  imageAlt?: string
  /** Shown instead of a link when the work is not public. */
  note?: string
}

export type SkillGroup = 'Front-end' | 'Tooling' | 'Languages' | 'Data'

export interface Skill {
  name: string
  group: SkillGroup
  /** Core skills get the big marquee treatment. */
  core?: boolean
}

export interface Profile {
  firstName: string
  lastName: string
  role: string
  company: string
  headline: string
  summary: string
  location: { city: string; country: string; timeZone: string }
  /** First day of professional programming — drives the live "days as a programmer" counter. */
  startDate: string
  githubUsername: string
  email: string
  links: { github: string; linkedin: string | null; companyLinkedin: string; cv: string }
  education: { school: string; degree: string; start: string; end: string; note: string }
  experience: Experience[]
  projects: Project[]
  skills: Skill[]
  spokenLanguages: { name: string; level: string }[]
  certificates: { title: string; issuer: string; date: string }[]
}

export const profile: Profile = {
  firstName: 'Ahmed',
  lastName: 'Jawad',
  role: 'Front-End Developer',
  company: 'Advanced Achievement',
  headline: 'Front-end developer building production ERP interfaces with Vue 3 and TypeScript.',
  summary:
    'I build the screens people work in all day — forms, data tables, filters and dashboards — as reusable, strongly-typed components. Clean code, consistent UI, and business software that feels effortless to use.',
  location: { city: 'Baghdad', country: 'Iraq', timeZone: 'Asia/Baghdad' },
  // TODO: confirm the exact first day at Advanced Achievement (CV says Dec 2025).
  startDate: '2025-12-01',
  githubUsername: 'ahmed-jawadk',
  email: 'ahmed.jawadk.work@gmail.com',
  links: {
    github: 'https://github.com/ahmed-jawadk',
    linkedin: null, // TODO: add your personal LinkedIn URL
    companyLinkedin: 'https://iq.linkedin.com/company/advance-achievement-ltd',
    cv: '/cv.pdf',
  },
  education: {
    school: 'Al-Nahrain University',
    degree: 'B.Eng. Information Technology',
    start: '2021-09',
    end: '2025-06',
    note: 'Programming (C++, Python), Network Engineering',
  },
  experience: [
    {
      id: 'freelance-royal-nuts',
      role: 'Front-End Developer',
      org: 'Freelance',
      project: 'Royal Nuts',
      type: 'Freelance',
      location: 'Remote',
      start: '2026-09',
      end: null,
      summary: 'Designed-to-deployed company website for Royal Nuts, working directly with the client.',
      points: [
        'Built the site from scratch in React — responsive and mobile-first.',
        'Reusable components and pages to showcase the products and brand.',
        'Turned client requirements into a finished, deployed site.',
      ],
      tags: ['React', 'Responsive design', 'Client work'],
    },
    {
      id: 'advanced-achievement',
      role: 'Front-End Developer',
      org: 'Advanced Achievement',
      orgUrl: 'https://iq.linkedin.com/company/advance-achievement-ltd',
      project: 'Enjaz ERP',
      type: 'Full-time',
      location: 'Baghdad, Iraq',
      start: '2025-12',
      end: null,
      summary: 'Developing and maintaining ERP modules and screens for Enjaz ERP.',
      points: [
        'Reusable, strongly-typed UI components in Tailwind CSS, consistent across modules.',
        'Data-heavy views: validated forms, data tables, filters and dashboards.',
        'REST API integration with deliberate loading and error states.',
        'Git-based workflow and code reviews alongside the back-end team.',
      ],
      tags: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git'],
    },
    {
      id: 'al-nahrain',
      role: 'B.Eng. Information Technology',
      org: 'Al-Nahrain University',
      type: 'Education',
      location: 'Baghdad, Iraq',
      start: '2021-09',
      end: '2025-06',
      summary: 'Bachelor of Engineering in Information Technology.',
      points: ['Programming in C++ and Python, network engineering.'],
      tags: ['C++', 'Python', 'Networking'],
    },
    {
      id: 'ai-hub-200',
      role: 'First place — AI HUB 200 Hackathon',
      org: 'Ebria project',
      type: 'Award',
      location: 'Baghdad, Iraq',
      start: '2023-08',
      end: '2023-08',
      summary: 'Won first place with a route-finding web app.',
      points: ['Suggests the fastest route and estimates arrival time.'],
      tags: ['Python', 'JavaScript', 'HTML', 'CSS'],
    },
  ],
  projects: [
    {
      slug: 'enjaz-erp',
      title: 'Enjaz ERP',
      kind: 'Enterprise ERP',
      year: '2025 — now',
      role: 'Front-End Developer · Advanced Achievement',
      outcome: 'In production',
      summary: 'Modules and screens for a large ERP — forms, tables, filters, dashboards.',
      description: [
        'Enjaz ERP is a large business system used for day-to-day operations. I develop and maintain its modules and screens with Vue 3 and TypeScript.',
        'Most of the work is data-heavy: forms with validation, data tables, filters and dashboards — built from reusable, strongly-typed components styled with Tailwind CSS so every module stays consistent.',
        'Views are wired to back-end REST APIs with explicit loading and error states, shipped through a Git-based workflow with code reviews.',
      ],
      highlights: [
        'Reusable, strongly-typed UI components in Tailwind CSS, consistent across modules.',
        'Data-heavy views: validated forms, data tables, filters and dashboards.',
        'REST API integration with deliberate loading and error states.',
        'Git-based workflow and code reviews alongside the back-end team.',
      ],
      stack: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git'],
      link: null,
      image: null, // TODO: add a screenshot if you're allowed to show one
      note: 'Internal software — no public link.',
    },
    {
      slug: 'royal-nuts',
      title: 'Royal Nuts',
      kind: 'Company website',
      year: '2026',
      role: 'Freelance · Front-End Developer',
      outcome: 'Delivered to client',
      summary: 'A responsive company site built from scratch to showcase products and brand.',
      description: [
        'A company website for Royal Nuts, built from scratch in React with a responsive, mobile-friendly layout.',
        'I created reusable components and pages to present the products and brand, and worked directly with the client to turn requirements into a finished, deployed site.',
      ],
      highlights: [
        'Built from scratch in React — responsive and mobile-first.',
        'Reusable components and pages that showcase the products and brand.',
        'Worked directly with the client, from requirements to a deployed site.',
      ],
      stack: ['React', 'JavaScript', 'CSS', 'Responsive design'],
      link: null, // TODO: add the live URL
      image: null, // TODO: add a screenshot, e.g. '/projects/royal-nuts.webp'
    },
    {
      slug: 'ebria',
      title: 'Ebria',
      kind: 'Hackathon — 1st place',
      year: '2023',
      role: 'AI HUB 200 Hackathon',
      outcome: '1st place',
      summary: 'Route-finding web app that suggests the fastest route and estimates arrival.',
      description: [
        'Ebria won first place at the AI HUB 200 Hackathon in Baghdad.',
        'It is a route-finding web app: it suggests the fastest route between two points and estimates the arrival time.',
      ],
      highlights: [
        'First place at the AI HUB 200 Hackathon, Baghdad (Aug 2023).',
        'Suggests the fastest route between two points.',
        'Estimates the arrival time for the chosen route.',
      ],
      stack: ['Python', 'JavaScript', 'HTML', 'CSS'],
      link: null, // TODO: add repo or demo link if one exists
      image: null,
    },
  ],
  skills: [
    { name: 'Vue 3', group: 'Front-end', core: true },
    { name: 'TypeScript', group: 'Front-end', core: true },
    { name: 'Tailwind CSS', group: 'Front-end', core: true },
    { name: 'React', group: 'Front-end', core: true },
    { name: 'JavaScript', group: 'Front-end', core: true },
    { name: 'HTML5', group: 'Front-end' },
    { name: 'CSS3', group: 'Front-end' },
    { name: 'Composition API', group: 'Front-end', core: true },
    { name: 'Responsive design', group: 'Front-end', core: true },
    { name: 'Git & GitHub', group: 'Tooling', core: true },
    { name: 'Vite', group: 'Tooling', core: true },
    { name: 'REST APIs', group: 'Tooling', core: true },
    { name: 'npm', group: 'Tooling' },
    { name: 'VS Code', group: 'Tooling' },
    { name: 'Python', group: 'Languages' },
    { name: 'C++', group: 'Languages' },
    { name: 'C#', group: 'Languages' },
    { name: 'Matplotlib & Seaborn', group: 'Data' },
    { name: 'Excel', group: 'Data' },
  ],
  spokenLanguages: [
    { name: 'Arabic', level: 'Native' },
    { name: 'English', level: 'C1' },
    { name: 'French', level: 'B1' },
  ],
  certificates: [
    { title: 'Google IT Support', issuer: 'Google', date: '2021-08' },
    { title: 'Data Analysis', issuer: 'IBM', date: '2025-06' },
  ],
}

/** Page sections, in order — used by the nav, command palette and active-section tracking. */
export const sections = [
  { id: 'top', label: 'Intro', nav: false },
  { id: 'numbers', label: 'Numbers', nav: false },
  { id: 'shell', label: 'Shell', nav: true },
  { id: 'experience', label: 'Experience', nav: true },
  { id: 'work', label: 'Work', nav: true },
  { id: 'toolkit', label: 'Toolkit', nav: false },
  { id: 'contact', label: 'Contact', nav: false },
] as const

export type SectionId = (typeof sections)[number]['id']

export const fullName = `${profile.firstName} ${profile.lastName}`

/** 'YYYY-MM' → 'Dec 2025' */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
