import { describe, expect, it } from 'vitest'
import { isRtlLocale, applyDocumentDirection } from './rtl'

describe('isRtlLocale', () => {
  it('flags Arabic as RTL', () => {
    expect(isRtlLocale('ar')).toBe(true)
  })

  it('flags English, Telugu, Hindi as LTR', () => {
    expect(isRtlLocale('en')).toBe(false)
    expect(isRtlLocale('te')).toBe(false)
    expect(isRtlLocale('hi')).toBe(false)
  })
})

describe('applyDocumentDirection', () => {
  it('sets dir=rtl and lang for Arabic', () => {
    applyDocumentDirection('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
  })

  it('sets dir=ltr for a non-RTL locale', () => {
    applyDocumentDirection('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
  })
})
