import { Link } from 'react-router-dom'

import { ImageWipe } from '@/components/motion/ImageWipe'
import { Chip } from '@/components/primitives/Chip'
import { cn } from '@/lib/cn'

/**
 * A case-study card. Built here for the home page; the work index imports it.
 *
 * The whole card is one link, so there is a single tab stop and a single focus
 * ring rather than one per element inside it. The cover arrives with the wipe
 * from §3.5.6 and lifts 1.03 on hover.
 *
 * `headingLevel` exists because this card sits in two different places in the
 * heading order: on the home page it follows SelectedWork's own h2, so the
 * card title is an h3; on the work index there is no section h2 above the
 * grid, so the card title has to be an h2 itself or the page would skip a
 * level (h1 straight to h3). Pass the level the surrounding page actually
 * needs rather than hard-coding one.
 *
 * @param {object} props
 * @param {import('@/content/types').Project} props.project
 * @param {boolean} [props.featured=false] Wider layout for a full-width slot.
 * @param {boolean} [props.priority=false] Load the cover eagerly.
 * @param {number} [props.index=0] Position, for the reveal stagger.
 * @param {'h2' | 'h3'} [props.headingLevel='h3']
 * @param {string} [props.className] Extra classes.
 * @returns {JSX.Element}
 */
export function ProjectCard({
  project,
  featured = false,
  priority = false,
  index = 0,
  headingLevel = 'h3',
  className,
}) {
  const Heading = headingLevel
  return (
    <article className={className}>
      <Link to={`/websites/${project.slug}`} className="group block">
        <ImageWipe
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          priority={priority}
          delay={index * 0.06}
          className="rounded-(--radius-base) border border-hairline"
          imgClassName="transition-transform duration-700 ease-(--ease-out-quart) group-hover:scale-[1.03]"
        />

        <div className={cn('mt-6', featured && 'md:max-w-2xl')}>
          <p className="mono-label">
            {project.type} · {project.client} · {project.year}
          </p>

          <Heading
            className={cn(
              'mt-3 font-display font-normal',
              featured ? 'text-display-l' : 'text-title',
            )}
          >
            {project.title}
          </Heading>

          <p className="prose-measure mt-3 text-secondary">{project.summary}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tool) => (
              <li key={tool}>
                <Chip>{tool}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  )
}
