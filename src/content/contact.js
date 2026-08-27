/**
 * Contact page copy, including every validation message.
 *
 * Errors say what went wrong and how to fix it, and do not apologise. They are
 * written here rather than in the component so the whole voice of the form can
 * be read in one place.
 */

export const CONTACT_HEADING = 'Tell me about the project'

export const CONTACT_LEAD =
  'A few sentences is enough to start. I read everything myself and reply within two working days.'

/** Options for the project type select. Mirrors the ProjectType union. */
export const PROJECT_TYPES = [
  'Website',
  'Portal',
  'Shop',
  'Integration',
  'App',
  'Not sure yet',
]

export const FIELDS = {
  name: { label: 'Your name', placeholder: '' },
  email: { label: 'Email', placeholder: '' },
  company: { label: 'Company', placeholder: 'Optional' },
  projectType: { label: 'Project type', placeholder: 'Select one' },
  message: { label: 'What are you building?', placeholder: '' },
}

export const ERRORS = {
  nameRequired: 'Enter your name, so I know who I am replying to.',
  emailRequired: 'Enter an email address so I can reply.',
  emailInvalid: 'That address is missing an @ or a domain. Check it and try again.',
  messageRequired: 'Write a few sentences about the project.',
  messageShort: 'A little more detail would help — a couple of sentences is enough.',
}

export const SUBMIT_LABEL = 'Send message'
export const SUBMITTING_LABEL = 'Sending'

export const SUCCESS = {
  heading: 'Message sent',
  body: 'It is in my inbox. I reply within two working days, usually sooner. If you do not hear back, email me directly — the address is in the footer.',
}

export const SEND_FAILED =
  'The message did not send. Check your connection and try again, or email me directly at'

/** Shown instead of the form when no Web3Forms key is configured. */
export const NO_KEY_NOTICE =
  'This form is not connected to a mail service yet. The button opens your email client with what you have written.'
