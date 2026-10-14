import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: ${theme.color.background};
    color: ${theme.color.text};
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.5;
  }

  :focus-visible {
    outline: 3px solid ${theme.color.accent};
    outline-offset: 2px;
  }
`
