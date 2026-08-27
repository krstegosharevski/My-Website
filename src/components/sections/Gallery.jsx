import { useCallback, useEffect, useRef, useState } from 'react'

import { ImageWipe } from '@/components/motion/ImageWipe'
import { cn } from '@/lib/cn'

/**
 * Full-screen image viewer.
 *
 * Focus moves into the dialog on open and returns to the thumbnail that opened
 * it on close. Tab cycles inside, Escape closes, and the arrow keys move
 * between images. The backdrop is a plain surface, not a blur.
 *
 * @param {object} props
 * @param {import('@/content/types').ProjectImage[]} props.images
 * @param {number} props.index Currently shown image.
 * @param {(next: number) => void} props.onIndexChange
 * @param {() => void} props.onClose
 * @returns {JSX.Element}
 */
function Lightbox({ images, index, onIndexChange, onClose }) {
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const image = images[index]

  /* Mount-only: capture the triggering element, lock the body, focus the
     dialog, and undo all three on unmount. Deliberately not re-run when
     `index` changes — the fix for a real bug where sharing this with the
     keydown effect below yanked focus to the Close button after every arrow
     key press or Previous/Next click, because the whole effect (focus capture
     included) was re-running on every navigation. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const first = dialog.querySelector('button:not([disabled])')
    first?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  /* Re-subscribed on every navigation so the handler always closes over the
     current index, but this never touches focus or the body lock. */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const focusable = () =>
      Array.from(dialog.querySelectorAll('button:not([disabled])'))

    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onIndexChange((index + 1) % images.length)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onIndexChange((index - 1 + images.length) % images.length)
        return
      }

      if (event.key !== 'Tab') return

      const items = focusable()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [images.length, index, onClose, onIndexChange])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-surface"
    >
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <p className="mono-label">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 items-center justify-center rounded-(--radius-base) border border-hairline text-secondary transition-colors duration-(--duration-hover) hover:border-signal hover:text-primary"
        >
          <span className="sr-only">Close the image viewer</span>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          decoding="async"
          className="max-h-full w-auto max-w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-hairline px-6 py-4">
        <button
          type="button"
          onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
          className="mono-label transition-colors duration-(--duration-hover) hover:text-primary"
        >
          Previous
        </button>
        <p className="prose-measure text-center text-sm text-secondary">
          {image.caption}
        </p>
        <button
          type="button"
          onClick={() => onIndexChange((index + 1) % images.length)}
          className="mono-label transition-colors duration-(--duration-hover) hover:text-primary"
        >
          Next
        </button>
      </div>
    </div>
  )
}

/**
 * Case-study image gallery.
 *
 * The rhythm alternates: the first image runs full width, the next two sit
 * two-up, and the pattern repeats. Every thumbnail opens the lightbox.
 *
 * @param {object} props
 * @param {import('@/content/types').ProjectImage[]} props.images
 * @returns {JSX.Element | null}
 */
export function Gallery({ images }) {
  const [openAt, setOpenAt] = useState(/** @type {number | null} */ (null))
  const close = useCallback(() => setOpenAt(null), [])

  if (images.length === 0) return null

  return (
    <>
      <ul className="grid gap-8 md:grid-cols-2">
        {images.map((image, i) => (
          <li
            key={image.src}
            /* Full width, then two-up, repeating. */
            className={cn(i % 3 === 0 && 'md:col-span-2')}
          >
            <figure>
              <button
                type="button"
                onClick={() => setOpenAt(i)}
                className="group block w-full cursor-zoom-in"
              >
                <span className="sr-only">Open image {i + 1} full screen</span>
                <ImageWipe
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="rounded-(--radius-base) border border-hairline"
                  imgClassName="transition-transform duration-700 ease-(--ease-out-quart) group-hover:scale-[1.03]"
                />
              </button>
              <figcaption className="mt-3 text-sm text-secondary">
                {image.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {openAt !== null ? (
        <Lightbox
          images={images}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={close}
        />
      ) : null}
    </>
  )
}
