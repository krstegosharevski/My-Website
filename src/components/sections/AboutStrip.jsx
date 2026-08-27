import { Reveal } from '@/components/motion/Reveal'
import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { ABOUT_STRIP } from '@/content/site'
import { Link } from 'react-router-dom'

/**
 * A few sentences and a link through to the About page.
 *
 * @returns {JSX.Element}
 */
export function AboutStrip() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <Eyebrow index="06">{ABOUT_STRIP.eyebrow}</Eyebrow>
        <Reveal>
          <p className="prose-measure mt-8 text-lead">{ABOUT_STRIP.body}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            to={ABOUT_STRIP.link.to}
            className="mt-8 inline-block text-link underline underline-offset-4 decoration-1"
          >
            {ABOUT_STRIP.link.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  )
}
