import { describe, expect, it } from 'vitest'
import { parseRates } from './parseRates'

const SAMPLE = `13 Oct 2026 #197
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.203
Hungary|forint|100|HUF|6.690
Indonesia|rupiah|1000|IDR|1.218
Japan|yen|100|JPY|13.779
USA|dollar|1|USD|21.788
`

const withRow = (row: string) =>
  `13 Oct 2026 #197\nCountry|Currency|Amount|Code|Rate\n${row}\n`

describe('parseRates', () => {
  it('reads the date and every row of a real daily.txt', () => {
    const snapshot = parseRates(SAMPLE)

    expect(snapshot.date).toBe('13 Oct 2026')
    expect(snapshot.rates).toHaveLength(5)
    expect(snapshot.rates[0]).toEqual({
      country: 'Australia',
      currency: 'dollar',
      amount: 1,
      code: 'AUD',
      rate: 15.203,
    })
  })

  it('keeps the Amount column, which is not always 1', () => {
    const byCode = Object.fromEntries(
      parseRates(SAMPLE).rates.map((r) => [r.code, r.amount]),
    )

    expect(byCode).toMatchObject({ USD: 1, JPY: 100, HUF: 100, IDR: 1000 })
  })

  it('ignores blank lines, surrounding whitespace and CRLF line endings', () => {
    const messy = `\n  13 Oct 2026 #197  \r\n\r\nCountry|Currency|Amount|Code|Rate\r\n\r\nUSA|dollar|1|USD|21.788\r\n\r\n`

    expect(parseRates(messy).rates).toHaveLength(1)
  })

  it.each([
    ['empty file', ''],
    ['only blank lines', '\n\n  \n'],
    ['wrong first line', 'Rates for today\nCountry|Currency|Amount|Code|Rate\nUSA|dollar|1|USD|21.788'],
    ['wrong column header', '13 Oct 2026 #197\nCountry|Currency|Code|Rate\nUSA|dollar|1|USD|21.788'],
    ['header without rows', '13 Oct 2026 #197\nCountry|Currency|Amount|Code|Rate\n'],
  ])('rejects %s', (_name, text) => {
    expect(() => parseRates(text)).toThrow()
  })

  it.each([
    ['too few fields', 'USA|dollar|1|USD'],
    ['too many fields', 'USA|dollar|1|USD|21.788|x'],
    ['empty country', '|dollar|1|USD|21.788'],
    ['non-numeric rate', 'USA|dollar|1|USD|abc'],
    ['empty rate', 'USA|dollar|1|USD|'],
    ['zero rate', 'USA|dollar|1|USD|0'],
    ['negative rate', 'USA|dollar|1|USD|-21.788'],
    ['decimal comma', 'USA|dollar|1|USD|21,788'],
    ['zero amount', 'USA|dollar|0|USD|21.788'],
    ['non-numeric amount', 'USA|dollar|many|USD|21.788'],
    ['lowercase code', 'USA|dollar|1|usd|21.788'],
  ])('rejects a row with %s instead of producing NaN', (_name, row) => {
    expect(() => parseRates(withRow(row))).toThrow()
  })
})
