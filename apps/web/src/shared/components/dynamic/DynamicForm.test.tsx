import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { renderWithProviders } from '@/shared/testing/renderWithProviders'
import { DynamicForm, type FieldConfig } from './DynamicForm'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be an adult'),
})
type Values = z.infer<typeof schema>

const fields: FieldConfig<Values>[] = [
  { name: 'name', labelKey: 'customers.fields.name', type: 'text' },
  { name: 'age', labelKey: 'billing.fields.quantity', type: 'number' },
]

describe('DynamicForm', () => {
  it('shows Zod validation errors and does not call onSubmit for invalid input', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<DynamicForm schema={schema} fields={fields} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    // A left-blank text field is coerced to `undefined` (see emptyStringToUndefined in DynamicForm.tsx), which fails
    // Zod's base `z.string()` type check before it ever reaches the custom `.min(1, 'Name is required')` message —
    // "Required" is Zod's own required_error, which is the correct/expected message for "field left empty."
    await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with parsed values once the form is valid', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<DynamicForm schema={schema} fields={fields} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Ravi Kumar')
    await userEvent.type(screen.getByLabelText(/qty/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Ravi Kumar', age: 25 }, expect.anything()))
  })

  it('hides a field whose showIf predicate is false', () => {
    const conditionalFields: FieldConfig<Values>[] = [
      ...fields,
      { name: 'age', labelKey: 'billing.fields.discount', type: 'text', showIf: () => false },
    ]
    renderWithProviders(<DynamicForm schema={schema} fields={conditionalFields} onSubmit={vi.fn()} />)
    expect(screen.queryByLabelText(/discount/i)).not.toBeInTheDocument()
  })
})
