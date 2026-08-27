/**
 * Site-wide content: the wordmark, navigation, contact details and social
 * links. Copy lives here, never inline in a component.
 *
 * The values marked TODO are placeholders. They are deliberately obvious rather
 * than plausible, so nothing fake can reach production unnoticed. Replace them
 * before deploying — §9 of the plan is the checklist.
 */

/** @type {string} */
export const WORDMARK = 'Krtse XO'

/** One line, under the wordmark in the footer. */
export const STATEMENT =
  'A one-person studio in Skopje building business websites, customer portals, and the integrations behind them.'

/**
 * @typedef {object} NavItem
 * @property {string} label Link text. Sentence case.
 * @property {string} to    Route path.
 */

/**
 * Main navigation, left to right. `Shop` inserts after `About me` when the shop
 * ships; the account menu replaces the Contact pill once a session exists.
 *
 * @type {NavItem[]}
 */
export const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Websites', to: '/websites' },
  { label: 'About me', to: '/about' },
]

/** The one call to action in the nav, rendered as the signal pill. */
export const NAV_CTA = { label: 'Contact', to: '/contact' }

/** TODO: replace with the real address before deploying. */
export const EMAIL = 'TODO@example.com'

/**
 * @typedef {object} SocialLink
 * @property {keyof import('@/components/site/brandIcons').BRAND_ICONS} icon
 * @property {string} label Brand name, for the accessible label.
 * @property {string} href  Profile URL.
 */

/**
 * TODO: replace every href with the real profile URL before deploying.
 *
 * @type {SocialLink[]}
 */
export const SOCIALS = [
  { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/TODO' },
  { icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/TODO' },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/TODO' },
]

/** Where the studio is, and the timezone the footer clock runs on. */
export const LOCATION = 'Skopje, North Macedonia'
export const TIMEZONE = 'Europe/Skopje'

/* ---------------------------------------------------------------------------
   Home page copy. §6.2 of the plan, verbatim — it is starter text to overwrite,
   which is exactly why it lives here rather than inside a component.
   --------------------------------------------------------------------------- */

export const HERO = {
  heading: 'I build websites, and the systems behind them.',
  lead: 'Krtse XO is a one-person studio in Skopje. I design and build business websites, customer portals, and the integrations that connect them to the tools a company already runs on.',
  primary: { label: 'See the work', to: '/websites' },
  secondary: { label: 'Start a project', to: '/contact' },
}

export const ABOUT_STRIP = {
  eyebrow: 'About me',
  body: 'I’ve spent the last years building portals and integrations for companies whose systems have to actually work — invoices, payments, settlements, data moving between platforms. I bring the same standard to a five-page website.',
  link: { label: 'More about me', to: '/about' },
}

/** TODO: placeholder. One line, one button — write it in your own words. */
export const CONTACT_CTA = {
  heading: 'Tell me what you’re building.',
  body: 'Send a few sentences about the project and I’ll tell you whether I’m the right person for it.',
  action: { label: 'Start a project', to: '/contact' },
}

/**
 * The "Built with" marquee. Tools actually used on this site and on client
 * work — not a logo wall, and not a claim of partnership.
 *
 * @type {string[]}
 */
export const BUILT_WITH = [
  'React',
  'Vite',
  'Tailwind',
  'Node',
  'PostgreSQL',
  'Stripe',
  'Vercel',
  'Playwright',
  'TypeScript',
  'Figma',
]

export const BUILT_WITH_HEADING = 'Built with'
