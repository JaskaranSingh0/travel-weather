import { render, screen } from '@testing-library/react';
import App from './App';

test('renders travel weather heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/travel weather/i);
  expect(headingElement).toBeInTheDocument();
});
