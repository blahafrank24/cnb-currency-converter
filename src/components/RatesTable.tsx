import { useRates } from '../hooks/useRates'

const rateFormat = new Intl.NumberFormat('en', { minimumFractionDigits: 3 })

export function RatesTable() {
  const { data, error, isPending, isFetching, refetch } = useRates()

  if (isPending) {
    return <p role="status">Loading exchange rates…</p>
  }

  if (error) {
    return (
      <div role="alert">
        <p>Could not load exchange rates: {error.message}</p>
        <button type="button" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    )
  }

  return (
    <table>
      <caption>Czech National Bank exchange rates, {data.date}</caption>
      <thead>
        <tr>
          <th scope="col">Country</th>
          <th scope="col">Currency</th>
          <th scope="col">Amount</th>
          <th scope="col">Code</th>
          <th scope="col">Rate (CZK)</th>
        </tr>
      </thead>
      <tbody>
        {data.rates.map((rate) => (
          <tr key={rate.code}>
            <th scope="row">{rate.country}</th>
            <td>{rate.currency}</td>
            <td>{rate.amount}</td>
            <td>{rate.code}</td>
            <td>{rateFormat.format(rate.rate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
