/**
 * The authority section on the home page — §6.1 of the plan, verbatim.
 *
 * This is the pinned-scroll moment: the heading holds while the six pillars
 * advance past it. Six is a real enumeration ("six things decide whether it
 * does that well"), so the indices are earned rather than decorative.
 */

export const PILLARS_HEADING = 'A website is not a brochure anymore'

export const PILLARS_LEAD =
  "It's the part of your business that works while you sleep. Six things decide whether it does that well."

/**
 * @typedef {object} Pillar
 * @property {string} index Position in the six, e.g. "01".
 * @property {string} title One word.
 * @property {string} body  Two or three sentences.
 */

/** @type {Pillar[]} */
export const PILLARS = [
  {
    index: '01',
    title: 'Found',
    body: 'People search in Google and increasingly ask an AI assistant instead. Both need the same things: real content, clean semantic HTML, structured data, pages that can be indexed. If a machine can’t read the page, neither can your next customer.',
  },
  {
    index: '02',
    title: 'Fast',
    body: 'Google measures loading, responsiveness and layout stability, and so do your visitors. On a phone, on a normal connection. Most business sites fail here on unoptimised images and third-party scripts nobody audits.',
  },
  {
    index: '03',
    title: 'Trusted',
    body: 'Accessibility is a legal requirement for a lot of businesses selling into the EU now, not a nice-to-have. Add HTTPS, a real privacy policy, honest cookie consent and GDPR-compliant form handling. This is the part that gets ignored until it’s expensive.',
  },
  {
    index: '04',
    title: 'Converting',
    body: 'One clear action per page. Forms that work on a phone, submit reliably, and tell the person what happens next. Proof that you’ve done the work before.',
  },
  {
    index: '05',
    title: 'Connected',
    body: 'The website is rarely the whole system. It talks to a CRM, an ERP, a payment provider, a booking tool. Getting that plumbing right is the difference between a site that looks finished and a business that runs.',
  },
  {
    index: '06',
    title: 'Owned',
    body: 'You should be able to change your own content, read your own analytics, and take the site elsewhere if you want to. No lock-in, no agency holding the keys.',
  },
]
