import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App component', () => {
  it('deve renderizar o título Vite + React', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument()
  })

  it('deve começar com o contador zerado', () => {
    render(<App />)
    expect(screen.getByText(/count is 0/i)).toBeInTheDocument()
  })
})
