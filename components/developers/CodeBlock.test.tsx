import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CodeBlock from './CodeBlock';

describe('CodeBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the provided code and language label', () => {
    render(<CodeBlock code="curl example.com" language="curl" />);

    expect(screen.getByText('curl example.com')).toBeInTheDocument();
    expect(screen.getByText('curl')).toBeInTheDocument();
  });

  it('renders without a language label when none is provided', () => {
    render(<CodeBlock code="plain text" />);

    expect(screen.getByText('plain text')).toBeInTheDocument();
  });

  it('copies the code to the clipboard and shows a brief confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CodeBlock code="fetch('/api/v1/trains')" />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("fetch('/api/v1/trains')"));
    await waitFor(() => expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument());
  });

  it('does not throw when the clipboard API is unavailable', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });

    render(<CodeBlock code="fetch('/api/v1/trains')" />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    // Should remain in the un-copied state rather than throwing or getting
    // stuck - same silent-failure contract as ShareButton.tsx.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument()
    );
  });
});
