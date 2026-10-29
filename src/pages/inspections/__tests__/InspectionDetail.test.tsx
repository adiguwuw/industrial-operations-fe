import { MemoryRouter, Route, Routes } from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import InspectionDetail from '../InspectionDetail';

import * as inspectionService from '../../../services/inspections';
import { createRiskAssessment } from '../../../services/riskAssessments';
import { createCapa } from '../../../services/capas';

vi.mock('../../../services/inspections', () => ({
  getInspection: vi.fn(),
  updateInspectionItemResult: vi.fn(),
  createFinding: vi.fn(),
}));

vi.mock('../../../services/riskAssessments', () => ({
  createRiskAssessment: vi.fn(),
}));

vi.mock('../../../services/capas', () => ({
  createCapa: vi.fn(),
}));

vi.mock('../../../components/UserProfileMenu', () => ({
  default: () => <div>User Profile</div>,
}));

vi.mock('../../../services/tasks', () => ({
  createTask: vi.fn(),
}));

const inspectionData = {
  id: 1,
  checklist_id: 2,
  location: 'Area Produksi',
  inspection_date: '2026-09-21',
  status: 'draft',

  checklist: {
    id: 2,
    name: 'Checklist Keselamatan Produksi',
    description: 'Checklist untuk area produksi.',
  },

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
    {
      id: 11,
      safety_inspection_id: 1,
      checklist_item_id: 6,
      question: 'Apakah APAR tersedia?',
      sort_order: 2,
      is_required: true,
      result: 'PASS' as const,
    },
  ],
};

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/inspections/1']}>
      <Routes>
        <Route
          path="/inspections/:id"
          element={<InspectionDetail />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

const createObjectURLMock = vi.fn(
  () => 'blob:http://localhost/finding-preview',
);

const revokeObjectURLMock = vi.fn();

describe('InspectionDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });

    vi.mocked(
      inspectionService.getInspection,
    ).mockResolvedValue({
      data: inspectionData,
    });
  });

  it('shows loading state', () => {
    vi.mocked(
      inspectionService.getInspection,
    ).mockReturnValue(
      new Promise(() => {}),
    );

    renderPage();

    expect(
      screen.getByText('Loading inspection...'),
    ).toBeInTheDocument();
  });

  it('renders inspection detail after loading', async () => {
    renderPage();

    expect(
      await screen.findByText(
        'Checklist Keselamatan Produksi',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Area Produksi'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Apakah jalur evakuasi aman?',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Apakah APAR tersedia?',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('1', {
        selector: 'p',
      }),
    ).toBeInTheDocument();
  });

  it('updates an inspection item to PASS', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'PASS',
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const passButtons =
      screen.getAllByRole('button', {
        name: 'Pass',
      });

    fireEvent.click(passButtons[0]);

    await waitFor(() => {
      expect(
        inspectionService.updateInspectionItemResult,
      ).toHaveBeenCalledWith(
        1,
        10,
        'PASS',
      );
    });
  });

  it('shows finding form when an item is marked as FAIL', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Create Finding',
        }),
      ).toBeInTheDocument();
    });
  });

  it('creates a finding from a failed inspection item', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    vi.mocked(
      inspectionService.createFinding,
    ).mockResolvedValue({
      message:
        'Finding created successfully.',
      data: {
        id: 20,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description:
          'Jalur evakuasi terhalang material.',
        photo_path: null,
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    const createFindingButton =
      await screen.findByRole('button', {
        name: 'Create Finding',
      });

    fireEvent.click(createFindingButton);

    const description =
      screen.getByLabelText(
        'Finding Description',
      );

    fireEvent.change(description, {
      target: {
        value:
          'Jalur evakuasi terhalang material.',
      },
    });

    const createFindingButtons =
      screen.getAllByRole('button', {
        name: /Create Finding/i,
      });

    fireEvent.click(
      createFindingButtons[
        createFindingButtons.length - 1
      ],
    );

    await waitFor(() => {
      expect(
        inspectionService.createFinding,
      ).toHaveBeenCalledWith(
        1,
        10,
        'Jalur evakuasi terhalang material.',
        null,
      );
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Risk Assessment',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Hazard'),
    ).toBeInTheDocument();
  });

  it('shows risk assessment form after creating a finding', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    vi.mocked(
      inspectionService.createFinding,
    ).mockResolvedValue({
      message:
        'Finding created successfully.',
      data: {
        id: 20,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description:
          'Jalur evakuasi terhalang material.',
        photo_path: null,
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    const createFindingButton =
      await screen.findByRole('button', {
        name: 'Create Finding',
      });

    fireEvent.click(createFindingButton);

    const description =
      screen.getByLabelText(
        'Finding Description',
      );

    fireEvent.change(description, {
      target: {
        value:
          'Jalur evakuasi terhalang material.',
      },
    });

    const createFindingButtons =
      screen.getAllByRole('button', {
        name: /Create Finding/i,
      });

    fireEvent.click(
      createFindingButtons[
        createFindingButtons.length - 1
      ],
    );

    await waitFor(() => {
      expect(
        inspectionService.createFinding,
      ).toHaveBeenCalledWith(
        1,
        10,
        'Jalur evakuasi terhalang material.',
        null,
      );
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Risk Assessment',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Hazard'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Likelihood'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Severity'),
    ).toBeInTheDocument();
  });

  it('shows CAPA form after creating a risk assessment', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    vi.mocked(
      inspectionService.createFinding,
    ).mockResolvedValue({
      message:
        'Finding created successfully.',
      data: {
        id: 20,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description:
          'Jalur evakuasi terhalang material.',
        photo_path: null,
      },
    });

    vi.mocked(
      createRiskAssessment,
    ).mockResolvedValue({
      message:
        'Risk assessment created successfully.',
      data: {
        id: 1,
        finding_id: 20,
        hazard:
          'Terhambatnya evakuasi saat keadaan darurat',
        likelihood: 3,
        severity: 4,
        risk_level: 'HIGH',
        existing_controls:
          'Penandaan jalur evakuasi',
        assessment_date: '2026-09-21',
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    const createFindingButton =
      await screen.findByRole('button', {
        name: 'Create Finding',
      });

    fireEvent.click(createFindingButton);

    const description =
      screen.getByLabelText(
        'Finding Description',
      );

    fireEvent.change(description, {
      target: {
        value:
          'Jalur evakuasi terhalang material.',
      },
    });

    const createFindingButtons =
      screen.getAllByRole('button', {
        name: /Create Finding/i,
      });

    fireEvent.click(
      createFindingButtons[
        createFindingButtons.length - 1
      ],
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Risk Assessment',
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText('Hazard'),
      {
        target: {
          value:
            'Terhambatnya evakuasi saat keadaan darurat',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Likelihood'),
      {
        target: {
          value: '3',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Severity'),
      {
        target: {
          value: '4',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'High',
      }),
    );

    fireEvent.change(
      screen.getByLabelText(
        'Existing Controls',
      ),
      {
        target: {
          value:
            'Penandaan jalur evakuasi',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(
        'Assessment Date',
      ),
      {
        target: {
          value: '2026-09-21',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create Risk Assessment',
      }),
    );

    await waitFor(() => {
      expect(
        createRiskAssessment,
      ).toHaveBeenCalledWith(20, {
        hazard:
          'Terhambatnya evakuasi saat keadaan darurat',
        likelihood: 3,
        severity: 4,
        risk_level: 'HIGH',
        existing_controls:
          'Penandaan jalur evakuasi',
        assessment_date: '2026-09-21',
      });
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Corrective & Preventive Action',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Action'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        'Responsible User',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Due Date'),
    ).toBeInTheDocument();
  });

  it('shows Task form after creating a CAPA', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    vi.mocked(
      inspectionService.createFinding,
    ).mockResolvedValue({
      message:
        'Finding created successfully.',
      data: {
        id: 20,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description:
          'Jalur evakuasi terhalang material.',
        photo_path: null,
      },
    });

    vi.mocked(
      createRiskAssessment,
    ).mockResolvedValue({
      message:
        'Risk assessment created successfully.',
      data: {
        id: 1,
        finding_id: 20,
        hazard:
          'Terhambatnya evakuasi saat keadaan darurat',
        likelihood: 3,
        severity: 4,
        risk_level: 'HIGH',
        existing_controls:
          'Penandaan jalur evakuasi',
        assessment_date: '2026-09-21',
      },
    });

    vi.mocked(
      createCapa,
    ).mockResolvedValue({
      message: 'CAPA created successfully.',
      data: {
        id: 30,
        finding_id: 20,
        type: 'corrective',
        action:
          'Membersihkan jalur evakuasi dari material.',
        responsible_user_id: 5,
        due_date: '2026-10-10',
        status: 'open',
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    const createFindingButton =
      await screen.findByRole('button', {
        name: 'Create Finding',
      });

    fireEvent.click(createFindingButton);

    fireEvent.change(
      screen.getByLabelText(
        'Finding Description',
      ),
      {
        target: {
          value:
            'Jalur evakuasi terhalang material.',
        },
      },
    );

    const createFindingButtons =
      screen.getAllByRole('button', {
        name: /Create Finding/i,
      });

    fireEvent.click(
      createFindingButtons[
        createFindingButtons.length - 1
      ],
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Risk Assessment',
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText('Hazard'),
      {
        target: {
          value:
            'Terhambatnya evakuasi saat keadaan darurat',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Likelihood'),
      {
        target: {
          value: '3',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText('Severity'),
      {
        target: {
          value: '4',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'High',
      }),
    );

    fireEvent.change(
      screen.getByLabelText(
        'Existing Controls',
      ),
      {
        target: {
          value:
            'Penandaan jalur evakuasi',
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(
        'Assessment Date',
      ),
      {
        target: {
          value: '2026-09-21',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create Risk Assessment',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Corrective & Preventive Action',
      }),
    ).toBeInTheDocument();

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
      screen.getByLabelText(
        'Responsible User',
      ),
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
        createCapa,
      ).toHaveBeenCalledWith(20, {
        type: 'corrective',
        action:
          'Membersihkan jalur evakuasi dari material.',
        responsible_user_id: 5,
        due_date: '2026-10-10',
      });
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Create Task',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Title'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Description'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Assigned To'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Due Date', {
        selector: '#task-due-date',
      }),
    ).toBeInTheDocument();
  });

  it('shows error when inspection loading fails', async () => {
    vi.mocked(
      inspectionService.getInspection,
    ).mockRejectedValue({
      response: {
        data: {
          message:
            'Inspection not found.',
        },
      },
    });

    renderPage();

    expect(
      await screen.findByText(
        'Inspection not found.',
      ),
    ).toBeInTheDocument();
  });

  it('creates a finding with photo from a failed inspection item', async () => {
    vi.mocked(
      inspectionService.updateInspectionItemResult,
    ).mockResolvedValue({
      message:
        'Inspection item result updated successfully.',
      data: {
        ...inspectionData.items[0],
        result: 'FAIL',
      },
    });

    vi.mocked(
      inspectionService.createFinding,
    ).mockResolvedValue({
      message:
        'Finding created successfully.',
      data: {
        id: 21,
        safety_inspection_id: 1,
        safety_inspection_item_id: 10,
        description:
          'Jalur evakuasi terhalang material.',
        photo_path:
          'findings/finding.jpg',
      },
    });

    renderPage();

    await screen.findByText(
      'Apakah jalur evakuasi aman?',
    );

    const failButtons =
      screen.getAllByRole('button', {
        name: 'Fail',
      });

    fireEvent.click(failButtons[0]);

    const createFindingButton =
      await screen.findByRole('button', {
        name: 'Create Finding',
      });

    fireEvent.click(createFindingButton);

    const descriptionInput =
      screen.getByLabelText(
        'Finding Description',
      );

    fireEvent.change(descriptionInput, {
      target: {
        value:
          'Jalur evakuasi terhalang material.',
      },
    });

    const photo = new File(
      ['fake-image'],
      'finding.jpg',
      {
        type: 'image/jpeg',
      },
    );

    const photoInput =
      screen.getByLabelText(
        /evidence photo/i,
      );

    fireEvent.change(photoInput, {
      target: {
        files: [photo],
      },
    });

    expect(
      createObjectURLMock,
    ).toHaveBeenCalledWith(photo);

    expect(
      screen.getByAltText(
        'Finding evidence preview',
      ),
    ).toBeInTheDocument();

    const createFindingButtons =
      screen.getAllByRole('button', {
        name: /Create Finding/i,
      });

    fireEvent.click(
      createFindingButtons[
        createFindingButtons.length - 1
      ],
    );

    await waitFor(() => {
      expect(
        inspectionService.createFinding,
      ).toHaveBeenCalledWith(
        1,
        10,
        'Jalur evakuasi terhalang material.',
        photo,
      );
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Risk Assessment',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Hazard'),
    ).toBeInTheDocument();
  });
});