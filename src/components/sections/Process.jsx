import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { PROCESS_HEADING, PROCESS_LEAD, PROCESS_STEPS } from '@/content/process'

/**
 * Four steps, in order. Numbered because it is a real sequence — each step
 * depends on the one before it.
 *
 * @returns {JSX.Element}
 */
export function Process() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <Eyebrow index="04">{PROCESS_HEADING}</Eyebrow>
        <MaskedLines
          as="h2"
          text={PROCESS_LEAD}
          className="mt-8 prose-measure text-display-l"
        />

        <ol className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal as="li" key={step.index} index={i}>
              <div className="border-t border-hairline pt-6">
                <span className="mono-label text-link">{step.index}</span>
                <h3 className="mt-4 text-title">{step.title}</h3>
                <p className="prose-measure mt-3 text-secondary">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
