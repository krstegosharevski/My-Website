import { useCallback, useState } from 'react'

import { DandelionIntro } from '@/components/intro/DandelionIntro'
import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { WaterField } from '@/components/water/WaterField'
import { HERO } from '@/content/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Plays once per browser session. Matches the `krtse-theme` key naming. */
const INTRO_KEY = 'krtse-intro'

/**
 * Whether the dandelion has already played in this session.
 *
 * Read synchronously in a lazy initialiser so the first render already knows,
 * rather than flashing the flower and then removing it.
 *
 * @returns {boolean}
 */
function introAlreadyPlayed() {
  if (typeof window === 'undefined') return true
  try {
    return sessionStorage.getItem(INTRO_KEY) === 'played'
  } catch {
    /* Safari private mode throws on sessionStorage. Treat it as played — a
       missing intro is a much smaller problem than one that repeats. */
    return true
  }
}

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
 * On the first visit of a session the dandelion intro (Phase D) runs and the
 * headline rises into the space the flower vacates. On every later visit, and
 * always under reduced motion, the flower is never mounted and the hero renders
 * in its final state immediately.
 *
 * The h1 is rendered unconditionally in every one of those cases — it is only
 * ever hidden by `.mask-line`'s overflow, never by being absent from the tree.
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const reducedMotion = useReducedMotion()
  const [alreadyPlayed] = useState(introAlreadyPlayed)

  const playIntro = !alreadyPlayed && !reducedMotion
  const [revealed, setRevealed] = useState(!playIntro)

  const handleIntroComplete = useCallback(() => {
    setRevealed(true)
    try {
      sessionStorage.setItem(INTRO_KEY, 'played')
    } catch {
      /* Nothing to do — the intro simply plays again next navigation. */
    }
  }, [])

  return (
    <section className="relative -mt-16 flex min-h-dvh items-center overflow-hidden pt-16">
      <WaterField
        variant="horizon"
        intensity={0.35}
        className="absolute inset-0 -z-10"
      />

      <Container className="py-24">
        {/* The dandelion and the h1 share this box. `w-max` with a 16ch cap
            means it is exactly as wide as the headline actually renders, so the
            flower centres on the words rather than on the container. */}
        <div className="relative w-max max-w-[16ch]">
          {playIntro ? (
            <DandelionIntro
              onComplete={handleIntroComplete}
              /* The seed head sits at y=130 of a 320-unit viewBox — 40.6%, not
                 50% — so centring the box would leave the head high. The extra
                 9.4% drop puts the head itself over the headline. */
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-[300/320] w-[min(65vw,400px)] -translate-x-1/2 -translate-y-[40.6%]"
            />
          ) : null}

          <MaskedLines
            as="h1"
            text={HERO.heading}
            play={revealed}
            className="text-display-xl"
          />
        </div>

        <Reveal delay={0.25} play={revealed}>
          <p className="prose-measure mt-8 text-lead text-secondary">
            {HERO.lead}
          </p>
        </Reveal>

        <Reveal
          delay={0.35}
          play={revealed}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
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
