import { AboutStrip } from '@/components/sections/AboutStrip'
import { BuiltWith } from '@/components/sections/BuiltWith'
import { ContactCta } from '@/components/sections/ContactCta'
import { Hero } from '@/components/sections/Hero'
import { Pillars } from '@/components/sections/Pillars'
import { Process } from '@/components/sections/Process'
import { SelectedWork } from '@/components/sections/SelectedWork'

/**
 * Home page, assembled in the order from §6 of the plan.
 *
 * The order is the argument: what a website has to do, proof that I do it, how
 * the work runs, who I am, and then one way to make contact.
 *
 * Each section draws its own top hairline, so there is exactly one rule between
 * any two of them.
 *
 * @returns {JSX.Element}
 */
export function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <SelectedWork />
      <Process />
      <BuiltWith />
      <AboutStrip />
      <ContactCta />
    </>
  )
}
