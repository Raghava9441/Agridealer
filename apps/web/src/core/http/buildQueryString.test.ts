import { describe, expect, it } from 'vitest'
import { buildQueryString } from './buildQueryString'

describe('buildQueryString', () => {
  it('returns an empty string when every value is undefined', () => {
    expect(buildQueryString({ search: undefined, status: undefined })).toBe('')
  })

  it('drops undefined keys but keeps everything else, URL-encoded', () => {
    expect(buildQueryString({ search: 'urea 50kg', status: undefined, page: 2 })).toBe('?search=urea+50kg&page=2')
  })

  it('stringifies booleans and numbers', () => {
    expect(buildQueryString({ active: true, limit: 25 })).toBe('?active=true&limit=25')
  })
})
