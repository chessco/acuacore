import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Inbox } from './Inbox';
import { TenantProvider } from '../../contexts/TenantContext';

// Mock global fetch
global.fetch = vi.fn();

// Mock Socket.io
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

describe('Inbox Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('flowApiKey', 'test_api_key_2026');
    localStorage.setItem('flowUrl', 'http://localhost:3003');
  });

  it('sends the correct x-api-key and x-tenant-id headers when fetching conversations', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(
      <TenantProvider>
        <Inbox />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/conversations'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test_api_key_2026',
            'x-tenant-id': 'pitaya'
          })
        })
      );
    });
  });

  it('sends a message with correct headers and body', async () => {
    // 1. Initial fetch of conversations
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'conv_1', contact: { phone: '123' }, messages: [] }]
    });

    // 2. Fetch history
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    // 3. Send message mock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(
      <TenantProvider>
        <Inbox />
      </TenantProvider>
    );

    // Wait for conversations to load and select one
    const contact = await screen.findByText('123');
    fireEvent.click(contact);

    // Type and send
    const input = screen.getByPlaceholderText(/Escribe un mensaje/i);
    fireEvent.change(input, { target: { value: 'Hello Flow' } });
    
    const sendButton = screen.getByRole('button', { name: '' }); // The send icon button
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/send'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ to: '123', content: 'Hello Flow' }),
          headers: expect.objectContaining({
            'x-api-key': 'test_api_key_2026',
            'x-tenant-id': 'pitaya'
          })
        })
      );
    });
  });
});
