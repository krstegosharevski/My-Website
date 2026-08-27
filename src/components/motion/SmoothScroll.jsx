import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { useEffect, useState } from 'react'

import { LenisContext } from '@/hooks/useLenis'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Softened scrolling, per §3.5.1. `lerp: 0.1` — softened, not slippery.
 *
 * Lenis is not started at all under reduced motion, which leaves the browser's
 * native scrolling in place rather than wrapping it in a disabled controller.
 * The rAF loop is cancelled and the instance destroyed on unmount.
 *
 * Read the instance with the `useLenis` hook.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function SmoothScroll({ children }) {
  const reducedMotion = useReducedMotion()
  const [lenis, setLenis] = useState(
    /** @type {import('lenis').default | null} */ (null),
  )

  useEffect(() => {
    if (reducedMotion) return undefined

    const instance = new Lenis({ lerp: 0.1 })
    setLenis(instance)

    let frame = requestAnimationFrame(function raf(time) {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      setLenis(null)
    }
  }, [reducedMotion])

  return <LenisContext value={lenis}>{children}</LenisContext>
}
