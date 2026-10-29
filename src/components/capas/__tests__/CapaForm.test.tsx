import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import CapaForm from '../CapaForm';
import { createCapa } from '../../../services/capas';

vi.mock('../../../services/capas', () => ({
  createCapa: vi.fn(),
}));

describe('CapaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the CAPA form', () => {
    render(<CapaForm findingId={10} />);

    expect(
      screen.getByRole('heading', {
        name: 'Corrective & Preventive Action',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Action'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Responsible User'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Due Date'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Corrective',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Preventive',
      }),
    ).toBeInTheDocument();
  });

  it('creates a corrective CAPA successfully', async () => {
    const onSuccess = vi.fn();

    vi.mocked(createCapa).mockResolvedValue({
      message: 'CAPA created successfully.',
      data: {
        id: 1,
        finding_id: 10,
        type: 'corrective',
        action: 'Membersihkan jalur evakuasi dari material.',
        responsible_user_id: 5,
        due_date: '2026-10-10',
        status: 'open',
      },
    });

    render(
      <CapaForm
        findingId={10}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Corrective',
      }),
    );

    fireEvent.change(
      screen.getByLabelText('Action'),
      {
        target: {
          value:
            'Membersihkan jalur evakuasi dari material.',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Responsible User'),
      {
        target: {
          value: '5',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Due Date'),
      {
        target: {
          value: '2026-10-10',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create CAPA',
      }),
    );

    await waitFor(() => {
      expect(createCapa).toHaveBeenCalledWith(
        10,
        {
          type: 'corrective',
          action:
            'Membersihkan jalur evakuasi dari material.',
          responsible_user_id: 5,
          due_date: '2026-10-10',
        },
      );
    });

    expect(onSuccess).toHaveBeenCalled();

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'CAPA created successfully.',
    );
  });

  it('creates a preventive CAPA successfully', async () => {
    const onSuccess = vi.fn();

    vi.mocked(createCapa).mockResolvedValue({
      message: 'CAPA created successfully.',
      data: {
        id: 2,
        finding_id: 10,
        type: 'preventive',
        action:
          'Melakukan inspeksi rutin jalur evakuasi.',
        responsible_user_id: 6,
        due_date: '2026-10-15',
        status: 'open',
      },
    });

    render(
      <CapaForm
        findingId={10}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Preventive',
      }),
    );

    fireEvent.change(
      screen.getByLabelText('Action'),
      {
        target: {
          value:
            'Melakukan inspeksi rutin jalur evakuasi.',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Responsible User'),
      {
        target: {
          value: '6',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Due Date'),
      {
        target: {
          value: '2026-10-15',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create CAPA',
      }),
    );

    await waitFor(() => {
      expect(createCapa).toHaveBeenCalledWith(
        10,
        {
          type: 'preventive',
          action:
            'Melakukan inspeksi rutin jalur evakuasi.',
          responsible_user_id: 6,
          due_date: '2026-10-15',
        },
      );
    });

    expect(onSuccess).toHaveBeenCalled();

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'CAPA created successfully.',
    );
  });

  it('shows backend validation errors', async () => {
    vi.mocked(createCapa).mockRejectedValue({
      response: {
        data: {
          errors: {
            responsible_user_id: [
              'The responsible user field is required.',
            ],
          },
        },
      },
    });

    render(<CapaForm findingId={10} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Corrective',
      }),
    );

    fireEvent.change(
      screen.getByLabelText('Action'),
      {
        target: {
          value: 'Test corrective action',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Responsible User'),
      {
        target: {
          value: '5',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Due Date'),
      {
        target: {
          value: '2026-10-10',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create CAPA',
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('alert'),
      ).toHaveTextContent(
        'The responsible user field is required.',
      );
    });
  });
});
