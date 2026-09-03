import { useState } from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, title, onEdit }) {
  const [search, setSearch] = useState(''); 
  const [sortBy, setSortBy] = useState('createdAt');
  const [priorityFilter, setPriorityFilter] = useState('All'); // All - low, medium, high
  
  // 1. filter by priority
  const afterPriority = tasks.filter(t => {
    if (priorityFilter === 'All') return true;  // return all task 
    return t.priority === priorityFilter; // return only task with matching priorty
  });

  // 2. filter by search text (title or description)
  const afterSearch = afterPriority.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  // 3. sort
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === 'priority') {
      const weight = { High: 3, Medium: 2, Low: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    }
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate); // high to low
    return new Date(b.createdAt) - new Date(a.createdAt); // default: newest first
  });

  const sortOptions = [
    { value: 'createdAt', label: 'Created At' },
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
  ];

  // priority filter buttons with their colors
  const priorityButtons = [
    { label: 'All',    dot: 'bg-gray-400' },
    { label: 'Low',    dot: 'bg-green-400' },
    { label: 'Medium', dot: 'bg-orange-400' },
    { label: 'High',   dot: 'bg-red-400' },
  ];

  return (
    <div className="mt-6">
      {/* toolbar */}
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {title}
          {/* show count of results */}
          <span className="ml-1 text-gray-600 font-normal">({sorted.length})</span>
        </h3>

        {/* search + sort row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* search box */}
          <div className="relative">
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-52 bg-dark-card border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-primary"
            />
            {/* clear search button — shows when there's text */}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* sort buttons */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            <span className="text-gray-500 mr-1 whitespace-nowrap">↕ Sort:</span>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  sortBy === opt.value ? 'bg-blue-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* priority filter buttons */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          <span className="text-gray-500 whitespace-nowrap">🎯 Priority:</span>
          {priorityButtons.map(btn => (
            <button
              key={btn.label}
              onClick={() => setPriorityFilter(btn.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap border transition-colors ${
                priorityFilter === btn.label
                  ? 'bg-dark-hover border-dark-border text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${btn.dot}`}></span>
              {btn.label}
            </button>
          ))}

          {/* clear all filters button — only shows when filters are active */}
          {(priorityFilter !== 'All' || search) && (
            <button
              onClick={() => { setPriorityFilter('All'); setSearch(''); }}
              className="text-gray-500 hover:text-red-400 transition-colors ml-1 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* task cards */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          {search || priorityFilter !== 'All'
            ? 'No tasks match your filters.'
            : 'No tasks found. Enjoy your free time! 🎉'
          }
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(task => (
            <TaskCard key={task._id} task={task} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
