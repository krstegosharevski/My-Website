import { Marquee } from '@/components/motion/Marquee'
import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { BUILT_WITH, BUILT_WITH_HEADING } from '@/content/site'

/**
 * The tools, as a slow marquee.
 *
 * Set in mono type rather than logos: a wall of brand marks reads as a claim of
 * partnership, and brand logos do not belong in a general icon set anyway.
 *
 * @returns {JSX.Element}
 */
export function BuiltWith() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <Eyebrow index="05">{BUILT_WITH_HEADING}</Eyebrow>
      </Container>

      <Marquee duration={45} className="mt-10 border-y border-hairline py-8">
        {BUILT_WITH.map((tool) => (
          <span
            key={tool}
            className="px-10 font-display text-title whitespace-nowrap text-secondary"
          >
            {tool}
          </span>
        ))}
      </Marquee>
    </section>
  )
}
