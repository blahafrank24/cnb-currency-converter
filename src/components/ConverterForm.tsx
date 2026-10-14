import { useState } from 'react'
import { useRates } from '../hooks/useRates'
import { convertFromCzk } from '../domain/convert'
import { parseAmount } from '../domain/parseAmount'

const inputFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 20 })
const resultFormat = new Intl.NumberFormat('en', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function ConverterForm() {
  const { data } = useRates()
  const [amountText, setAmountText] = useState('1000')
  const [code, setCode] = useState('EUR')

  // RatesTable already shows the loading and error states.
  if (!data) return null

  const rate = data.rates.find((r) => r.code === code) ?? data.rates[0]
  if (!rate) return null

  const amount = parseAmount(amountText)
  const result =
    amount !== null && amount > 0
      ? `${inputFormat.format(amount)} CZK = ${resultFormat.format(convertFromCzk(amount, rate))} ${rate.code}`
      : 'Enter an amount in CZK greater than zero, for example 1 500,50.'

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <label>
        Amount in CZK
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value)}
        />
      </label>
      <label>
        Convert to
        <select value={rate.code} onChange={(event) => setCode(event.target.value)}>
          {data.rates.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} – {r.country} {r.currency}
            </option>
          ))}
        </select>
      </label>
      <p aria-live="polite">{result}</p>
    </form>
  )
}
