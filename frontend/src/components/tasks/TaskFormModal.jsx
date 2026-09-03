import { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';

// modal form for creating or editing a task
export default function TaskFormModal({ task, onClose }) {
  const { createTask, updateTask } = useTasks(); // from context
  // !!task converts task to boolean: true if task exists, false if null/undefined
  const isEditing = !!task;

  const [title, setTitle] = useState(''); // store title
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // default medium
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false); // loading for submit

  // Runs when 'task' prop changes (opens modal with task data)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    } else {
        // CREATE MODE: Set default due date to today by default
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  }, [task]); // Re-run when task changes

  const handleSubmit = async (e) => {
    e.preventDefault();// Prevent page refresh
    setSaving(true); // Disable submit button, show loading state
    const data = { title, description, priority, dueDate };
    const ok = isEditing ? await updateTask(task._id, data) : await createTask(data);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-dark-card border border-dark-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-dark-border sticky top-0 bg-dark-card rounded-t-2xl z-10">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="px-4 sm:px-5 pt-3 text-xs text-gray-500">Organize your workflow with precision.</p>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Task Title</label>
            <input type="text" required minLength={3} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize Brand Identity System"
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-primary" />
          </div>

          {/* due date + priority - stacks on very small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
              <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority Level</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary">
                <option value="Low">● Low</option>
                <option value="Medium">● Medium</option>
                <option value="High">● High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context or sub-tasks..."
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-primary resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="bg-blue-primary hover:bg-blue-glow text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : (isEditing ? 'Save Changes' : '+ Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
