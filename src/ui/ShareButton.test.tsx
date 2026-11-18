import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareButton from './ShareButton';
import { group } from '../domain/testUtils';

test('copies share link to clipboard', async () => {
  const user = userEvent.setup();
  render(<ShareButton group={group(['A', 'B'], [])} />);
  await user.click(screen.getByRole('button', { name: '分享' }));
  const text = await navigator.clipboard.readText();
  expect(text).toMatch(/#\/share\//);
  expect(screen.getByText('已複製連結')).toBeInTheDocument();
});
