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

export {}
