import { useState } from 'react'
import styled from 'styled-components'
import { useRates } from '../hooks/useRates'
import { convertFromCzk } from '../domain/convert'
import { parseAmount } from '../domain/parseAmount'
import { theme } from '../styles/theme'

const Card = styled.form`
  display: grid;
  gap: ${theme.space(4)};
  padding: ${theme.space(5)};
  background: ${theme.color.surface};
  border: 1px solid ${theme.color.border};
  border-radius: ${theme.radius};
`

const Field = styled.label`
  display: grid;
  gap: ${theme.space(1)};
  font-weight: 600;

  input,
  select {
    width: 100%;
    padding: ${theme.space(3)};
    font: inherit;
    font-weight: 400;
    color: inherit;
    background: ${theme.color.surface};
    border: 1px solid ${theme.color.border};
    border-radius: ${theme.radius};
  }
`

const Result = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
`

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
    <Card onSubmit={(event) => event.preventDefault()}>
      <Field>
        Amount in CZK
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value)}
        />
      </Field>
      <Field>
        Convert to
        <select value={rate.code} onChange={(event) => setCode(event.target.value)}>
          {data.rates.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} – {r.country} {r.currency}
            </option>
          ))}
        </select>
      </Field>
      <Result aria-live="polite">{result}</Result>
    </Card>
  )
}
