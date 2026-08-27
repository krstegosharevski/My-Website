import { Link, Navigate, useParams } from 'react-router-dom'

import { ImageWipe } from '@/components/motion/ImageWipe'
import { MaskedLines } from '@/components/motion/MaskedLines'
import { Reveal } from '@/components/motion/Reveal'
import { Chip } from '@/components/primitives/Chip'
import { Container } from '@/components/primitives/Container'
import { Stat } from '@/components/primitives/Stat'
import { Gallery } from '@/components/sections/Gallery'
import { Seo } from '@/components/site/Seo'
import { getProject, PROJECTS } from '@/content/projects'
import { absoluteUrl } from '@/lib/seo'

/**
 * One prose section of the case study, capped at the 70ch measure.
 *
 * @param {object} props
 * @param {string} props.label Mono heading.
 * @param {string} props.body
 * @param {number} props.index For the reveal stagger.
 * @returns {JSX.Element}
 */
function Passage({ label, body, index }) {
  return (
    <Reveal as="section" index={index}>
      <h2 className="mono-label">{label}</h2>
      <p className="prose-measure mt-4">{body}</p>
    </Reveal>
  )
}

/**
 * Case study.
 *
 * An unknown slug renders the 404 route rather than a blank page — `replace`
 * so the bad URL does not sit in the history for Back to land on again.
 *
 * @returns {JSX.Element}
 */
export function WebsiteDetail() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <Navigate to="/404" replace />

  const position = PROJECTS.findIndex((entry) => entry.slug === project.slug)
  const previous = PROJECTS[position - 1] ?? null
  const next = PROJECTS[position + 1] ?? null

  return (
    <article>
      <Seo
        title={`${project.title} — Krtse XO`}
        description={project.description}
        path={`/websites/${project.slug}`}
        image={absoluteUrl(project.cover.src)}
        type="article"
      />
      <Container className="pt-section pb-16">
        <p className="mono-label">
          {project.type} · {project.client} · {project.year}
        </p>

        <MaskedLines
          as="h1"
          text={project.title}
          className="mt-6 prose-measure text-display-xl"
        />

        <Reveal delay={0.2}>
          <p className="prose-measure mt-8 text-lead text-secondary">
            {project.summary}
          </p>
        </Reveal>

        <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tool) => (
              <li key={tool}>
                <Chip>{tool}</Chip>
              </li>
            ))}
          </ul>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-link underline underline-offset-4 decoration-1"
            >
              Visit the live site
            </a>
          ) : null}
        </Reveal>
      </Container>

      <Container>
        {/* Above the fold, so this one loads eagerly. */}
        <ImageWipe
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          priority
          className="rounded-(--radius-base) border border-hairline"
        />
      </Container>

      <Container className="py-section">
        <div className="flex flex-col gap-14">
          <Passage index={0} label="Context" body={project.sections.context} />
          <Passage index={1} label="Problem" body={project.sections.problem} />
          <Passage index={2} label="Approach" body={project.sections.approach} />
        </div>
      </Container>

      <Container className="pb-section">
        <Gallery images={project.images} />
      </Container>

      <Container className="pb-section">
        <h2 className="mono-label">Result</h2>
        <p className="prose-measure mt-4">{project.sections.result}</p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {project.stats.map((stat, i) => (
            <Reveal key={stat.label} index={i}>
              <Stat label={stat.label} value={stat.value} note={stat.note} />
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="border-t border-hairline py-16">
        <nav aria-label="Other case studies" className="flex justify-between gap-8">
          {previous ? (
            <Link to={`/websites/${previous.slug}`} className="group max-w-xs">
              <span className="mono-label">Previous</span>
              <span className="mt-2 block font-display text-title transition-colors duration-(--duration-hover) group-hover:text-link">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              to={`/websites/${next.slug}`}
              className="group max-w-xs text-right"
            >
              <span className="mono-label">Next</span>
              <span className="mt-2 block font-display text-title transition-colors duration-(--duration-hover) group-hover:text-link">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Container>
    </article>
  )
}
