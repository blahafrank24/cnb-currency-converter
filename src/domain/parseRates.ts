import type { Rate, RatesSnapshot } from './types'

const DATE_LINE = /^(\d{1,2} [A-Za-z]{3} \d{4}) #\d+$/
const COLUMNS_LINE = 'Country|Currency|Amount|Code|Rate'
const POSITIVE_NUMBER = /^\d+(\.\d+)?$/

function parsePositive(text: string, field: string, line: string): number {
  // Number('') is 0 and Number(' ') is 0, so validate the text before converting.
  const value = POSITIVE_NUMBER.test(text) ? Number(text) : 0
  if (value <= 0) throw new Error(`Invalid ${field} "${text}" in row: ${line}`)
  return value
}

function parseRow(line: string): Rate {
  const fields = line.split('|')
  const [country, currency, amount, code, rate] = fields
  if (
    fields.length !== 5 ||
    !country ||
    !currency ||
    amount === undefined ||
    rate === undefined ||
    !code ||
    !/^[A-Z]{3}$/.test(code)
  ) {
    throw new Error(`Malformed rate row: ${line}`)
  }
  return {
    country,
    currency,
    // Rate is CZK per `amount` units (for example 100 JPY), not per 1 unit.
    amount: parsePositive(amount, 'amount', line),
    code,
    rate: parsePositive(rate, 'rate', line),
  }
}

export function parseRates(text: string): RatesSnapshot {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')

  const [dateLine, columnsLine, ...rows] = lines
  const date = dateLine?.match(DATE_LINE)?.[1]
  if (!date) throw new Error(`Unexpected first line: ${dateLine ?? '(empty file)'}`)
  if (columnsLine !== COLUMNS_LINE) {
    throw new Error(`Unexpected column header: ${columnsLine ?? '(missing)'}`)
  }
  if (rows.length === 0) throw new Error('The file contains no rates')

  return { date, rates: rows.map(parseRow) }
}
