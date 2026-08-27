/**
 * ============================================================================
 * SCAFFOLD CONTENT — NOT REAL CASE STUDIES. REPLACE BEFORE LAUNCH.
 * ============================================================================
 *
 * Four entries in the right shape, with placeholder images, so the index and
 * detail pages can be built and reviewed against a realistic amount of content.
 * Every figure in `stats` is invented. Do not deploy this file as written —
 * §9 of the plan is the checklist of what you need to write.
 *
 * Every client here is `anonymized: true` and described rather than named, so
 * no company name is attributed to work it did not commission. When you replace
 * these, set `anonymized: false` only for clients who have confirmed you may
 * name them.
 */

/** @typedef {import('@/content/types').Project} Project */

/** @type {Project[]} */
export const PROJECTS = [
  {
    slug: 'freight-invoice-portal',
    title: 'A customer portal that replaced an inbox',
    client: 'A freight forwarder in Skopje',
    anonymized: true,
    year: 2025,
    type: 'Portal',
    summary:
      'Customers check their own shipments and download their own invoices, instead of emailing to ask.',
    description:
      'A customer-facing portal for a freight forwarder, replacing a shared inbox as the way clients got shipment status and invoice copies.',
    stack: ['React', 'Node', 'PostgreSQL', 'Vercel'],
    liveUrl: null,
    cover: {
      src: '/work/freight-invoice-portal/cover.svg',
      alt: 'The portal dashboard, listing recent shipments and their status.',
      caption: '',
      width: 1600,
      height: 1000,
    },
    images: [
      {
        src: '/work/freight-invoice-portal/01.svg',
        alt: 'Shipment list with filters for status and date range.',
        caption: 'Shipments, filtered by status and date.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/freight-invoice-portal/02.svg',
        alt: 'Invoice detail view with a download button and payment status.',
        caption: 'Every invoice is downloadable without asking anyone.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/freight-invoice-portal/03.svg',
        alt: 'The portal on a phone, showing a single shipment.',
        caption: 'Most customers open it on a phone.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: {
      context:
        'The company moved freight across the Balkans and handled several hundred shipments a month. Customers found out where their goods were by emailing an operations address, and asked for invoice copies the same way.',
      problem:
        'Two people spent a large part of every day answering the same two questions. The answers already existed in the company’s transport system — there was just no way for a customer to reach them.',
      approach:
        'I built a portal on top of the existing transport database rather than replacing it. Customers sign in, see only their own shipments, and download invoices directly. Status changes come from the same system operations already used, so there is nothing extra to keep up to date.',
      result:
        'The operations address stopped being a status desk. Customers get an answer without waiting for office hours, and the team kept the system it already knew.',
    },
    stats: [
      { label: 'Status emails per week', value: '−80%', note: 'Measured over the first quarter.' },
      { label: 'Invoice requests', value: '0', note: 'Customers download their own.' },
      { label: 'Systems replaced', value: 'None', note: 'The portal reads the existing database.' },
    ],
    featured: true,
  },
  {
    slug: 'clinic-website',
    title: 'A clinic site that books appointments',
    client: 'A private clinic in Skopje',
    anonymized: true,
    year: 2025,
    type: 'Website',
    summary:
      'Five pages, a booking tool that actually works on a phone, and a privacy policy that is true.',
    description:
      'A small marketing site for a private clinic, with booking handled by the tool the clinic already paid for.',
    stack: ['React', 'Vite', 'Tailwind', 'Vercel'],
    liveUrl: null,
    cover: {
      src: '/work/clinic-website/cover.svg',
      alt: 'The clinic home page, with the booking action at the top.',
      caption: '',
      width: 1600,
      height: 1000,
    },
    images: [
      {
        src: '/work/clinic-website/01.svg',
        alt: 'Services page listing treatments with prices.',
        caption: 'Prices are on the page, not behind a phone call.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/clinic-website/02.svg',
        alt: 'Booking step on a narrow phone screen.',
        caption: 'The booking flow was rebuilt around the phone first.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/clinic-website/03.svg',
        alt: 'Contact page with the clinic address and a map link.',
        caption: 'One clear action per page.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: {
      context:
        'The clinic had a site built on a page builder five years earlier. It loaded slowly on mobile, and the booking widget sat below three screens of scrolling.',
      problem:
        'Most visitors arrived on a phone and left before the page finished loading. The ones who stayed could not find how to book. The cookie banner set analytics cookies before anyone clicked it.',
      approach:
        'Five pages, written before they were designed. The booking tool the clinic already paid for was kept, but moved into the first screen and rebuilt to work at 375px. Consent now runs before any tracking, and the privacy policy describes what the site actually does.',
      result:
        'The site loads quickly on a normal mobile connection, and booking is the first thing a visitor can do rather than the last thing they find.',
    },
    stats: [
      { label: 'Largest contentful paint', value: '1.4s', note: 'Throttled 4G, mid-range phone.' },
      { label: 'Steps to book', value: '2', note: 'Down from five.' },
      { label: 'Cookies before consent', value: '0', note: 'Consent gates every script.' },
    ],
    featured: false,
  },
  {
    slug: 'settlement-integration',
    title: 'Settlement files that reconcile themselves',
    client: 'A payments provider',
    anonymized: true,
    year: 2024,
    type: 'Integration',
    summary:
      'A nightly job that turns provider settlement files into ledger entries, and flags what it cannot match.',
    description:
      'An integration between a payment provider’s settlement reports and an accounting ledger, replacing a manual reconciliation done in spreadsheets.',
    stack: ['Node', 'PostgreSQL', 'Docker'],
    liveUrl: null,
    cover: {
      src: '/work/settlement-integration/cover.svg',
      alt: 'A reconciliation run summary, showing matched and unmatched rows.',
      caption: '',
      width: 1600,
      height: 1000,
    },
    images: [
      {
        src: '/work/settlement-integration/01.svg',
        alt: 'Run history with the number of rows processed per night.',
        caption: 'Every run is inspectable after the fact.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/settlement-integration/02.svg',
        alt: 'An exception queue listing rows that could not be matched.',
        caption: 'What cannot be matched is queued, not guessed.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/settlement-integration/03.svg',
        alt: 'A single transaction traced from settlement file to ledger entry.',
        caption: 'Each entry traces back to a source row.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: {
      context:
        'Settlement reports arrived daily as files. Someone opened them in a spreadsheet, matched them against the ledger by hand, and posted the differences.',
      problem:
        'The work took most of a morning and the mistakes were expensive. Nothing recorded why a given entry had been posted, so a question about last month meant reconstructing the reasoning from memory.',
      approach:
        'A nightly job ingests the files, matches rows against the ledger on a set of documented rules, and posts what it is certain about. Anything ambiguous goes to an exception queue for a person, rather than being guessed. Every posted entry links back to the source row.',
      result:
        'Reconciliation stopped being a daily task and became an exception queue that is usually empty. Questions about a past entry are answered by following the link.',
    },
    stats: [
      { label: 'Reconciliation time', value: '~4h → 0', note: 'Per day, for the finance team.' },
      { label: 'Rows matched automatically', value: '97%', note: 'The rest are queued for review.' },
      { label: 'Entries without an audit trail', value: '0', note: 'Each links to its source row.' },
    ],
    featured: true,
  },
  {
    slug: 'workwear-shop',
    title: 'A trade shop with account pricing',
    client: 'A workwear supplier',
    anonymized: true,
    year: 2024,
    type: 'Shop',
    summary:
      'Business customers sign in and see their own agreed prices, instead of calling for a quote.',
    description:
      'An online shop for a workwear supplier where signed-in trade customers see contract pricing and can reorder from past orders.',
    stack: ['React', 'Node', 'PostgreSQL', 'Stripe'],
    liveUrl: null,
    cover: {
      src: '/work/workwear-shop/cover.svg',
      alt: 'A product listing showing trade prices for a signed-in account.',
      caption: '',
      width: 1600,
      height: 1000,
    },
    images: [
      {
        src: '/work/workwear-shop/01.svg',
        alt: 'Product detail page with size and quantity selection.',
        caption: 'Sizes and quantities the way the trade orders them.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/workwear-shop/02.svg',
        alt: 'Order history with a reorder action on each past order.',
        caption: 'Most orders are a repeat of the last one.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/work/workwear-shop/03.svg',
        alt: 'Checkout summary showing account pricing applied.',
        caption: 'Agreed pricing is applied before checkout, not after.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: {
      context:
        'The supplier sold to businesses on agreed price lists. Retail prices were published online; trade customers phoned to place orders and to check what they would actually pay.',
      problem:
        'Every repeat order went through a person. Customers could not see their own pricing without asking, so the website was no use to the people who bought the most.',
      approach:
        'Accounts carry a price list. Signed-in customers see their own prices throughout, and can reorder any past order in one action. Card payment goes through Stripe; customers on invoice terms check out against their account instead.',
      result:
        'Repeat orders moved to the site, and the phone became the exception rather than the process.',
    },
    stats: [
      { label: 'Repeat orders placed online', value: '2 in 3', note: 'Within six months of launch.' },
      { label: 'Actions to reorder', value: '1', note: 'From the order history.' },
      { label: 'Price lists supported', value: 'Per account', note: 'Applied before checkout.' },
    ],
    featured: false,
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
