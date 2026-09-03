import { useTasks } from '../../context/TaskContext';

export default function TaskCard({ task, onEdit }) {
    const { updateTask, deleteTask } = useTasks(); // get from context

    // toggle completion status
    const handleToggle = () => {
    updateTask(task._id, { completed: !task.completed });
    };


    const today = new Date();
    today.setHours(0, 0, 0, 0); // strip time so we compare dates only
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const isOverdue = !task.completed && dueDate < today;

    const priorityStyles = {
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

      // only overdue tasks get a red left border, otherwise use priority color
    const borderColor = {
        Low: 'border-l-green-500',
        Medium: 'border-l-orange-500',
        High: 'border-l-red-500',
    };

    // formatDate('2026-01-01')  // "Jan 1, 2026"
    const formatDate = (dateStr) => {
     return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    
    return (
    <div className={`bg-dark-card border border-dark-border rounded-xl p-3 sm:p-4 border-l-4 transition-colors
      ${isOverdue ? 'border-l-red-600 bg-red-950/20' : borderColor[task.priority] || 'border-l-gray-500'}
      hover:bg-dark-hover
    `}>
      <div className="flex items-start gap-2 sm:gap-3">
        {/* toggle complete circle */}
        <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
          {task.completed ? (
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className={`w-5 h-5 rounded-full border-2 transition-colors
              ${isOverdue ? 'border-red-500' : 'border-gray-500 hover:border-blue-primary'}
            `}></div>
          )}
        </button>

        {/* task info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">

            {/* title — strikethrough if completed */}
            <h3 className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h3>

            {/* priority badge */}
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${priorityStyles[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>

            {/* overdue badge — only shown if task missed its due date */}
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 rounded border font-medium bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                OVERDUE
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* dates + action buttons row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">

            {/* due date — red if overdue */}
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {formatDate(task.dueDate)}
            </span>

            {/* created date — hidden on very small screens */}
            <span className="hidden sm:flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created {formatDate(task.createdAt)}
            </span>

            {/* edit + delete buttons */}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => onEdit(task)} className="p-1.5 text-gray-500 hover:text-blue-primary rounded transition-colors" title="Edit">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => deleteTask(task._id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors" title="Delete">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}


