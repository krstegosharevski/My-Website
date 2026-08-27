/**
 * How a project runs, start to finish.
 *
 * TODO: placeholder copy. The plan lists "four process steps" as content you
 * still have to write (§9), so these are a scaffold in the right register —
 * replace the wording with how you actually work.
 *
 * These are numbered because they are a real sequence: each step depends on the
 * one before it.
 */

export const PROCESS_HEADING = 'How I work'

export const PROCESS_LEAD =
  'Four steps, in this order. You see working software early and you own everything at the end.'

/**
 * @typedef {object} ProcessStep
 * @property {string} index Position in the sequence, e.g. "01".
 * @property {string} title Short label.
 * @property {string} body  Two or three sentences.
 */

/** @type {ProcessStep[]} */
export const PROCESS_STEPS = [
  {
    index: '01',
    title: 'Understand the business',
    body: 'We go through what the site has to do, who it has to convince, and which systems it needs to talk to. I write that down as a short brief before anyone designs anything.',
  },
  {
    index: '02',
    title: 'Structure and design',
    body: 'Content structure first, then the pages. You see real layouts with your own copy in them, not a template with placeholder text, and you review them before I build.',
  },
  {
    index: '03',
    title: 'Build and connect',
    body: 'I build the site and wire up whatever it has to reach — a CRM, a payment provider, a booking tool. You get a staging link from the first week and it stays current.',
  },
  {
    index: '04',
    title: 'Launch and hand over',
    body: 'We check performance, accessibility and analytics before going live. Then you get the accounts, the repository and a walkthrough of how to change your own content.',
  },
]
