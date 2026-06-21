import { render, screen } from '@testing-library/react';
import App from './App';

test('pokazuje stronę startową PlanYourFit', () => {
  render(<App />);
  expect(screen.getAllByText(/PlanYour/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Plan treningowy/i)).toBeInTheDocument();
});
