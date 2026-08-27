import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { PROJECTS } from '@/content/projects'

/** Featured work leads, then the rest fill the row. Three on the home page. */
const SELECTED = [...PROJECTS]
  .sort((a, b) => Number(b.featured) - Number(a.featured))
  .slice(0, 3)

/**
 * Three case studies on the home page, with a way through to the rest.
 *
 * @returns {JSX.Element}
 */
export function SelectedWork() {
  return (
    <section className="border-t border-hairline py-section">
      <Container>
        <Eyebrow index="03">Selected work</Eyebrow>
        <MaskedLines
          as="h2"
          text="A few things I have built"
          className="mt-8 text-display-l"
        />

        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {SELECTED.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              featured={i === 0}
              className={i === 0 ? 'md:col-span-2' : undefined}
            />
          ))}
        </div>

        <Reveal className="mt-16">
          <Button to="/websites" variant="outline">
            See all the work
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
