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
