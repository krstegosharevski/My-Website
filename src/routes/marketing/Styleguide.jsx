import { useState } from 'react'

import { ImageWipe } from '@/components/motion/ImageWipe'
import { Marquee } from '@/components/motion/Marquee'
import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Chip } from '@/components/primitives/Chip'
import { Container } from '@/components/primitives/Container'
import { Divider } from '@/components/primitives/Divider'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { Stat } from '@/components/primitives/Stat'
import { Seo } from '@/components/site/Seo'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { WaterField } from '@/components/water/WaterField'
import { useReducedMotion } from '@/hooks/useReducedMotion'
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
  { name: '--color-signal-lo', hex: '#8FB4FF', use: 'Small blue text on dark.' },
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

/** @type {('signal' | 'outline' | 'ghost')[]} */
const BUTTON_VARIANTS = ['signal', 'outline', 'ghost']

const STACK = [
  'React',
  'Vite',
  'Tailwind',
  'Node',
  'PostgreSQL',
  'Stripe',
  'Vercel',
  'Playwright',
]

/**
 * A labelled block in the styleguide.
 *
 * @param {object} props
 * @param {string} props.index Mono index, e.g. "01".
 * @param {string} props.title Section heading.
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
 * @param {object} props
 * @param {string} props.children
 * @returns {JSX.Element}
 */
function SubHeading({ children }) {
  return <h3 className="mono-label mt-12 mb-6 first:mt-0">{children}</h3>
}

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function Note({ children }) {
  return (
    <p className="prose-measure mb-8 text-sm text-secondary">{children}</p>
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
 * Token and component reference. Not linked from the site — open `/styleguide`
 * directly. Kept out of `MarketingLayout` so the nav and footer don't interfere,
 * and lazy-loaded so it never ships in a visitor's bundle.
 *
 * @returns {JSX.Element}
 */
export function Styleguide() {
  const reducedMotion = useReducedMotion()
  const [fastWater, setFastWater] = useState(false)

  return (
    <Container className="pb-24">
      <Seo
        title="Styleguide — Krtse XO"
        description="Internal token and component reference."
        path="/styleguide"
        noindex
      />
      <header className="flex items-start justify-between gap-6 py-16">
        <div>
          <Eyebrow>Reference</Eyebrow>
          <h1 className="mt-4 text-display-xl">Styleguide</h1>
          <p className="prose-measure mt-6 text-lead text-secondary">
            Every token and component this site is allowed to use. If a value is
            not on this page, it does not belong in a component.
          </p>
          <p
            className={cn(
              'mt-6 inline-block rounded-(--radius-base) border px-3 py-2 font-mono text-sm',
              reducedMotion
                ? 'border-signal text-link'
                : 'border-hairline text-secondary',
            )}
          >
            prefers-reduced-motion:{' '}
            {reducedMotion ? 'reduce — everything below is static' : 'no-preference'}
          </p>
        </div>
        <ThemeToggle className="mt-2 shrink-0" />
      </header>

      <Block index="01" title="Colour">
        <SubHeading>Signal</SubHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNAL_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <SubHeading>Paper — light, the default</SubHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PAPER_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <SubHeading>Ink — dark</SubHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INK_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>

        <SubHeading>Semantic — what components actually use</SubHeading>
        <Note>
          These resolve through the <code className="font-mono">.dark</code>{' '}
          class, so a component never names a theme. Toggle the theme above and
          the values below change while the class names stay the same.
        </Note>
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
        <Note>
          The primary button is a pill; everything else is 4px. Hover one to see
          the label roll from §3.5.4 — the label is rendered twice in a masked
          box and the duplicate slides in as the original leaves. Tab through
          them to check the focus ring.
        </Note>
        <div className="space-y-8">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant}>
              <p className="mono-label mb-4">{variant}</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant={variant}>Start a project</Button>
                <Button variant={variant} to="/websites">
                  See the work
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block index="04" title="Chips">
        <Note>
          Mono, 4px radius, hairline border. Static chips carry stack tags. The
          interactive form is a real button with a pressed state, used for the
          work filters.
        </Note>
        <SubHeading>Static</SubHeading>
        <ul className="flex flex-wrap gap-2">
          {STACK.slice(0, 6).map((label) => (
            <li key={label}>
              <Chip>{label}</Chip>
            </li>
          ))}
        </ul>

        <SubHeading>Interactive</SubHeading>
        <div className="flex flex-wrap gap-2">
          <Chip selected onClick={() => {}}>
            All
          </Chip>
          <Chip onClick={() => {}}>Website</Chip>
          <Chip onClick={() => {}}>Portal</Chip>
          <Chip onClick={() => {}}>Integration</Chip>
        </div>
      </Block>

      <Block index="05" title="Eyebrow, divider and stat">
        <SubHeading>Eyebrow</SubHeading>
        <div className="space-y-4">
          <Eyebrow>Selected work</Eyebrow>
          <Eyebrow index="02">What a business website has to do</Eyebrow>
        </div>

        <SubHeading>Divider</SubHeading>
        <Note>One hairline between sections, never two.</Note>
        <Divider />

        <SubHeading>Stat</SubHeading>
        <Note>
          Case-study results. Three per page, mono label over a serif figure.
        </Note>
        <div className="grid gap-8 sm:grid-cols-3">
          <Stat label="Largest contentful paint" value="1.4s" note="On a throttled 4G phone." />
          <Stat label="Manual invoice steps" value="0" note="Down from eleven." />
          <Stat label="Lighthouse, mobile" value="98" note="Across all four categories." />
        </div>
      </Block>

      <Block index="06" title="Masked line rise">
        <Note>
          §3.5.2, and the only heading animation on the site. The heading below
          is split into the lines the browser actually drew, each rising from
          110% behind its own mask, 700ms with a 70ms stagger. Narrow the window
          and it re-splits — debounced, so it settles rather than thrashing.
          <strong className="font-normal text-primary">
            {' '}
            h1 and h2 only.
          </strong>
        </Note>
        <div className="resize-x overflow-auto rounded-(--radius-base) border border-hairline p-6 [min-width:18rem]">
          <MaskedLines
            as="h2"
            className="text-display-l"
            text="A website is not a brochure anymore, it is the part of your business that works while you sleep"
          />
        </div>
        <Note>
          The box above is resizable by its bottom-right corner, so the re-split
          can be checked without changing the window.
        </Note>
      </Block>

      <Block index="07" title="Reveal">
        <Note>
          §3.5.3, for everything that is not an h1 or h2. Opacity and a 12px
          rise over 500ms, staggered 60ms by list position. Scroll it out of
          view and back — it fires once.
        </Note>
        <div className="space-y-3">
          {['First line', 'Second line', 'Third line', 'Fourth line'].map(
            (line, i) => (
              <Reveal
                key={line}
                index={i}
                className="rounded-(--radius-base) border border-hairline bg-surface-raised px-5 py-4"
              >
                <span className="font-mono text-sm text-secondary">
                  index={i} · delay {(i * 0.06).toFixed(2)}s
                </span>
                <p className="mt-1">{line}</p>
              </Reveal>
            ),
          )}
        </div>
      </Block>

      <Block index="08" title="Image wipe">
        <Note>
          §3.5.6. A clip-path inset from the bottom edge over 800ms, with the
          image scaling 1.06 to 1 inside the mask. Never a plain fade. Width and
          height are real attributes, so the box is reserved before the file
          loads.
        </Note>
        <ImageWipe
          src="/styleguide-sample.svg"
          alt="Placeholder graphic standing in for a project screenshot."
          width={1200}
          height={750}
          className="rounded-(--radius-base) border border-hairline"
        />
      </Block>

      <Block index="09" title="Marquee">
        <Note>
          §3.5.7. Slow continuous scroll that pauses on hover, and on keyboard
          focus landing inside it. The row is rendered twice so the loop has no
          seam; the duplicate is hidden from assistive tech.
        </Note>
        <Marquee duration={30} className="border-y border-hairline py-6">
          {STACK.map((label) => (
            <span
              key={label}
              className="mono-label px-8 whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
      </Block>

      <Block index="10" title="Water">
        <Note>
          §3.6. Four bands, each the sum of three sines with different
          wavelengths, periods and phases. Amplitude runs 6 to 14px and a full
          cycle takes 22 to 45 seconds, so at normal speed it should read as
          still water you happen to notice moving. A ripple opens somewhere new
          every 25 to 60 seconds and a bird crosses every 60 to 120 seconds —
          both far too rare to sit and wait for, hence the control below.
        </Note>
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Chip selected={!fastWater} onClick={() => setFastWater(false)}>
            Normal speed
          </Chip>
          <Chip selected={fastWater} onClick={() => setFastWater(true)}>
            Time × 20
          </Chip>
          <span className="font-mono text-sm text-secondary">
            {fastWater
              ? 'A ripple roughly every 1–3s, a bird every 3–6s.'
              : 'Judge the tuning here. If it draws attention, cut amplitude and opacity — not frame rate.'}
          </span>
        </div>

        <SubHeading>variant="lake" · intensity={'{0.6}'}</SubHeading>
        <Note>
          The About page background. Content scrolls over a fixed full-viewport
          layer of this.
        </Note>
        <div className="relative h-80 overflow-hidden rounded-(--radius-base) border border-hairline bg-surface-raised">
          <WaterField
            variant="lake"
            intensity={0.6}
            timeScale={fastWater ? 20 : 1}
            className="absolute inset-0"
          />
          <p className="relative p-8 text-lead">
            Text sits still on top. The canvas is pointer-events-none and
            aria-hidden.
          </p>
        </div>

        <SubHeading>variant="horizon" · intensity={'{0.35}'}</SubHeading>
        <Note>
          The quieter version behind the home hero, pressed into the bottom
          edge so it never competes with the headline.
        </Note>
        <div className="relative h-80 overflow-hidden rounded-(--radius-base) border border-hairline bg-surface-raised">
          <WaterField
            variant="horizon"
            intensity={0.35}
            timeScale={fastWater ? 20 : 1}
            className="absolute inset-0"
          />
          <p className="relative p-8 text-lead">
            Quiet water at the bottom edge.
          </p>
        </div>
      </Block>

      <Block index="11" title="Container and section">
        <Note>
          <code className="font-mono">Container</code> is 1200px with the gutter
          that keeps text off the edge at 375px — this whole page sits in one.{' '}
          <code className="font-mono">Section</code> adds the vertical rhythm
          from §3.4 and an optional eyebrow and index, and can draw the single
          hairline that separates it from the section above.
        </Note>
        <div className="rounded-(--radius-base) border border-dashed border-hairline">
          <div className="border-b border-hairline px-5 py-3 font-mono text-sm text-secondary">
            {'<Section eyebrow="How I work" index="04">'}
          </div>
          <div className="px-5">
            <div className="py-section">
              <Eyebrow index="04" className="mb-8">
                How I work
              </Eyebrow>
              <p className="prose-measure">
                Section padding is{' '}
                <code className="font-mono">clamp(7rem, 14vh, 12rem)</code>,
                shown here at the real value.
              </p>
            </div>
          </div>
        </div>
      </Block>
    </Container>
  )
}
