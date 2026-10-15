import styled from 'styled-components'
import { useRates } from '../hooks/useRates'
import { theme } from '../styles/theme'

const rateFormat = new Intl.NumberFormat('en', { minimumFractionDigits: 3 })
const syncedFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })

const Status = styled.p`
  margin: 0;
  color: ${theme.color.muted};
`

const ErrorBox = styled.div`
  padding: ${theme.space(4)};
  color: ${theme.color.danger};
  background: ${theme.color.dangerBackground};
  border: 1px solid ${theme.color.danger};
  border-radius: ${theme.radius};

  p {
    margin: 0 0 ${theme.space(3)};
  }
`

const RetryButton = styled.button`
  padding: ${theme.space(2)} ${theme.space(4)};
  font: inherit;
  color: ${theme.color.accentText};
  background: ${theme.color.accent};
  border: 0;
  border-radius: ${theme.radius};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`

const Card = styled.section`
  background: ${theme.color.surface};
  border: 1px solid ${theme.color.border};
  border-radius: ${theme.radius};
  overflow: hidden;
`

// The heading sits outside the scrolling box, so on a phone the date stays visible while the table scrolls.
const Header = styled.div`
  padding: ${theme.space(3)} ${theme.space(4)};

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: ${theme.color.muted};
  }
`

const Scroll = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;

  th,
  td {
    padding: ${theme.space(2)} ${theme.space(4)};
    text-align: left;
    white-space: nowrap;
    border-top: 1px solid ${theme.color.border};
  }

  thead th {
    color: ${theme.color.muted};
    font-size: 0.875rem;
  }

  th[scope='row'] {
    font-weight: 400;
  }

  td:nth-child(3),
  td:last-child,
  thead th:nth-child(3),
  thead th:last-child {
    text-align: right;
  }
`

export function RatesTable() {
  const { data, error, isPending, isFetching, refetch } = useRates()

  if (isPending) {
    return <Status role="status">Loading exchange rates…</Status>
  }

  if (error) {
    return (
      <ErrorBox role="alert">
        <p>Could not load exchange rates: {error.message}</p>
        <RetryButton type="button" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? 'Retrying…' : 'Try again'}
        </RetryButton>
      </ErrorBox>
    )
  }

  return (
    <Card>
      <Header>
        <h2 id="rates-heading">Czech National Bank exchange rates, {data.date}</h2>
        <p>Synced {syncedFormat.format(new Date(__BUILD_TIME__))}</p>
      </Header>
      <Scroll>
        <Table aria-labelledby="rates-heading">
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
        </Table>
      </Scroll>
    </Card>
  )
}
