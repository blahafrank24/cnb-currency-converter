import styled from 'styled-components'
import { ConverterForm } from './components/ConverterForm'
import { RatesTable } from './components/RatesTable'
import { GlobalStyle } from './styles/GlobalStyle'
import { theme } from './styles/theme'

const Page = styled.main`
  max-width: ${theme.maxWidth};
  margin: 0 auto;
  padding: ${theme.space(6)} ${theme.space(4)};
  display: grid;
  gap: ${theme.space(6)};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
`

export function App() {
  return (
    <>
      <GlobalStyle />
      <Page>
        <Title>CNB currency converter</Title>
        <ConverterForm />
        <RatesTable />
      </Page>
    </>
  )
}
