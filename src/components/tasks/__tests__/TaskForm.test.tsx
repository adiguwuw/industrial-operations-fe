
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import TaskForm from '../TaskForm';

import {
  createCapaTask,
  createDirectTask,
} from '../../../services/tasks';

import { getTaskAssignees } from '../../../services/user';

vi.mock('../../../services/tasks', () => ({
  createCapaTask: vi.fn(),
  createDirectTask: vi.fn(),
}));

vi.mock('../../../services/user', () => ({
  getTaskAssignees: vi.fn(),
}));

const mockEmployee = {
  id: 5,
  name: 'Budi Santoso',
  email: 'budi@example.com',
  roles: ['employee'],
  profile_photo_url: null,
  created_at: '2026-10-01T00:00:00.000000Z',
  updated_at: '2026-10-01T00:00:00.000000Z',
};

const createImageFile = (
  name = 'task-photo.jpg',
  type = 'image/jpeg',
  content = 'fake-image-content',
) => new File([content], name, { type });

const fillDirectTaskForm = async () => {
  await screen.findByRole('option', {
    name: 'Budi Santoso — budi@example.com',
  });

  fireEvent.change(screen.getByLabelText(/^Title/), {
    target: { value: 'Merapikan area kerja' },
  });

  fireEvent.change(screen.getByLabelText('Description'), {
    target: {
      value: 'Merapikan area kerja setelah aktivitas operasional.',
    },
  });

  fireEvent.change(screen.getByLabelText(/Assigned To/), {
    target: { value: '5' },
  });

  fireEvent.change(screen.getByLabelText(/Due Date/), {
    target: { value: '2026-10-15' },
  });
};

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getTaskAssignees).mockResolvedValue([mockEmployee]);
  });

  it('renders the task form and loads employees', async () => {
    render(<TaskForm capaId={10} />);

    expect(
      screen.getByRole('heading', { name: 'Create Task' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText(/Assigned To/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();

    expect(
      screen.queryByLabelText(/task photo/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Create Task' }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('option', {
        name: 'Budi Santoso — budi@example.com',
      }),
    ).toBeInTheDocument();

    expect(getTaskAssignees).toHaveBeenCalledTimes(1);
  });

  it('creates a CAPA task successfully', async () => {
    const onSuccess = vi.fn();

    vi.mocked(createCapaTask).mockResolvedValue({
      id: 1,
      capa_id: 10,
      source_type: 'capa',
      source_id: 10,
      title: 'Membersihkan jalur evakuasi',
      description:
        'Membersihkan material yang menghalangi jalur evakuasi.',
      assigned_to: 5,
      due_date: '2026-10-10',
      status: 'open',
      evidence_photo_path: null,
    });

    render(<TaskForm capaId={10} onSuccess={onSuccess} />);

    await screen.findByRole('option', {
      name: 'Budi Santoso — budi@example.com',
    });

    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: 'Membersihkan jalur evakuasi' },
    });

    fireEvent.change(screen.getByLabelText('Description'), {
      target: {
        value: 'Membersihkan material yang menghalangi jalur evakuasi.',
      },
    });

    fireEvent.change(screen.getByLabelText(/Assigned To/), {
      target: { value: '5' },
    });

    fireEvent.change(screen.getByLabelText(/Due Date/), {
      target: { value: '2026-10-10' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    await waitFor(() => {
      expect(createCapaTask).toHaveBeenCalledWith(10, {
        title: 'Membersihkan jalur evakuasi',
        description:
          'Membersihkan material yang menghalangi jalur evakuasi.',
        assigned_to: 5,
        due_date: '2026-10-10',
      });
    });

    expect(createDirectTask).not.toHaveBeenCalled();

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        source_type: 'capa',
      }),
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Task created successfully.',
    );
  });

  it('creates a direct task successfully with a task photo', async () => {
    const onSuccess = vi.fn();
    const taskPhoto = createImageFile();

    vi.mocked(createDirectTask).mockResolvedValue({
      id: 2,
      capa_id: null,
      source_type: 'direct',
      source_id: null,
      title: 'Merapikan area kerja',
      description:
        'Merapikan area kerja setelah aktivitas operasional.',
      assigned_to: 5,
      due_date: '2026-10-15',
      status: 'open',
      evidence_photo_path: null,
    });

    render(<TaskForm onSuccess={onSuccess} />);

    await fillDirectTaskForm();

    fireEvent.change(screen.getByLabelText(/task photo/i), {
      target: { files: [taskPhoto] },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    await waitFor(() => {
      expect(createDirectTask).toHaveBeenCalledWith({
        title: 'Merapikan area kerja',
        description:
          'Merapikan area kerja setelah aktivitas operasional.',
        assigned_to: 5,
        due_date: '2026-10-15',
        task_photo: taskPhoto,
      });
    });

    expect(createCapaTask).not.toHaveBeenCalled();

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        source_type: 'direct',
      }),
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Task created successfully.',
    );
  });

  it('does not create a direct task when the photo is missing', async () => {
    render(<TaskForm />);

    await fillDirectTaskForm();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Task photo is required for a direct task.',
    );

    expect(createDirectTask).not.toHaveBeenCalled();
  });

  it('rejects an invalid task photo type', async () => {
    render(<TaskForm />);

    await fillDirectTaskForm();

    const invalidPhoto = createImageFile(
      'task-photo.pdf',
      'application/pdf',
    );

    fireEvent.change(screen.getByLabelText(/task photo/i), {
      target: { files: [invalidPhoto] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Task photo must be JPG, PNG, or WebP.',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    expect(createDirectTask).not.toHaveBeenCalled();
  });

  it('rejects a task photo larger than 5 MB', async () => {
    render(<TaskForm />);

    await fillDirectTaskForm();

    const largePhoto = createImageFile(
      'large-task-photo.jpg',
      'image/jpeg',
      'x'.repeat(5 * 1024 * 1024 + 1),
    );

    fireEvent.change(screen.getByLabelText(/task photo/i), {
      target: { files: [largePhoto] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Task photo must not exceed 5 MB.',
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    expect(createDirectTask).not.toHaveBeenCalled();
  });

  it('shows backend validation errors', async () => {
    vi.mocked(createCapaTask).mockRejectedValue({
      response: {
        data: {
          errors: {
            assigned_to: [
              'The assigned to field is required.',
            ],
          },
        },
      },
    });

    render(<TaskForm capaId={10} />);

    await screen.findByRole('option', {
      name: 'Budi Santoso — budi@example.com',
    });

    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: 'Test task' },
    });

    fireEvent.change(screen.getByLabelText(/Assigned To/), {
      target: { value: '5' },
    });

    fireEvent.change(screen.getByLabelText(/Due Date/), {
      target: { value: '2026-10-10' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Task' }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'The assigned to field is required.',
      );
    });
  });

  
  it('shows an error when loading employees fails', async () => {
    vi.mocked(getTaskAssignees).mockRejectedValueOnce(
      new Error('Network error'),
    );

    render(<TaskForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to load task assignees.',
    );

    expect(
      screen.getByRole('button', { name: 'Create Task' }),
    ).toBeDisabled();
  });

});
