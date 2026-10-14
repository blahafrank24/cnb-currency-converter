import { describe, expect, it } from 'vitest'
import { convertFromCzk } from './convert'
import type { Rate } from './types'

const usd: Rate = { country: 'USA', currency: 'dollar', amount: 1, code: 'USD', rate: 21.788 }
const jpy: Rate = { country: 'Japan', currency: 'yen', amount: 100, code: 'JPY', rate: 13.779 }
const idr: Rate = { country: 'Indonesia', currency: 'rupiah', amount: 1000, code: 'IDR', rate: 1.218 }

describe('convertFromCzk', () => {
  it('divides by the rate when the amount is 1', () => {
    expect(convertFromCzk(2178.8, usd)).toBeCloseTo(100, 10)
  })

  it('honours an Amount of 100: 13.779 CZK is 100 JPY, not 1', () => {
    expect(convertFromCzk(13.779, jpy)).toBeCloseTo(100, 10)
  })

  it('honours an Amount of 1000', () => {
    expect(convertFromCzk(1.218, idr)).toBeCloseTo(1000, 10)
  })

  it('returns 0 for 0 CZK', () => {
    expect(convertFromCzk(0, usd)).toBe(0)
  })

  it('does not round, so display code decides the decimals', () => {
    expect(convertFromCzk(100, usd)).toBeCloseTo(4.5896824, 7)
  })

  it('scales linearly with the amount', () => {
    expect(convertFromCzk(2000, usd)).toBeCloseTo(2 * convertFromCzk(1000, usd), 10)
  })
})
