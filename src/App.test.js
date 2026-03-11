import { render, screen } from '@testing-library/react';
import PageTransition from './Components/PageTransition';

test('renders page transition children', () => {
  render(
    <PageTransition>
      <div>Quiz content</div>
    </PageTransition>
  );

  expect(screen.getByText('Quiz content')).toBeInTheDocument();
});
