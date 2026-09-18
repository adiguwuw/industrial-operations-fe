import { useEffect, useState } from 'react';
import {
  getTasks,
  updateTaskStatus,
  type Task,
} from '../../services/tasks';

const getStatusLabel = (status: Task['status']) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Open';
  }
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        setTasks(response.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStartTask = async (task: Task) => {
    const response = await updateTaskStatus(task.id, 'in_progress');

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? response.data : currentTask,
      ),
    );
  };

  const handleCompleteTask = async (task: Task) => {
    const response = await updateTaskStatus(task.id, 'completed');

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? response.data : currentTask,
      ),
    );
  };

  return (
    <main>
      <h1>Task Management</h1>

      <section>
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p>Failed to load tasks</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          tasks.map((task) => (
            <article key={task.id}>
              <div>
                <h2>{task.title}</h2>

                <p>
                  Status: {getStatusLabel(task.status)}
                </p>

                <p>
                  Due Date: {task.due_date}
                </p>
              </div>

              <div>
                {task.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => handleStartTask(task)}
                  >
                    Start Task
                  </button>
                )}

                {task.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(task)}
                  >
                    Complete Task
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}