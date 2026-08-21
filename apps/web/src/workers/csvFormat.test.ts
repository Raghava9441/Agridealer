import { describe, expect, it } from 'vitest'
import { escapeCsvCell, toCsv } from './csvFormat'

describe('escapeCsvCell', () => {
  it('passes plain values through unchanged', () => {
    expect(escapeCsvCell('hello')).toBe('hello')
    expect(escapeCsvCell(42)).toBe('42')
  })

  it('renders null/undefined as an empty string', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
  })

  it('quotes and escapes values containing commas, quotes, or newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('toCsv', () => {
  it('builds a header row followed by one row per record', () => {
    const csv = toCsv({
      columns: ['name', 'phone'],
      rows: [
        { name: 'Ravi Kumar', phone: '9999900001' },
        { name: 'Priya, Devi', phone: '9999900002' },
      ],
    })
    expect(csv).toBe('name,phone\nRavi Kumar,9999900001\n"Priya, Devi",9999900002')
  })

  it('handles an empty row set (header only)', () => {
    expect(toCsv({ columns: ['a', 'b'], rows: [] })).toBe('a,b\n')
  })
})
