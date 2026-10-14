import { describe, expect, it } from 'vitest'
import { parseAmount } from './parseAmount'

describe('parseAmount', () => {
  it.each([
    ['1500', 1500],
    ['1500.50', 1500.5],
    ['1500,50', 1500.5],
    ['1 500,50', 1500.5],
    ['1 500.50', 1500.5],
    ['1 500,50', 1500.5],
    ['  42  ', 42],
    ['0', 0],
    ['0,5', 0.5],
    ['1500,', 1500],
  ])('reads "%s" as %d', (text, expected) => {
    expect(parseAmount(text)).toBe(expected)
  })

  it.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['letters', 'abc'],
    ['mixed text', '12abc'],
    ['negative', '-5'],
    ['thousands dot and decimal comma', '1.500,50'],
    ['two decimal separators', '1,5,5'],
    ['exponent', '1e5'],
    ['leading decimal separator', ',5'],
    ['a sign', '+5'],
  ])('rejects %s', (_name, text) => {
    expect(parseAmount(text)).toBeNull()
  })
})
