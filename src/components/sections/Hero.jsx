import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { WaterField } from '@/components/water/WaterField'
import { HERO } from '@/content/site'

/**
 * Home hero: the masked-line h1, the lead, and the two actions, over quiet
 * water anchored to the bottom edge.
 *
 * The water is `horizon` at 0.35 — ambient, and deliberately weak enough that
 * it never competes with the heading rising above it.
 *
 * The section pulls up under the fixed header (`-mt-16` against the layout's
 * `pt-16`) so the hero starts at the top of the viewport and the header sits
 * transparent over it.
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  return (
    <section className="relative -mt-16 flex min-h-dvh items-center overflow-hidden pt-16">
      <WaterField
        variant="horizon"
        intensity={0.35}
        className="absolute inset-0 -z-10"
      />

      <Container className="py-24">
        <MaskedLines
          as="h1"
          text={HERO.heading}
          className="prose-measure text-display-xl"
        />

        <Reveal delay={0.25}>
          <p className="prose-measure mt-8 text-lead text-secondary">
            {HERO.lead}
          </p>
        </Reveal>

        <Reveal delay={0.35} className="mt-10 flex flex-wrap items-center gap-4">
          <Button to={HERO.primary.to} variant="signal">
            {HERO.primary.label}
          </Button>
          <Button to={HERO.secondary.to} variant="ghost">
            {HERO.secondary.label}
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
