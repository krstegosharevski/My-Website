import { ThemeToggle } from '@/components/site/ThemeToggle'
import { cn } from '@/lib/cn'

/**
 * @typedef {object} TokenSwatch
 * @property {string} name  CSS custom property, as authored in `@theme`.
 * @property {string} hex   Literal value, for reading off the page.
 * @property {string} use   What it is for.
 */

/** @type {TokenSwatch[]} */
const SIGNAL_TOKENS = [
  {
    name: '--color-signal',
    hex: '#1F5EFF',
    use: 'Fills, active states, focus rings, water tint. Never body text.',
  },
  {
    name: '--color-signal-lo',
    hex: '#8FB4FF',
    use: 'Small blue text on dark.',
  },
  {
    name: '--color-signal-ink',
    hex: '#1A4FD6',
    use: 'Small blue text on paper.',
  },
]

/** @type {TokenSwatch[]} */
const PAPER_TOKENS = [
  { name: '--color-paper', hex: '#FAF9F6', use: 'Base' },
  { name: '--color-paper-raised', hex: '#FFFFFF', use: 'Raised' },
  { name: '--color-paper-hairline', hex: '#E5E2DC', use: 'Hairline' },
  { name: '--color-paper-text', hex: '#14161A', use: 'Text' },
  { name: '--color-paper-muted', hex: '#5C6672', use: 'Muted' },
]

/** @type {TokenSwatch[]} */
const INK_TOKENS = [
  { name: '--color-ink', hex: '#0B0D10', use: 'Base' },
  { name: '--color-ink-raised', hex: '#14171C', use: 'Raised' },
  { name: '--color-ink-hairline', hex: '#1F242C', use: 'Hairline' },
  { name: '--color-ink-text', hex: '#F4F6F8', use: 'Text' },
  { name: '--color-ink-muted', hex: '#8A93A0', use: 'Muted' },
]

const SEMANTIC_TOKENS = [
  { name: '--surface-base', utility: 'bg-surface' },
  { name: '--surface-raised', utility: 'bg-surface-raised' },
  { name: '--surface-hairline', utility: 'border-hairline' },
  { name: '--text-primary', utility: 'text-primary' },
  { name: '--text-secondary', utility: 'text-secondary' },
  { name: '--text-link', utility: 'text-link' },
]

const TYPE_SCALE = [
  {
    utility: 'text-display-xl',
    spec: 'clamp(2.5rem, 5.5vw, 4.75rem) · 1.05 · -0.02em · serif',
    sample: 'Hero headline',
  },
  {
    utility: 'text-display-l',
    spec: 'clamp(1.875rem, 3.5vw, 3rem) · 1.1 · -0.018em · serif',
    sample: 'Section heading',
  },
  {
    utility: 'text-title',
    spec: 'clamp(1.25rem, 2vw, 1.5rem) · 1.3 · sans',
    sample: 'Card title',
  },
  {
    utility: 'text-lead',
    spec: 'clamp(1.125rem, 1.5vw, 1.375rem) · 1.55 · sans',
    sample: 'A lead paragraph sits under the heading and carries the argument.',
  },
  {
    utility: 'text-body',
    spec: '1.125rem · 1.65 · sans · 70ch measure',
    sample:
      'Body copy. Short declarative sentences, capped at seventy characters so the eye can find the next line without hunting for it.',
  },
]

/**
 * A labelled block in the styleguide.
 *
 * @param {object} props
 * @param {string} props.index   Mono index, e.g. "01".
 * @param {string} props.title   Section heading.
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function Block({ index, title, children }) {
  return (
    <section className="border-t border-hairline py-16">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="mono-label">{index}</span>
        <h2 className="text-display-l">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/**
 * A colour swatch with its custom property and hex.
 *
 * @param {object} props
 * @param {TokenSwatch} props.token
 * @returns {JSX.Element}
 */
function Swatch({ token }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="size-14 shrink-0 rounded-(--radius-base) border border-hairline"
        style={{ backgroundColor: `var(${token.name})` }}
      />
      <div className="min-w-0">
        <p className="font-mono text-sm">{token.name}</p>
        <p className="font-mono text-sm text-secondary">{token.hex}</p>
        <p className="mt-1 text-sm text-secondary">{token.use}</p>
      </div>
    </div>
  )
}

/**
 * Demo button. Phase 1 replaces this with the real `Button` primitive, which
 * adds the hover label roll from §3.5.4.
 *
 * @param {object} props
 * @param {'signal' | 'outline' | 'ghost'} props.variant
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function DemoButton({ variant, disabled, className, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center px-6 py-3 text-sm',
        'transition-colors duration-(--duration-hover)',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'signal' &&
          'rounded-full bg-signal text-white hover:bg-signal-ink',
        variant === 'outline' &&
          'rounded-(--radius-base) border border-hairline hover:border-signal',
        variant === 'ghost' &&
          'rounded-(--radius-base) text-secondary hover:text-primary',
        className,
      )}
    >
      {children}
    </button>
  )
}

/**
 * Token and component reference. Not linked from the site — open `/styleguide`
 * directly. Kept out of `MarketingLayout` so the nav and footer don't interfere,
 * and lazy-loaded so it never ships in a visitor's bundle.
 *
 * @returns {JSX.Element}
 */
export function Styleguide() {
  return (
    <div className="mx-auto max-w-site px-6 pb-24">
      <header className="flex items-start justify-between gap-6 py-16">
        <div>
          <p className="mono-label">Reference</p>
          <h1 className="mt-4 text-display-xl">Styleguide</h1>
          <p className="prose-measure mt-6 text-lead text-secondary">
            Every token this site is allowed to use. If a value is not on this
            page, it does not belong in a component.
          </p>
        </div>
        <ThemeToggle className="mt-2 shrink-0" />
      </header>

      <Block index="01" title="Colour">
        <h3 className="mono-label mb-6">Signal</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNAL_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <h3 className="mono-label mt-12 mb-6">Paper — light, the default</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PAPER_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <h3 className="mono-label mt-12 mb-6">Ink — dark</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INK_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <h3 className="mono-label mt-12 mb-6">
          Semantic — what components actually use
        </h3>
        <p className="prose-measure mb-6 text-sm text-secondary">
          These resolve through the <code className="font-mono">.dark</code>{' '}
          class, so a component never names a theme. Toggle the theme above and
          the values below change while the class names stay the same.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SEMANTIC_TOKENS.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-3 rounded-(--radius-base) border border-hairline bg-surface-raised p-3"
            >
              <span
                className="size-6 shrink-0 rounded-(--radius-base) border border-hairline"
                style={{ backgroundColor: `var(${token.name})` }}
              />
              <span className="font-mono text-sm">{token.name}</span>
              <span className="ml-auto font-mono text-sm text-secondary">
                {token.utility}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <Block index="02" title="Type">
        <div className="space-y-10">
          {TYPE_SCALE.map((step) => (
            <div key={step.utility}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-sm text-link">
                  {step.utility}
                </span>
                <span className="font-mono text-sm text-secondary">
                  {step.spec}
                </span>
              </div>
              <p className={cn(step.utility, 'prose-measure')}>{step.sample}</p>
            </div>
          ))}

          <div>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-sm text-link">.mono-label</span>
              <span className="font-mono text-sm text-secondary">
                0.75rem · 0.12em · uppercase · mono
              </span>
            </div>
            <p className="mono-label">Eyebrow, index, metadata, form label</p>
          </div>
        </div>
      </Block>

      <Block index="03" title="Buttons">
        <p className="prose-measure mb-8 text-sm text-secondary">
          The primary button is a pill; everything else is 4px. Phase 1 adds the
          hover label roll. Tab through these to check the focus ring.
        </p>
        <div className="space-y-8">
          {['signal', 'outline', 'ghost'].map((variant) => (
            <div key={variant}>
              <p className="mono-label mb-4">{variant}</p>
              <div className="flex flex-wrap items-center gap-4">
                <DemoButton variant={variant}>Start a project</DemoButton>
                <DemoButton variant={variant} disabled>
                  Disabled
                </DemoButton>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block index="04" title="Chips">
        <p className="prose-measure mb-8 text-sm text-secondary">
          Mono, 4px radius, hairline border. Used for stack tags and the work
          filters.
        </p>
        <ul className="flex flex-wrap gap-2">
          {['React', 'Vite', 'Tailwind', 'Node', 'PostgreSQL', 'Stripe'].map(
            (label) => (
              <li
                key={label}
                className="rounded-(--radius-base) border border-hairline px-3 py-1.5 font-mono text-label tracking-(--text-label--letter-spacing) uppercase text-secondary"
              >
                {label}
              </li>
            ),
          )}
        </ul>
      </Block>

      <Block index="05" title="Divider">
        <p className="prose-measure mb-8 text-sm text-secondary">
          One hairline between sections, never two. Every block on this page is
          separated by one.
        </p>
        <hr className="border-t border-hairline" />
      </Block>
    </div>
  )
}
