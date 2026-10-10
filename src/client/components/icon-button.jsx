import { forwardRef } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

/** Every icon action has the same visible tooltip and accessible name. */
export const IconButton = forwardRef(function IconButton({ label, portal = true, children, type = 'button', ...props }, ref) {
  return <Tooltip label={label} side="top" portal={portal}>
    <button {...props} type={type} ref={ref} aria-label={label}>{children}</button>
  </Tooltip>
})
