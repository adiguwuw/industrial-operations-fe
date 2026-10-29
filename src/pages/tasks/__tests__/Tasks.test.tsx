
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Tasks from '../Tasks';
import {
  getTasks,
  updateTaskStatus,
  submitTask,
} from '../../../services/tasks';
import type { Task } from '../../../services/tasks';

vi.mock('../../../services/tasks', () => ({
  getTasks: vi.fn(),
  updateTaskStatus: vi.fn(),
  submitTask: vi.fn(),
}));

vi.mock('../../../components/tasks/TaskForm', () => ({
  default: ({ onSuccess }: { onSuccess: (task: Task) => void }) => (
    <div>
      <h2>Create Task</h2>
      <button
        type="button"
        onClick={() =>
          onSuccess({
            id: 99,
            capa_id: null,
            source_type: 'direct',
            source_id: null,
            title: 'Task baru',
            description: null,
            assigned_to: 5,
            due_date: '2026-10-20',
            status: 'open',
            evidence_photo_path: null,
          })
        }
      >
        Simulate Create Success
      </button>
    </div>
  ),
}));

const renderTasks = () =>
  render(
    <MemoryRouter>
      <Tasks />
    </MemoryRouter>,
  );

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  capa_id: 10,
  source_type: 'capa',
  source_id: 10,
  title: 'Perbaiki APAR',
  description: 'Melakukan pemeriksaan dan perbaikan APAR.',
  assigned_to: 5,
  due_date: '2026-09-20',
  status: 'open',
  evidence_photo_path: null,
  ...overrides,
});

async function openSubmissionModal() {
  renderTasks();

  fireEvent.click(
    await screen.findByRole('button', {
      name: /submit for review/i,
    }),
  );

  expect(
    await screen.findByRole('dialog'),
  ).toBeInTheDocument();
}

function choosePhoto(inputId: string, file: File) {
  const input = document.getElementById(inputId) as HTMLInputElement;

  fireEvent.change(input, {
    target: { files: [file] },
  });
}

function fillSubmissionForm() {
  const beforePhoto = new File(['before-image'], 'before.jpg', {
    type: 'image/jpeg',
  });
  const afterPhoto = new File(['after-image'], 'after.jpg', {
    type: 'image/jpeg',
  });

  choosePhoto('task-before-photo', beforePhoto);
  choosePhoto('task-after-photo', afterPhoto);

  fireEvent.change(screen.getByLabelText(/catatan pengerjaan/i), {
    target: { value: 'APAR sudah diperbaiki.' },
  });

  return { beforePhoto, afterPhoto };
}

function clickModalSubmit() {
  const buttons = screen.getAllByRole('button', {
    name: /submit for review/i,
  });

  fireEvent.click(buttons[buttons.length - 1]);
}

describe('Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getTasks).mockResolvedValue([]);
    vi.mocked(updateTaskStatus).mockImplementation(async (id, status) =>
      createTask({ id, status }),
    );
    vi.mocked(submitTask).mockImplementation(async (id, payload) =>
      createTask({
        id,
        status: 'pending_review',
        before_photo_path: 'task-evidence/before.jpg',
        after_photo_path: 'task-evidence/after.jpg',
        completion_notes: payload.completion_notes,
      }),
    );

    vi.spyOn(URL, 'createObjectURL').mockReturnValue(
      'blob:http://localhost/fake-photo',
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('renders Task Management heading', () => {
    renderTasks();

    expect(
      screen.getByRole('heading', { name: /task management/i }),
    ).toBeInTheDocument();
  });

  it('fetches and renders tasks', async () => {
    vi.mocked(getTasks).mockResolvedValue([createTask()]);

    renderTasks();

    expect(await screen.findByText('Perbaiki APAR')).toBeInTheDocument();
    expect(getTasks).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when there are no tasks', async () => {
    renderTasks();

    expect(await screen.findByText(/belum ada task/i)).toBeInTheDocument();
  });

  it('renders loading state while fetching tasks', () => {
    vi.mocked(getTasks).mockImplementation(
      () => new Promise<Task[]>(() => {}),
    );

    renderTasks();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error when fetching tasks fails', async () => {
    vi.mocked(getTasks).mockRejectedValue(
      new Error('Failed to fetch tasks'),
    );

    renderTasks();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /gagal memuat task/i,
    );
  });

  it('renders task status', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    renderTasks();

    expect(
      await screen.findAllByText('In Progress'),
    ).not.toHaveLength(0);
  });

  it('renders task due date', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    renderTasks();

    expect(await screen.findByText(/20 sep 2026/i)).toBeInTheDocument();
  });

  it('renders the direct assignment source badge', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({
        capa_id: null,
        source_type: 'direct',
        source_id: null,
      }),
    ]);

    renderTasks();

    expect(
      await screen.findByText('Direct Assignment'),
    ).toBeInTheDocument();
  });

  it('renders the K3 / CAPA source badge', async () => {
    vi.mocked(getTasks).mockResolvedValue([createTask()]);

    renderTasks();

    expect(await screen.findByText('K3 / CAPA')).toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ id: 1, title: 'Task Open', status: 'open' }),
      createTask({
        id: 2,
        title: 'Task Progress',
        status: 'in_progress',
      }),
      createTask({
        id: 3,
        title: 'Task Completed',
        status: 'completed',
      }),
    ]);

    renderTasks();

    expect(await screen.findByText('Task Open')).toBeInTheDocument();
    expect(screen.getByText('Task Progress')).toBeInTheDocument();
    expect(screen.getByText('Task Completed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^open$/i }));

    expect(screen.getByText('Task Open')).toBeInTheDocument();
    expect(screen.queryByText('Task Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Task Completed')).not.toBeInTheDocument();
  });

  it('renders task summary counts', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ id: 1, status: 'open' }),
      createTask({ id: 2, status: 'open' }),
      createTask({ id: 3, status: 'in_progress' }),
      createTask({ id: 4, status: 'pending_review' }),
      createTask({ id: 5, status: 'validated' }),
    ]);

    renderTasks();

    expect(await screen.findByTestId('task-summary-open')).toHaveTextContent(
      '2',
    );
    expect(screen.getByTestId('task-summary-in-progress')).toHaveTextContent(
      '1',
    );
    expect(
      screen.getByTestId('task-summary-pending-review'),
    ).toHaveTextContent('1');
    expect(screen.getByTestId('task-summary-completed')).toHaveTextContent(
      '1',
    );
  });

  it('opens the Create Task form', async () => {
    renderTasks();

    fireEvent.click(
      await screen.findByRole('button', { name: /create task/i }),
    );

    expect(
      screen.getByRole('heading', { name: /create task/i }),
    ).toBeInTheDocument();
  });

  it('adds a newly created task to the list', async () => {
    renderTasks();

    fireEvent.click(
      await screen.findByRole('button', { name: /create task/i }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /simulate create success/i }),
    );

    expect(await screen.findByText('Task baru')).toBeInTheDocument();
  });

  it('renders Start Task for an open task', async () => {
    vi.mocked(getTasks).mockResolvedValue([createTask({ status: 'open' })]);

    renderTasks();

    expect(
      await screen.findByRole('button', { name: /start task/i }),
    ).toBeInTheDocument();
  });

  it('updates task status to in_progress when Start Task is clicked', async () => {
    vi.mocked(getTasks).mockResolvedValue([createTask({ status: 'open' })]);

    renderTasks();

    fireEvent.click(
      await screen.findByRole('button', { name: /start task/i }),
    );

    await waitFor(() => {
      expect(updateTaskStatus).toHaveBeenCalledWith(1, 'in_progress');
    });

    expect(
      await screen.findAllByText('In Progress'),
    ).not.toHaveLength(0);
  });

  it('renders Submit for Review for an in-progress task', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    renderTasks();

    expect(
      await screen.findByRole('button', { name: /submit for review/i }),
    ).toBeInTheDocument();
  });

  it('opens the submission modal with required fields', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    await openSubmissionModal();

    expect(
      screen.getByLabelText(/foto sebelum/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/foto sesudah/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/catatan pengerjaan/i),
    ).toBeInTheDocument();
  });

  it('keeps submission disabled until photos and notes are provided', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    await openSubmissionModal();

    const buttons = screen.getAllByRole('button', {
      name: /submit for review/i,
    });

    expect(buttons[buttons.length - 1]).toBeDisabled();
    expect(submitTask).not.toHaveBeenCalled();
  });

  it('submits both photos and completion notes', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    await openSubmissionModal();

    const { beforePhoto, afterPhoto } = fillSubmissionForm();

    expect(
      await screen.findByAltText('Preview foto sebelum'),
    ).toBeInTheDocument();
    expect(
      await screen.findByAltText('Preview foto sesudah'),
    ).toBeInTheDocument();

    clickModalSubmit();

    await waitFor(() => {
      expect(submitTask).toHaveBeenCalledWith(1, {
        before_photo: beforePhoto,
        after_photo: afterPhoto,
        completion_notes: 'APAR sudah diperbaiki.',
      });
    });

    expect(
      await screen.findAllByText('Pending Review'),
    ).not.toHaveLength(0);
    expect(await screen.findByAltText('Before task')).toBeInTheDocument();
    expect(await screen.findByAltText('After task')).toBeInTheDocument();
    expect(screen.getByText('APAR sudah diperbaiki.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('rejects an invalid photo type', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    await openSubmissionModal();

    choosePhoto(
      'task-before-photo',
      new File(['pdf'], 'evidence.pdf', { type: 'application/pdf' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /foto harus berformat jpg, png, atau webp/i,
    );
    expect(submitTask).not.toHaveBeenCalled();
  });

  it('rejects a photo larger than 5 MB', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    await openSubmissionModal();

    choosePhoto(
      'task-before-photo',
      new File([new Uint8Array(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /ukuran maksimal setiap foto adalah 5 mb/i,
    );
    expect(submitTask).not.toHaveBeenCalled();
  });

  it('shows a backend error when task submission fails', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'in_progress' }),
    ]);

    vi.mocked(submitTask).mockRejectedValue({
      response: {
        data: {
          message: 'Task submission failed.',
        },
      },
    });

    await openSubmissionModal();
    fillSubmissionForm();
    clickModalSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Task submission failed.',
    );
  });

  it('does not show Submit for Review for a validated task', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'validated' }),
    ]);

    renderTasks();

    expect(
      await screen.findAllByText('Validated'),
    ).not.toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /submit for review/i }),
    ).not.toBeInTheDocument();
  });

  it('shows before and after evidence for an already submitted task', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({
        status: 'pending_review',
        before_photo_path: 'task-evidence/before.jpg',
        after_photo_path: 'task-evidence/after.jpg',
        completion_notes: 'Pekerjaan telah dikirim.',
      }),
    ]);

    renderTasks();

    expect(await screen.findByAltText('Before task')).toHaveAttribute(
      'src',
      expect.stringContaining('/storage/task-evidence/before.jpg'),
    );
    expect(screen.getByAltText('After task')).toHaveAttribute(
      'src',
      expect.stringContaining('/storage/task-evidence/after.jpg'),
    );
    expect(screen.getByText('Pekerjaan telah dikirim.')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Review')).toBeInTheDocument();
  });

  it('does not show submission controls for a completed task', async () => {
    vi.mocked(getTasks).mockResolvedValue([
      createTask({ status: 'completed' }),
    ]);

    renderTasks();

    expect(await screen.findByText('Completed')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /submit for review/i }),
    ).not.toBeInTheDocument();
  });
});
