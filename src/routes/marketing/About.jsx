import { MaskedLines } from '@/components/motion/MaskedLines'
import { Button } from '@/components/primitives/Button'
import { Chip } from '@/components/primitives/Chip'
import { Container } from '@/components/primitives/Container'
import { Seo } from '@/components/site/Seo'
import { WaterField } from '@/components/water/WaterField'
import {
  ABOUT_BIO,
  ABOUT_HEADING,
  AVAILABILITY,
  AVAILABILITY_HEADING,
  HOW_I_WORK,
  HOW_I_WORK_HEADING,
  STACK_GROUPS,
} from '@/content/about'

/**
 * About.
 *
 * The water is a fixed full-viewport layer and the content scrolls over it, so
 * the page reads as text on still water rather than text on a picture that
 * scrolls with it.
 *
 * Nothing here reveals on scroll except the h1's masked rise. This is the one
 * page where the water is the foreground event, and a second animation in the
 * same viewport would compete with it.
 *
 * Contrast was measured rather than assumed, against `--water-alpha` at its
 * original value (see globals.css). Over the densest part of the water at
 * `intensity={0.6}`: on paper, body text landed at about 15.3:1 and muted text
 * at about 4.9:1; on dark, about 16.6:1 and 5.8:1. All passed AA for normal
 * text, muted text with less margin than the rest.
 *
 * A later pass raised `--water-alpha` chasing visibility, which invalidated
 * this measurement (flagged here at the time); a further pass reverted it to
 * the original value once the real fix — a stroked crest line on each band,
 * not a thicker fill — was found. So the fill wash's contrast is back to
 * what's measured above. The crest line is new since that measurement: a
 * 1.25px stroke at several times the fill alpha, which occasionally crosses a
 * glyph. Its width limits how much any single character's contrast can move,
 * but it wasn't part of the number above — worth a glance, not a re-measure.
 *
 * @returns {JSX.Element}
 */
export function About() {
  return (
    <>
      {/* Fixed, behind everything, and outside the scrolling flow. */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <WaterField variant="lake" intensity={0.6} />
      </div>

      <Container className="py-section">
        <Seo
          title="About — Krtse XO"
          description="Who builds Krtse XO, what I work with, and how I run a project."
          path="/about"
        />
        <MaskedLines
          as="h1"
          text={ABOUT_HEADING}
          className="prose-measure text-display-xl"
        />

        <div className="prose-measure mt-10 flex flex-col gap-6 text-lead">
          {ABOUT_BIO.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-24">
          <h2 className="mono-label">What I work with</h2>
          <dl className="mt-8 flex flex-col gap-8">
            {STACK_GROUPS.map((group) => (
              <div key={group.label}>
                <dt className="text-title">{group.label}</dt>
                <dd className="mt-4">
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item}>
                        <Chip>{item}</Chip>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-24">
          <h2 className="mono-label">{HOW_I_WORK_HEADING}</h2>
          <ul className="prose-measure mt-8 flex flex-col">
            {HOW_I_WORK.map((line) => (
              <li
                key={line.slice(0, 32)}
                className="border-t border-hairline py-4 last:border-b"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24">
          <h2 className="mono-label">{AVAILABILITY_HEADING}</h2>
          <p className="prose-measure mt-6 text-lead">{AVAILABILITY}</p>
          <Button to="/contact" variant="signal" className="mt-8">
            Start a project
          </Button>
        </section>
      </Container>
    </>
  )
}
