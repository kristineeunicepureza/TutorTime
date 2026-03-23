import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TutorTime login screen', () => {
  render(<App />);
  expect(screen.getByText(/TutorTime/i)).toBeInTheDocument();
});
