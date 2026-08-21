import { forwardRef, type InputHTMLAttributes } from 'react'
import { Input } from './Input'

/** Native `<input type="date">` — browser-localized picker, no dependency, fully accessible by default. */
export const DateInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <Input ref={ref} type="date" {...props} />
))
DateInput.displayName = 'DateInput'
