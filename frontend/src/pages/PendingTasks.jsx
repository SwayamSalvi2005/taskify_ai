import { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/tasks/TaskList';
import TaskFormModal from '../components/tasks/TaskFormModal';

export default function PendingTasks() {
  const { tasks, loading, fetchTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const pendingTasks = tasks.filter(t => !t.completed);

  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingTask(null); fetchTasks(); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Focus on what needs to be done.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-primary hover:bg-blue-glow text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto">
          + Add New Task
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <TaskList tasks={pendingTasks} title="Pending Tasks" onEdit={handleEdit} />
      )}

      {showForm && <TaskFormModal task={editingTask} onClose={handleCloseForm} />}
    </div>
  );
}
