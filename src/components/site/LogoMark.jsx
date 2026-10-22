/**
 * The studio mark, shown next to the "Krtse XO" wordmark in the nav.
 *
 * Renders `public/logo.svg`, the single source for every logo on the site —
 * nav, browser tab, and the phone/app icon PNGs are all made from that one
 * file. The design (frosted white square, iridescent edge, three dark dots)
 * lives there rather than inline here: its gradient colours would otherwise be
 * arbitrary hex in a component, which CLAUDE.md rules out. Static assets like
 * this one are exempt, the same way the favicon always was.
 *
 * Decorative (`alt=""`): it always sits beside the wordmark text, which already
 * names the studio, so a screen reader would otherwise announce it twice.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function LogoMark({ className }) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width="28"
      height="28"
      decoding="async"
      className={className}
    />
  )
}
