import { render, screen } from '@testing-library/react';
import TileGrid from '../TileGrid';
import { it, expect } from 'vitest';

it('renders correct number of tiles at zoom-1', () => {
  const tiles = new Map([[1, Array(4).fill('mockUrl')]]);
  render(<TileGrid zoom={1} tiles={tiles} />);
  expect(screen.getAllByRole('img')).toHaveLength(4);
});
