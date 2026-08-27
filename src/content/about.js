/**
 * About page copy.
 *
 * TODO: the two bio paragraphs and the availability line are placeholders in
 * the right register. §9 of the plan lists "bio, short and long" as content you
 * still have to write. The stack groups are real — edit them to match what you
 * actually work with.
 */

export const ABOUT_HEADING = 'I build the parts that have to keep working'

export const ABOUT_BIO = [
  'I’m a developer in Skopje working on my own. Most of what I’ve built has been on the unglamorous side of software: invoices, payments, settlements, data moving between systems that were never designed to talk to each other. That work has a useful property — when it’s wrong, somebody notices immediately.',
  'I bring the same standard to a five-page website. That means it loads quickly on a phone on a normal connection, a keyboard reaches everything, the forms actually submit, and you can change your own content afterwards without calling me. A site is part of how a business runs, not a brochure it publishes once.',
]

/**
 * @typedef {object} StackGroup
 * @property {string} label What the group covers.
 * @property {string[]} items Tools, most-used first.
 */

/** @type {StackGroup[]} */
export const STACK_GROUPS = [
  {
    label: 'Front end',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind', 'HTML', 'CSS'],
  },
  {
    label: 'Back end',
    items: ['Node', 'PostgreSQL', 'REST', 'Serverless functions'],
  },
  {
    label: 'Integration',
    items: ['Stripe', 'CRM and ERP APIs', 'Webhooks', 'Scheduled jobs'],
  },
  {
    label: 'Practice',
    items: ['Accessibility', 'Core Web Vitals', 'GDPR', 'Playwright'],
  },
]

export const HOW_I_WORK_HEADING = 'How I work'

/** @type {string[]} */
export const HOW_I_WORK = [
  'You talk to the person building it. There is no account manager in between.',
  'Content structure comes before design, and design comes before code.',
  'You get a staging link in the first week and it stays current.',
  'Accessibility and performance are part of the build, not a pass at the end.',
  'You own the repository, the accounts and the content. No lock-in.',
]

export const AVAILABILITY_HEADING = 'Availability'

/** TODO: keep this current, or delete it. A stale date is worse than none. */
export const AVAILABILITY =
  'I’m taking on new projects. Small sites usually start within two weeks; larger portal and integration work is booked further out.'
