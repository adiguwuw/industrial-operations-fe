import { describe, expect, it, vi, beforeEach } from 'vitest';

import api from '../../lib/api';
import {
  createFinding,
  getInspection,
  getInspections,
  updateInspectionItemResult,
} from '../inspections';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('inspection services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets inspections', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            checklist_id: 2,
            location: 'Area Produksi',
            inspection_date: '2026-09-21',
            status: 'draft',
            items: [],
          },
        ],
      },
    });

    const response = await getInspections();

    expect(api.get).toHaveBeenCalledWith('/inspections');
    expect(response.data[0].location).toBe('Area Produksi');
  });

  it('gets inspection detail', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          id: 1,
          checklist_id: 2,
          location: 'Area Produksi',
          inspection_date: '2026-09-21',
          status: 'draft',
          checklist: {
            id: 2,
            name: 'Checklist K3',
            description: null,
          },
          items: [],
        },
      },
    });

    const response = await getInspection(1);

    expect(api.get).toHaveBeenCalledWith('/inspections/1');
    expect(response.data.id).toBe(1);
  });

  it('updates inspection item result', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: {
        message: 'Inspection item updated successfully.',
        data: {
          id: 10,
          safety_inspection_id: 1,
          checklist_item_id: 5,
          question: 'Apakah jalur evakuasi aman?',
          sort_order: 1,
          is_required: true,
          result: 'PASS',
        },
      },
    });

    const response = await updateInspectionItemResult(1, 10, 'PASS');

    expect(api.patch).toHaveBeenCalledWith(
      '/inspections/1/items/10',
      { result: 'PASS' },
    );

    expect(response.data.result).toBe('PASS');
  });

  it('creates finding from failed inspection item', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        message: 'Finding created successfully.',
        data: {
          id: 1,
          safety_inspection_id: 1,
          safety_inspection_item_id: 10,
          description:
            'Jalur evakuasi terhalang material.',
          photo_path: null,
        },
      },
    });

    const response = await createFinding(
      1,
      10,
      'Jalur evakuasi terhalang material.',
    );

    expect(api.post).toHaveBeenCalledWith(
      '/inspections/1/items/10/findings',
      expect.any(FormData),
    );

    const formData =
      vi.mocked(api.post).mock.calls[0][1] as FormData;

    expect(formData.get('description')).toBe(
      'Jalur evakuasi terhalang material.',
    );

    expect(formData.get('photo')).toBeNull();

    expect(response.data.description).toBe(
      'Jalur evakuasi terhalang material.',
    );

    expect(response.data.photo_path).toBeNull();
  });
});

it('creates finding with photo', async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: {
      message: 'Finding created successfully.',
      data: {
        id: 1,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description: 'Jalur evakuasi terhalang material.',
        photo_path: 'findings/finding.jpg',
      },
    },
  });

  const photo = new File(
    ['fake-image'],
    'finding.jpg',
    {
      type: 'image/jpeg',
    },
  );

  const response = await createFinding(
    1,
    10,
    'Jalur evakuasi terhalang material.',
    photo,
  );

  expect(api.post).toHaveBeenCalledWith(
    '/inspections/1/items/10/findings',
    expect.any(FormData),
  );

  const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;

  expect(formData.get('description')).toBe(
    'Jalur evakuasi terhalang material.',
  );

  expect(formData.get('photo')).toBe(photo);

  expect(response.data.photo_path).toBe(
    'findings/finding.jpg',
  );
});