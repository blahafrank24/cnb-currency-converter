import { ConverterForm } from './components/ConverterForm'
import { RatesTable } from './components/RatesTable'

export function App() {
  return (
    <main>
      <h1>CNB currency converter</h1>
      <ConverterForm />
      <RatesTable />
    </main>
  )
}
