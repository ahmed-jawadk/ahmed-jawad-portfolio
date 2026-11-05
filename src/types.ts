/** Payload used when any part of the page asks to open a project's detail view. */
export interface OpenProjectPayload {
  slug: string
  /** On-screen rect of the element that opened it — the detail view grows out of it. */
  origin: DOMRect | null
  /** Gets focus back when the detail view closes. */
  opener: HTMLElement | null
}
