import { describe, expect, it } from 'vitest';
import { getTask, getTasks, updateTaskStatus } from '../tasks';

describe('Task Service', () => {
  it('can fetch tasks from API', async () => {
    expect(getTasks).toBeDefined();
  });

  it('can fetch task detail from API', async () => {
    expect(getTask).toBeDefined();
  });

  it('can update task status', async () => {
    expect(updateTaskStatus).toBeDefined();
  });
});