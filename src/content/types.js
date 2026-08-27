/**
 * Shared shapes, as JSDoc typedefs.
 *
 * This project is JavaScript, not TypeScript — these give real editor
 * autocomplete with no build step. Import them with
 * `@type {import('@/content/types').Project}`.
 *
 * This file exports no runtime values on purpose.
 */

/**
 * @typedef {'Website' | 'Portal' | 'Shop' | 'Integration' | 'App'} ProjectType
 */

/**
 * @typedef {object} ProjectImage
 * @property {string} src     Path under `/work/<slug>/`.
 * @property {string} alt     What the image shows. Never empty in a gallery.
 * @property {string} caption One line under the image.
 * @property {number} width   Intrinsic width, so the box is reserved.
 * @property {number} height  Intrinsic height, so the box is reserved.
 */

/**
 * @typedef {object} ProjectSections
 * @property {string} context  Where the client was before the work started.
 * @property {string} problem  What was actually wrong.
 * @property {string} approach What I did about it.
 * @property {string} result   What changed. Prose; the figures live in `stats`.
 */

/**
 * @typedef {object} ProjectStat
 * @property {string} label What the figure measures.
 * @property {string} value The figure.
 * @property {string} [note] One short line of context.
 */

/**
 * A case study.
 *
 * When `anonymized` is true, `client` is a descriptor rather than a name, and
 * the real name must appear nowhere in the file — not in a caption, not in an
 * alt attribute, not in an image filename.
 *
 * @typedef {object} Project
 * @property {string} slug        URL segment.
 * @property {string} title       Case-study title. Sentence case.
 * @property {string} client      Company name, or a descriptor when anonymized.
 * @property {boolean} anonymized Whether `client` is a descriptor.
 * @property {number} year        Year the work shipped.
 * @property {ProjectType} type   Drives the filter chips on the index.
 * @property {string} summary     One line, used on the card.
 * @property {string} description One paragraph, used in metadata.
 * @property {string[]} stack     Technologies, rendered as chips.
 * @property {string | null} liveUrl Public URL, or null when there isn't one.
 * @property {ProjectImage} cover Card and header image.
 * @property {ProjectImage[]} images Gallery.
 * @property {ProjectSections} sections
 * @property {ProjectStat[]} stats Exactly three, shown as mono-labelled figures.
 * @property {boolean} featured   Featured projects span the full grid width.
 */

/* ---------------------------------------------------------------------------
   Shop and order shapes. Phase 8 seams — nothing here is wired to a real cart
   or checkout yet. See src/components/shop/CartProvider.jsx and
   docs/shop-architecture.md.
   --------------------------------------------------------------------------- */

/**
 * @typedef {'digital' | 'service'} ProductKind
 */

/**
 * @typedef {object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {ProductKind} kind    Digital goods ship instantly; services don't.
 * @property {number} priceCents   Integer cents. Never a float — floats lose
 *   cents in arithmetic, and a price is exactly the wrong place for that.
 * @property {string} currency     ISO 4217, e.g. "EUR".
 * @property {string} image
 */

/**
 * @typedef {object} CartItem
 * @property {string} productId
 * @property {number} quantity
 * @property {number} priceCents Captured at add-time, so a later price change
 *   doesn't alter a cart someone is already holding.
 */

/**
 * @typedef {object} Cart
 * @property {CartItem[]} items
 * @property {number} subtotalCents Derived from `items`; never stored separately.
 */

/**
 * @typedef {'pending' | 'paid' | 'fulfilled' | 'cancelled'} OrderStatus
 */

/**
 * @typedef {object} OrderItem
 * @property {string} productId
 * @property {string} title      Copied at order time, so a renamed product
 *   doesn't rewrite the history of what was actually ordered.
 * @property {number} quantity
 * @property {number} priceCents Copied at order time, for the same reason.
 */

/**
 * @typedef {object} Order
 * @property {string} id
 * @property {string} userId
 * @property {OrderItem[]} items
 * @property {number} totalCents
 * @property {OrderStatus} status
 * @property {string} createdAt ISO 8601.
 */

export {}
