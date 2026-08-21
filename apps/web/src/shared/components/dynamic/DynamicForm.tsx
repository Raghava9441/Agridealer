import { useForm, type FieldValues, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useContent } from '@/cms/useContent'
import { Input } from '../ui/Input'
import { DateInput } from '../ui/DateInput'
import { Button } from '../ui/Button'

export type FieldType = 'text' | 'email' | 'number' | 'password' | 'select' | 'checkbox' | 'date' | 'textarea'

/**
 * RHF gives an untouched text input's value as `''`, never `undefined` — but
 * Zod's `.optional()` only treats `undefined` as "not provided." Without
 * this, every optional string field (email, GSTIN, ...) left blank fails
 * validation as an empty/invalid value instead of being skipped. Found via
 * manual browser verification of the Customers "Add customer" form.
 */
function emptyStringToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value
}

export interface FieldOption {
  value: string
  labelKey: string
}

export interface FieldConfig<TValues extends FieldValues> {
  name: Path<TValues>
  labelKey: string
  type: FieldType
  placeholderKey?: string
  options?: FieldOption[]
  /** Conditional fields — omit to always show. Not a field ARRAY renderer (repeating field groups); see the note below. */
  showIf?: (values: TValues) => boolean
}

export interface DynamicFormProps<TSchema extends z.ZodType<FieldValues>> {
  schema: TSchema
  fields: FieldConfig<z.infer<TSchema>>[]
  defaultValues?: Partial<z.infer<TSchema>>
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>
  submitLabelKey?: string
  isSubmitting?: boolean
}

/**
 * Zod schema + field config → a rendered, validated form — every module
 * built on this renders forms the same way instead of hand-wiring
 * `register()` per field. Conditional fields (`showIf`) are supported;
 * repeating field-array groups (react-hook-form's `useFieldArray`) are not
 * — no module built so far needs one, and a generic "array of dynamic
 * field groups" renderer is enough extra complexity to warrant waiting for
 * a real use case rather than guessing at the shape now.
 */
export function DynamicForm<TSchema extends z.ZodType<FieldValues>>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitLabelKey = 'common.save',
  isSubmitting,
}: DynamicFormProps<TSchema>) {
  const content = useContent()
  type TValues = z.infer<TSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as never,
  })

  const values = watch()
  const submitting = isSubmitting ?? formSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {fields.map((field) => {
        if (field.showIf && !field.showIf(values)) return null
        const error = errors[field.name]?.message as string | undefined
        const fieldId = String(field.name)

        return (
          <div key={fieldId}>
            <label htmlFor={fieldId} className="mb-1 block text-sm">
              {content.get(field.labelKey)}
            </label>

            {field.type === 'select' && (
              <select
                id={fieldId}
                className="h-11 w-full rounded border border-muted bg-surface px-3 text-base outline-none focus:ring-2 focus:ring-brand"
                {...register(field.name, { setValueAs: emptyStringToUndefined })}
              >
                <option value="">{content.get('common.selectPlaceholder')}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {content.get(opt.labelKey)}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && <input id={fieldId} type="checkbox" {...register(field.name)} />}

            {field.type === 'textarea' && (
              <textarea
                id={fieldId}
                className="w-full rounded border border-muted bg-surface px-3 py-2 text-base outline-none focus:ring-2 focus:ring-brand"
                placeholder={field.placeholderKey ? content.get(field.placeholderKey) : undefined}
                {...register(field.name, { setValueAs: emptyStringToUndefined })}
              />
            )}

            {field.type === 'date' && (
              <DateInput id={fieldId} {...register(field.name, { setValueAs: emptyStringToUndefined })} />
            )}

            {['text', 'email', 'number', 'password'].includes(field.type) && (
              <Input
                id={fieldId}
                type={field.type}
                placeholder={field.placeholderKey ? content.get(field.placeholderKey) : undefined}
                {...register(
                  field.name,
                  field.type === 'number' ? { valueAsNumber: true } : { setValueAs: emptyStringToUndefined },
                )}
              />
            )}

            {error && <p className="mt-1 text-sm text-danger">{error}</p>}
          </div>
        )
      })}

      <Button type="submit" disabled={submitting}>
        {submitting ? content.get('common.saving') : content.get(submitLabelKey)}
      </Button>
    </form>
  )
}
