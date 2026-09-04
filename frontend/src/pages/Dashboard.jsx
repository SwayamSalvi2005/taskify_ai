import { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import StatsCards from '../components/tasks/StatsCard';
import TaskList from '../components/tasks/TaskList';
import TaskFormModal from '../components/tasks/TaskFormModal';

export default function Dashboard() {
  const { tasks, stats, loading, fetchTasks } = useTasks();
  const [showForm, setShowForm] = useState(false); 
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { fetchTasks(); }, [fetchTasks]); // Runs when component mounts
  // Fetches all tasks from backend

  const handleEdit = (task) => {
    setEditingTask(task); // set task to edit
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  // stats for the side panel
  const totalTasks = stats?.total || 0;
  const completedTasks = stats?.completed || 0;
  const pendingTasks = stats?.pending || 0;
  // Progress percentage: (completed / total) * 100
  // Example: 5 completed out of 10 → 50%
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* main content */}
      <div className="flex-1 min-w-0">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Task Overview
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your tasks efficiently</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-primary hover:bg-blue-glow text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            + Add New Task
          </button>
        </div>

        <StatsCards />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-blue-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <TaskList tasks={tasks} title="Tasks" onEdit={handleEdit} />
        )}
      </div>

      {/* right sidebar - stacks below on mobile, side panel on lg+ */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
        {/* task statistics */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Task Statistics
          </h3>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold text-blue-400">● {totalTasks}</p>
              <p className="text-xs text-gray-500">TOTAL TASKS</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">● {completedTasks}</p>
              <p className="text-xs text-gray-500">COMPLETED</p>
            </div>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-red-400">● {pendingTasks} Pending</span>
            <span className="text-blue-400">{progress}% PROGRESS</span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-1.5 mb-3">
            <div className="bg-blue-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-600">Global Progress: {completedTasks} / {totalTasks}</p>
        </div>

        {/* recent activity */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
          {tasks.length > 0 ? (
            <div className="space-y-2 text-xs text-gray-500">
              {tasks.slice(-3).reverse().map(t => (
                <p key={t._id}>{t.completed ? '✅' : '📝'} {t.title}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No recent activity.</p>
          )}
        </div>
      </div>

      {showForm && <TaskFormModal task={editingTask} onClose={handleCloseForm} />}
    </div>
  );
}
