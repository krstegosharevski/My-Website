/**
 * Case studies.
 *
 * Cuba Libre is the first real entry, replacing the four invented scaffold
 * projects this file used to hold. Three more real sites are expected to
 * follow the same way — three photos sent over, processed, and turned into an
 * entry like this one.
 *
 * `problem`, `result` and every `stats` entry below are explicit TODO
 * placeholders, not invented ones — I only know this project is built in
 * React with an embedded Zenchef reservation panel per location, and what's
 * directly visible in the three screenshots. No fabricated numbers or
 * backstory, per CLAUDE.md's copy rules. Replace the TODOs with the real
 * story and real figures when you have them.
 */

/** @typedef {import('@/content/types').Project} Project */

/** @type {Project[]} */
export const PROJECTS = [
  {
    slug: 'cuba-libre',
    title: 'One site for three restaurants on Lake Ohrid',
    client: 'Cuba Libre',
    anonymized: false,
    /* Assumed as today's date — not confirmed. Correct if this work is older. */
    year: 2026,
    type: 'Website',
    summary:
      'Cuba Libre, The HarbouR Club and Cuba Libre Drim, each with its own page and its own Zenchef reservation panel.',
    description:
      "A React site for Cuba Libre's three restaurants on Lake Ohrid, each with its own page and an embedded Zenchef reservation panel.",
    stack: ['React', 'Zenchef'],
    /* Paste the real address here, e.g. 'https://cubalibre.mk', once you have
       it — the case study's "Visit the live site" button (WebsiteDetail.jsx)
       only renders when this is non-null, so nothing needs to change there. */
    liveUrl: null,
    /* Same file as images[1] below — only three real photos exist for this
       project, and the second is also the strongest card thumbnail. */
    cover: {
      src: '/work/cuba-libre/02.webp',
      alt: 'The three Cuba Libre locations — Cuba Libre, The HarbouR Club and Cuba Libre Drim — each on its own card.',
      caption: '',
      width: 1600,
      height: 765,
    },
    images: [
      {
        src: '/work/cuba-libre/01.webp',
        alt: 'The Cuba Libre Beach & Bar page, with the Zenchef reservation panel open beside a table setting on the dining terrace.',
        caption: 'Reservations open in a panel on the page itself.',
        width: 1600,
        height: 754,
      },
      {
        src: '/work/cuba-libre/02.webp',
        alt: 'The three Cuba Libre locations — Cuba Libre, The HarbouR Club and Cuba Libre Drim — each on its own card.',
        caption: 'One entry point, three restaurants.',
        width: 1600,
        height: 765,
      },
      {
        src: '/work/cuba-libre/03.webp',
        alt: 'The Harbour Club location page, with its interior photos and reservation panel.',
        caption: 'Each location keeps its own gallery and booking panel.',
        width: 1600,
        height: 761,
      },
    ],
    sections: {
      context:
        'Cuba Libre runs three restaurants around Lake Ohrid — Cuba Libre, The HarbouR Club and Cuba Libre Drim — each with a different character and its own booking needs.',
      problem:
        'TODO — what was actually broken or missing before this site? Replace with the real story.',
      approach:
        'Built in React. One site presents all three locations, and a visitor picks where they’re headed. Each location’s page carries its own embedded Zenchef reservation panel.',
      result:
        'TODO — what changed after launch? Replace with the real outcome.',
    },
    stats: [
      { label: 'TODO', value: 'TODO', note: 'Replace with a real result.' },
      { label: 'TODO', value: 'TODO', note: 'Replace with a real result.' },
      { label: 'TODO', value: 'TODO', note: 'Replace with a real result.' },
    ],
    featured: true,
  },
]

/**
 * Look a project up by slug.
 *
 * @param {string | undefined} slug
 * @returns {Project | undefined}
 */
export function getProject(slug) {
  return PROJECTS.find((project) => project.slug === slug)
}

/**
 * The project types actually present, for the index filter chips. Derived so a
 * type never appears as a filter with nothing behind it.
 *
 * @returns {import('@/content/types').ProjectType[]}
 */
export function getProjectTypes() {
  return [...new Set(PROJECTS.map((project) => project.type))]
}
