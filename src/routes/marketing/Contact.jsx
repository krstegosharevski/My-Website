import { useId, useRef, useState } from 'react'

import { MaskedLines } from '@/components/motion/MaskedLines'
import { Button } from '@/components/primitives/Button'
import { Container } from '@/components/primitives/Container'
import {
  CONTACT_HEADING,
  CONTACT_LEAD,
  ERRORS,
  FIELDS,
  NO_KEY_NOTICE,
  PROJECT_TYPES,
  SEND_FAILED,
  SUBMIT_LABEL,
  SUBMITTING_LABEL,
  SUCCESS,
} from '@/content/contact'
import { Seo } from '@/components/site/Seo'
import { EMAIL } from '@/content/site'
import { cn } from '@/lib/cn'

const ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * The Web3Forms access key.
 *
 * This one is designed to be public — it only identifies which inbox a
 * submission goes to. It is the only kind of key that may live in a `VITE_`
 * variable, because Vite compiles every one of them into the bundle visitors
 * download. Nothing else secret goes here.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

const EMPTY = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  message: '',
  botcheck: '',
}

/**
 * Validate one field.
 *
 * @param {keyof typeof EMPTY} field
 * @param {string} value
 * @returns {string} An error message, or an empty string when valid.
 */
function validateField(field, value) {
  const trimmed = value.trim()

  if (field === 'name') {
    return trimmed ? '' : ERRORS.nameRequired
  }

  if (field === 'email') {
    if (!trimmed) return ERRORS.emailRequired
    /* Deliberately loose. The only way to know an address works is to send to
       it, so this catches typos rather than trying to prove validity. */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : ERRORS.emailInvalid
  }

  if (field === 'message') {
    if (!trimmed) return ERRORS.messageRequired
    return trimmed.length < 20 ? ERRORS.messageShort : ''
  }

  return ''
}

/**
 * @param {typeof EMPTY} values
 * @returns {Record<string, string>} Only the fields that have an error.
 */
function validateAll(values) {
  /** @type {Record<string, string>} */
  const found = {}
  for (const field of ['name', 'email', 'message']) {
    const error = validateField(field, values[field])
    if (error) found[field] = error
  }
  return found
}

/**
 * A copy of `record` without `key`.
 *
 * @param {Record<string, string>} record
 * @param {string} key
 * @returns {Record<string, string>}
 */
function omit(record, key) {
  const next = { ...record }
  delete next[key]
  return next
}

/**
 * Build a `mailto:` fallback carrying whatever has been typed so far.
 *
 * @param {typeof EMPTY} values
 * @returns {string}
 */
function mailtoHref(values) {
  const subject = values.projectType
    ? `${values.projectType} project`
    : 'Project enquiry'

  const body = [
    values.name && `Name: ${values.name}`,
    values.company && `Company: ${values.company}`,
    values.projectType && `Project type: ${values.projectType}`,
    '',
    values.message,
  ]
    .filter((line) => line !== false && line !== undefined)
    .join('\n')

  return `mailto:${EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
}

/**
 * A labelled control: mono label above a hairline-bottom-bordered input.
 *
 * The error is tied to the control with `aria-describedby` and the control is
 * marked `aria-invalid`, so a screen reader gets the message when focus lands
 * on the field, not only when the live region announces it.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {React.ReactNode} props.children Render prop receives control props.
 * @returns {JSX.Element}
 */
function Field({ id, label, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label block">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-link">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/* No outline-none here: the global :focus-visible rule in globals.css is the
   signal-blue keyboard ring every interactive element gets, and it is not
   overridden. The border-bottom colour change on focus is an additional
   affordance, not a replacement for it. */
const CONTROL_CLASSES =
  'mt-3 w-full border-0 border-b bg-transparent pb-2 text-body transition-colors duration-(--duration-hover) placeholder:text-secondary focus:border-signal'

/**
 * Contact form.
 *
 * Validation runs on blur, and again for everything on submit. Submitting posts
 * to Web3Forms; if no access key is configured the form degrades to a `mailto:`
 * link carrying what has been typed, rather than breaking.
 *
 * @returns {JSX.Element}
 */
export function Contact() {
  const baseId = useId()
  const formRef = useRef(/** @type {HTMLFormElement | null} */ (null))

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [status, setStatus] = useState(
    /** @type {'idle' | 'submitting' | 'success' | 'error'} */ ('idle'),
  )

  const fieldId = (field) => `${baseId}-${field}`

  /** @param {keyof typeof EMPTY} field */
  const onChange = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))
    /* Clear an error as soon as the field becomes valid — correcting a mistake
       should not require blurring again to see it accepted. */
    setErrors((current) => {
      if (!current[field]) return current
      if (validateField(field, value)) return current
      return omit(current, field)
    })
  }

  /** @param {keyof typeof EMPTY} field */
  const onBlur = (field) => (event) => {
    const error = validateField(field, event.target.value)
    setErrors((current) =>
      error ? { ...current, [field]: error } : omit(current, field),
    )
  }

  /** @param {React.FormEvent<HTMLFormElement>} event */
  async function onSubmit(event) {
    event.preventDefault()

    /* Honeypot. A real person never sees this field, so anything in it is a
       bot. Report success rather than an error so it learns nothing. */
    if (values.botcheck) {
      setStatus('success')
      return
    }

    const found = validateAll(values)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      const first = ['name', 'email', 'message'].find((field) => found[field])
      formRef.current?.querySelector(`#${CSS.escape(fieldId(first))}`)?.focus()
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `${values.projectType || 'Project'} enquiry from ${values.name}`,
          name: values.name,
          email: values.email,
          company: values.company,
          project_type: values.projectType,
          message: values.message,
        }),
      })

      if (!response.ok) throw new Error(`Web3Forms responded ${response.status}`)

      setStatus('success')
      setValues(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Container className="py-section">
        <Seo
          title="Message sent — Krtse XO"
          description="Your message has been sent."
          path="/contact"
          noindex
        />
        <div className="prose-measure" role="status">
          <h1 className="text-display-l">{SUCCESS.heading}</h1>
          <p className="mt-6 text-lead text-secondary">{SUCCESS.body}</p>
          <Button to="/websites" variant="outline" className="mt-10">
            See the work
          </Button>
        </div>
      </Container>
    )
  }

  const errorCount = Object.keys(errors).length

  return (
    <Container className="py-section">
      <Seo
        title="Contact — Krtse XO"
        description="Get in touch about a website, portal or integration project."
        path="/contact"
      />
      <MaskedLines
        as="h1"
        text={CONTACT_HEADING}
        className="prose-measure text-display-xl"
      />
      <p className="prose-measure mt-8 text-lead text-secondary">
        {CONTACT_LEAD}
      </p>

      {!ACCESS_KEY ? (
        <p className="prose-measure mt-8 rounded-(--radius-base) border border-hairline p-4 text-sm text-secondary">
          {NO_KEY_NOTICE}
        </p>
      ) : null}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mt-16 max-w-2xl"
      >
        {/* Announced when validation fails, so a screen-reader user is not left
            wondering why submitting did nothing. */}
        <p aria-live="polite" className="sr-only">
          {errorCount > 0
            ? `${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention.`
            : ''}
        </p>

        <div className="flex flex-col gap-10">
          <Field
            id={fieldId('name')}
            label={FIELDS.name.label}
            error={errors.name}
            required
          >
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={onChange('name')}
              onBlur={onBlur('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${fieldId('name')}-error` : undefined}
              className={cn(
                CONTROL_CLASSES,
                errors.name ? 'border-signal' : 'border-[color:var(--surface-hairline)]',
              )}
            />
          </Field>

          <Field
            id={fieldId('email')}
            label={FIELDS.email.label}
            error={errors.email}
            required
          >
            <input
              id={fieldId('email')}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={onChange('email')}
              onBlur={onBlur('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${fieldId('email')}-error` : undefined}
              className={cn(
                CONTROL_CLASSES,
                errors.email ? 'border-signal' : 'border-[color:var(--surface-hairline)]',
              )}
            />
          </Field>

          <Field id={fieldId('company')} label={FIELDS.company.label}>
            <input
              id={fieldId('company')}
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={FIELDS.company.placeholder}
              value={values.company}
              onChange={onChange('company')}
              className={cn(CONTROL_CLASSES, 'border-[color:var(--surface-hairline)]')}
            />
          </Field>

          <Field id={fieldId('projectType')} label={FIELDS.projectType.label}>
            <select
              id={fieldId('projectType')}
              name="projectType"
              value={values.projectType}
              onChange={onChange('projectType')}
              className={cn(
                CONTROL_CLASSES,
                'border-[color:var(--surface-hairline)] appearance-none',
              )}
            >
              <option value="">{FIELDS.projectType.placeholder}</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id={fieldId('message')}
            label={FIELDS.message.label}
            error={errors.message}
            required
          >
            <textarea
              id={fieldId('message')}
              name="message"
              rows={6}
              value={values.message}
              onChange={onChange('message')}
              onBlur={onBlur('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? `${fieldId('message')}-error` : undefined
              }
              className={cn(
                CONTROL_CLASSES,
                'resize-y',
                errors.message
                  ? 'border-signal'
                  : 'border-[color:var(--surface-hairline)]',
              )}
            />
          </Field>
        </div>

        {/* Honeypot. Hidden from sight, from the tab order and from the a11y
            tree, so only a bot fills it in. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={fieldId('botcheck')}>Leave this field empty</label>
          <input
            id={fieldId('botcheck')}
            name="botcheck"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.botcheck}
            onChange={onChange('botcheck')}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          {ACCESS_KEY ? (
            <Button
              type="submit"
              variant="signal"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? SUBMITTING_LABEL : SUBMIT_LABEL}
            </Button>
          ) : (
            <Button href={mailtoHref(values)} variant="signal">
              {SUBMIT_LABEL}
            </Button>
          )}

          <p aria-live="polite" className="text-sm text-secondary">
            {status === 'submitting' ? 'Sending your message.' : ''}
            {status === 'error' ? (
              <>
                {SEND_FAILED}{' '}
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-link underline underline-offset-4"
                >
                  {EMAIL}
                </a>
                .
              </>
            ) : null}
          </p>
        </div>
      </form>
    </Container>
  )
}
