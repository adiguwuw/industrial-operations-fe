import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RiskAssessmentForm from '../RiskAssessmentForm';
import { createRiskAssessment } from '../../../services/riskAssessments';

vi.mock('../../../services/riskAssessments', () => ({
  createRiskAssessment: vi.fn(),
}));

describe('RiskAssessmentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the risk assessment form', () => {
    render(<RiskAssessmentForm findingId={10} />);

    expect(
      screen.getByRole('heading', { name: 'Risk Assessment' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Hazard')).toBeInTheDocument();
    expect(screen.getByLabelText('Likelihood')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Existing Controls')).toBeInTheDocument();
    expect(screen.getByLabelText('Assessment Date')).toBeInTheDocument();
  });

  it('submits a risk assessment successfully', async () => {
    const onSuccess = vi.fn();

    vi.mocked(createRiskAssessment).mockResolvedValue({
      message: 'Risk assessment created successfully.',
      data: {
        id: 1,
        finding_id: 10,
        hazard: 'Terhambatnya evakuasi saat keadaan darurat',
        likelihood: 3,
        severity: 4,
        risk_level: 'HIGH',
        existing_controls: 'Penandaan jalur evakuasi',
        assessment_date: '2026-09-21',
      },
    });

    render(
      <RiskAssessmentForm
        findingId={10}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText('Hazard'), {
      target: {
        value: 'Terhambatnya evakuasi saat keadaan darurat',
      },
    });

    fireEvent.change(screen.getByLabelText('Likelihood'), {
      target: { value: '3' },
    });

    fireEvent.change(screen.getByLabelText('Severity'), {
      target: { value: '4' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'High' }));

    fireEvent.change(screen.getByLabelText('Existing Controls'), {
      target: {
        value: 'Penandaan jalur evakuasi',
      },
    });

    fireEvent.change(screen.getByLabelText('Assessment Date'), {
      target: { value: '2026-09-21' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create Risk Assessment',
      }),
    );

    await waitFor(() => {
      expect(createRiskAssessment).toHaveBeenCalledWith(10, {
        hazard: 'Terhambatnya evakuasi saat keadaan darurat',
        likelihood: 3,
        severity: 4,
        risk_level: 'HIGH',
        existing_controls: 'Penandaan jalur evakuasi',
        assessment_date: '2026-09-21',
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(
      screen.getByRole('status'),
    ).toHaveTextContent('Risk assessment created successfully.');
  });

  it('shows backend validation errors', async () => {
    vi.mocked(createRiskAssessment).mockRejectedValue({
      response: {
        data: {
          errors: {
            likelihood: ['The likelihood field is invalid.'],
          },
        },
      },
    });

    render(<RiskAssessmentForm findingId={10} />);

    fireEvent.change(screen.getByLabelText('Hazard'), {
      target: { value: 'Test hazard' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create Risk Assessment',
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'The likelihood field is invalid.',
      );
    });
  });
});