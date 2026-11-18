import { render, screen } from '@testing-library/react';
import App from './主程式';

test('renders app title', () => {
  render(<App />);
  expect(screen.getByText('分帳')).toBeInTheDocument();
});
