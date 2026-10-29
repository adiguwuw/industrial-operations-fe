import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import Inspections from '../Inspections';
import * as inspectionService from '../../../services/inspections';

vi.mock('../../../services/inspections', () => ({
  getInspections: vi.fn(),
}));

vi.mock('../../../components/UserProfileMenu', () => ({
  default: () => <div>User Profile</div>,
}));

describe('Inspections page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(inspectionService.getInspections).mockReturnValue(
      new Promise(() => {}),
    );

    render(
      <MemoryRouter>
        <Inspections />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading inspections...')).toBeInTheDocument();
  });

  it('renders inspections after loading', async () => {
    vi.mocked(inspectionService.getInspections).mockResolvedValue({
      data: [
        {
          id: 1,
          checklist_id: 2,
          location: 'Area Produksi',
          inspection_date: '2026-09-21',
          status: 'draft',
          items: [
            {
              id: 10,
              safety_inspection_id: 1,
              checklist_item_id: 5,
              question: 'Apakah jalur evakuasi aman?',
              sort_order: 1,
              is_required: true,
              result: null,
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <Inspections />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Inspection #1'),
    ).toBeInTheDocument();

    expect(screen.getByText('Area Produksi')).toBeInTheDocument();
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
    expect(screen.getByText('1 checklist items')).toBeInTheDocument();
  });

  it('shows empty state when there are no inspections', async () => {
    vi.mocked(inspectionService.getInspections).mockResolvedValue({
      data: [],
    });

    render(
      <MemoryRouter>
        <Inspections />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('No inspections yet'),
    ).toBeInTheDocument();
  });

  it('shows error state when loading fails', async () => {
    vi.mocked(inspectionService.getInspections).mockRejectedValue({
      response: {
        data: {
          message: 'Failed to load inspections.',
        },
      },
    });

    render(
      <MemoryRouter>
        <Inspections />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Failed to load inspections.'),
    ).toBeInTheDocument();
  });
});