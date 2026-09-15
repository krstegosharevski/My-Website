/**
 * The studio mark: a signal-blue disc with three paper-white dots, same
 * geometry as `public/favicon.svg` — that file exists as a static asset
 * favicons must be, this exists to sit inline next to the wordmark using
 * theme tokens (`fill-signal`, `fill-paper`) rather than the favicon's
 * hard-coded hex, per CLAUDE.md's no-arbitrary-hex rule.
 *
 * `fill-paper` rather than `fill-surface`: the dots need to stay white on the
 * blue disc in both themes, not follow the page's own light/dark surface.
 *
 * `aria-hidden` — always sits beside the "Krtse XO" wordmark text, which
 * already names the studio; an accessible name here would have a screen
 * reader announce it twice.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <circle cx="24" cy="24" r="24" className="fill-signal" />
      <g className="fill-paper">
        <circle cx="31" cy="34.5" r="8" />
        <circle cx="29" cy="15" r="7.5" />
        <circle cx="11" cy="26" r="5.5" />
      </g>
    </svg>
  )
}
