import { useSearchParams } from 'react-router-dom'

import { MaskedLines } from '@/components/motion/MaskedLines'
import { Chip } from '@/components/primitives/Chip'
import { Container } from '@/components/primitives/Container'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { Seo } from '@/components/site/Seo'
import { getProjectTypes, PROJECTS } from '@/content/projects'

const TYPES = getProjectTypes()

/**
 * Work index.
 *
 * The grid is asymmetric on purpose: featured projects span both columns, so
 * the page has a rhythm rather than reading as a uniform tile wall.
 *
 * The active filter lives in the URL as `?type=`, so a filtered view can be
 * linked, bookmarked and reached with the back button. An unknown value in the
 * query falls through to showing everything rather than an empty page.
 *
 * @returns {JSX.Element}
 */
export function Websites() {
  const [searchParams, setSearchParams] = useSearchParams()

  const requested = searchParams.get('type')
  const activeType = TYPES.includes(requested) ? requested : null

  const visible = activeType
    ? PROJECTS.filter((project) => project.type === activeType)
    : PROJECTS

  /**
   * @param {string | null} type Null clears the filter.
   */
  function selectType(type) {
    /* `replace` keeps filter changes out of the history stack, so Back leaves
       the index rather than stepping through every chip that was clicked. */
    setSearchParams(type ? { type } : {}, { replace: true })
  }

  return (
    <Container className="py-section">
      <Seo
        title="Websites and portals — Krtse XO"
        description="Case studies in business websites, customer portals and the integrations that connect them to the tools a company already runs on."
        path="/websites"
      />
      <Eyebrow>Work</Eyebrow>
      <MaskedLines
        as="h1"
        text="Websites, portals and the plumbing behind them"
        className="mt-6 prose-measure text-display-xl"
      />

      <div className="mt-12 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <Chip selected={activeType === null} onClick={() => selectType(null)}>
          All
        </Chip>
        {TYPES.map((type) => (
          <Chip
            key={type}
            selected={activeType === type}
            onClick={() => selectType(type)}
          >
            {type}
          </Chip>
        ))}
      </div>

      <p aria-live="polite" className="mono-label mt-6">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        {activeType ? ` · ${activeType}` : ''}
      </p>

      <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {visible.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            featured={project.featured}
            priority={i === 0}
            className={project.featured ? 'md:col-span-2' : undefined}
          />
        ))}
      </div>
    </Container>
  )
}
