import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { CONTACT_CTA } from '@/content/site'

/**
 * The last thing on the page: one line, one button.
 *
 * @returns {JSX.Element}
 */
export function ContactCta() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <MaskedLines
          as="h2"
          text={CONTACT_CTA.heading}
          className="prose-measure text-display-l"
        />
        <Reveal delay={0.15}>
          <p className="prose-measure mt-6 text-lead text-secondary">
            {CONTACT_CTA.body}
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10">
          <Button to={CONTACT_CTA.action.to} variant="signal">
            {CONTACT_CTA.action.label}
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
