import { useCallback, useState } from 'react'

import { DandelionIntro } from '@/components/intro/DandelionIntro'
import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { WaterField } from '@/components/water/WaterField'
import { HERO } from '@/content/site'
import { useHasMounted } from '@/hooks/useHasMounted'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Home hero: the masked-line h1, the lead, and the two actions, over quiet
 * water anchored to the bottom edge.
 *
 * The dandelion intro (Phase D) lives in its own column beside the headline,
 * not overlapping it — the flower and the text are two separate grid columns,
 * the same `lg:grid-cols-2` split `Pillars` uses. Below `lg` they stack:
 * headline first, flower beneath it.
 *
 * Plays on every mount of this component, including a plain refresh — an
 * earlier version gated it to once per browser session via sessionStorage,
 * which read as "broken" during review (the flower appeared once and then
 * never again without opening a new tab). Under reduced motion the flower
 * column is not rendered at all, rather than mounted and immediately hidden.
 *
 * The h1 is rendered unconditionally in every case — it is only ever hidden
 * by `.mask-line`'s own overflow, never by being absent from the tree.
 *
 * @returns {JSX.Element}
 */
export function Hero() {
  const reducedMotion = useReducedMotion()

  /* `useReducedMotion`'s SSR snapshot always reads `false` (there is no request
     header for it), so a server render cannot know a visitor prefers reduced
     motion — only the browser can. Gating on `hasMounted` keeps the flower out
     of any server-rendered HTML entirely, rather than shipping the full
     290-node SVG and then removing it once the client corrects itself, which
     would be exactly the "broken intermediate state" reduced motion is
     supposed to never show. Client-only SPA today, so this has no visible
     effect yet, but it matters the moment prerendering (docs/prerendering.md)
     lands, and it keeps this diagnostic build's own SSR output honest today. */
  const hasMounted = useHasMounted()
  const playIntro = hasMounted && !reducedMotion

  /* `revealed` is derived, not independent state: true once the intro has
     completed, or immediately whenever reduced motion is (or becomes) true.
     Deriving it during render rather than syncing it from an effect also
     covers the flower unmounting mid-flight if reduced motion turns on live
     (devtools, or an OS setting changed in another window) — there is no
     separate "was reduced motion on" state to fall out of sync, so the
     headline can never end up stuck hidden behind .mask-line. */
  const [introComplete, setIntroComplete] = useState(false)
  const revealed = reducedMotion || introComplete

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  return (
    <section className="relative -mt-16 flex min-h-dvh items-center overflow-hidden pt-16">
      <WaterField
        variant="horizon"
        intensity={0.7}
        className="absolute inset-0 -z-10"
      />

      <Container className="py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <MaskedLines
              as="h1"
              text={HERO.heading}
              play={revealed}
              className="text-display-xl"
            />

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
          </div>

          {playIntro ? (
            <div className="mx-auto w-full max-w-[360px] lg:max-w-[420px]">
              <DandelionIntro
                onComplete={handleIntroComplete}
                className="pointer-events-none aspect-[300/320] w-full"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
