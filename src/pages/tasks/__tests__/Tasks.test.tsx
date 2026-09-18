import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Tasks from '../Tasks';
import {
  getTasks,
  updateTaskStatus,
} from '../../../services/tasks';

vi.mock('../../../services/tasks', () => ({
  getTasks: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

describe('Tasks page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getTasks).mockResolvedValue({
      data: [],
    });
  });

  it('renders Task Management heading', () => {
    render(<Tasks />);

    expect(
      screen.getByRole('heading', { name: /task management/i }),
    ).toBeInTheDocument();
  });

  it('fetches and renders tasks', async () => {
    vi.mocked(getTasks).mockResolvedValue({
      data: [
        {
          id: 1,
          capa_id: 10,
          title: 'Perbaiki APAR',
          description: 'Melakukan pemeriksaan dan perbaikan APAR.',
          assigned_to: 5,
          due_date: '2026-09-20',
          status: 'open',
        },
      ],
    });

    render(<Tasks />);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Perbaiki APAR')).toBeInTheDocument();
  });

  it('renders empty state when there are no tasks', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [],
    });

    render(<Tasks />);

    await waitFor(() => {
        expect(getTasks).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });

  it('renders loading state while fetching tasks', async () => {
    vi.mocked(getTasks).mockImplementation(
        () => new Promise(() => {}),
    );

    render(<Tasks />);

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    });

  it('renders error state when fetching tasks fails', async () => {
    vi.mocked(getTasks).mockRejectedValue(
        new Error('Failed to fetch tasks'),
    );

    render(<Tasks />);

    await waitFor(() => {
        expect(getTasks).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });

  it('renders task status', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [
        {
            id: 1,
            capa_id: 10,
            title: 'Perbaiki APAR',
            description: 'Melakukan pemeriksaan dan perbaikan APAR.',
            assigned_to: 5,
            due_date: '2026-09-20',
            status: 'in_progress',
        },
        ],
    });

    render(<Tasks />);

    await waitFor(() => {
        expect(getTasks).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });

  it('renders task due date', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [
        {
            id: 1,
            capa_id: 10,
            title: 'Perbaiki APAR',
            description: 'Melakukan pemeriksaan dan perbaikan APAR.',
            assigned_to: 5,
            due_date: '2026-09-20',
            status: 'in_progress',
        },
        ],
    });

    render(<Tasks />);

    await waitFor(() => {
        expect(getTasks).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/2026-09-20/)).toBeInTheDocument();
    });

  it('updates task status when the user clicks the update button', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [
        {
            id: 1,
            capa_id: 10,
            title: 'Perbaiki APAR',
            description: 'Melakukan pemeriksaan dan perbaikan APAR.',
            assigned_to: 5,
            due_date: '2026-09-20',
            status: 'open',
        },
        ],
    });

    render(<Tasks />);

    await waitFor(() => {
        expect(screen.getByText('Perbaiki APAR')).toBeInTheDocument();
    });

    expect(
        screen.getByRole('button', { name: /start task/i }),
    ).toBeInTheDocument();
    });

  it('updates task status to in_progress when Start Task is clicked', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [
        {
            id: 1,
            capa_id: 10,
            title: 'Perbaiki APAR',
            description: 'Melakukan pemeriksaan dan perbaikan APAR.',
            assigned_to: 5,
            due_date: '2026-09-20',
            status: 'open',
        },
        ],
    });

    vi.mocked(updateTaskStatus).mockResolvedValue({
        data: {
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'in_progress',
        },
    });

    render(<Tasks />);

    const startButton = await screen.findByRole('button', {
        name: /start task/i,
    });

    startButton.click();

    await waitFor(() => {
        expect(updateTaskStatus).toHaveBeenCalledWith(
        1,
        'in_progress',
        );
    });
    });

  it('updates the displayed status after Start Task succeeds', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [
        {
            id: 1,
            capa_id: 10,
            title: 'Perbaiki APAR',
            description: 'Melakukan pemeriksaan dan perbaikan APAR.',
            assigned_to: 5,
            due_date: '2026-09-20',
            status: 'open',
        },
        ],
    });

    vi.mocked(updateTaskStatus).mockResolvedValue({
        data: {
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'in_progress',
        },
    });

    render(<Tasks />);

    const startButton = await screen.findByRole('button', {
        name: /start task/i,
    });

    startButton.click();

    await waitFor(() => {
        expect(
        screen.getByText(/in progress/i),
        ).toBeInTheDocument();
    });
    });

  it('updates task status to completed when Complete Task is clicked', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [{
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'in_progress',
        }],
    });

    vi.mocked(updateTaskStatus).mockResolvedValue({
        data: {
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'completed',
        },
    });

    render(<Tasks />);

    const completeButton = await screen.findByRole('button', {
        name: /complete task/i,
    });

    completeButton.click();

    await waitFor(() => {
        expect(updateTaskStatus).toHaveBeenCalledWith(1, 'completed');
    });
    });

  it('updates the displayed status after Complete Task succeeds', async () => {
    vi.mocked(getTasks).mockResolvedValue({
        data: [{
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'in_progress',
        }],
    });

    vi.mocked(updateTaskStatus).mockResolvedValue({
        data: {
        id: 1,
        capa_id: 10,
        title: 'Perbaiki APAR',
        description: 'Melakukan pemeriksaan dan perbaikan APAR.',
        assigned_to: 5,
        due_date: '2026-09-20',
        status: 'completed',
        },
    });

    render(<Tasks />);

    const completeButton = await screen.findByRole('button', {
        name: /complete task/i,
    });

    completeButton.click();

    await waitFor(() => {
        expect(
        screen.getByText(/completed/i),
        ).toBeInTheDocument();
    });
    });

});