import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Container } from '@/components/primitives/Container'
import { PILLARS, PILLARS_HEADING, PILLARS_LEAD } from '@/content/pillars'

/**
 * The authority section, and the one pinned moment on the site (§3.5.5).
 *
 * The pin is `position: sticky` rather than a scroll-driven transform. That is
 * a deliberate choice: sticky releases cleanly at both ends because the browser
 * owns it, it cannot fight Lenis, it costs nothing on the main thread, and it
 * is not scroll-jacking — the page still scrolls exactly as far as its content.
 *
 * Below 1024px the sticky is dropped and it becomes a plain stack, per the
 * plan.
 *
 * @returns {JSX.Element}
 */
export function Pillars() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <MaskedLines
              as="h2"
              text={PILLARS_HEADING}
              className="text-display-l"
            />
            <Reveal delay={0.2}>
              <p className="prose-measure mt-6 text-lead text-secondary">
                {PILLARS_LEAD}
              </p>
            </Reveal>
          </div>

          <ol className="flex flex-col gap-14">
            {PILLARS.map((pillar) => (
              <Reveal as="li" key={pillar.index}>
                <div className="flex items-baseline gap-4">
                  <span className="mono-label text-link">{pillar.index}</span>
                  <h3 className="text-title">{pillar.title}</h3>
                </div>
                <p className="prose-measure mt-4 text-secondary">
                  {pillar.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
