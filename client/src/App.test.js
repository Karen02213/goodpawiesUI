import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GoodPawies in document', () => {
  render(<App />);
  // Check for the brand name in the navbar or somewhere on the landing page
  // Being flexible with regex to match "GoodPawies"
  const linkElement = screen.getAllByText(/GoodPawies/i)[0];
  expect(linkElement).toBeInTheDocument();
});
