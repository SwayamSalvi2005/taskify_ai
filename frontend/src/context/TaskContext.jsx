import { createContext, useContext, useState, useCallback } from 'react';
import { getTasks, getTaskStats, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from '../api/taskApi';

// create context to storet task data
const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]); // intial empty array to store tasks 
  const [stats, setStats] = useState(null); // store task stasts
  const [loading, setLoading] = useState(false); // loading to show tasks are begin fetched

  // fetch all tasks from backend
  // accepts optional query params like { completed, priority, sortBy, search }
  const fetchTasks = useCallback(async (query = {}) => {
    try {
      setLoading(true); // indicate task being fetched
      const res = await getTasks(query);
      setTasks(res.data.tasks || []); // no tasks use undefined
      setStats(res.data.stats || null); // no stats null
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch just the stats (used by dashboard stats cards)
  const fetchStats = useCallback(async () => {
    try {
      const res = await getTaskStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // create a new task
  const createTask = async (taskData) => {
    try {
      const res = await apiCreateTask(taskData);
      // add the new task to our local list
      setTasks(prev => [...prev, res.data.task]); 
      // refresh stats
      fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to create task:', err);
      return false;
    }
  };

  // update an existing task
  const updateTask = async (id, updates) => {
    try {
      const res = await apiUpdateTask(id, updates);
      // replace the old task with the updated one in our list
      setTasks(prev => prev.map(t => t._id === id ? res.data.updatedtask : t));
      // refresh stats
      fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to update task:', err);
      return false;
    }
  };

  // delete a task
  const deleteTask = async (id) => {
    try {
      await apiDeleteTask(id);
      // remove from local list
      setTasks(prev => prev.filter(t => t._id !== id));
      // refresh stats
      fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      return false;
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks, stats, loading,
      fetchTasks, fetchStats, createTask, updateTask, deleteTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

// custom hook
export function useTasks() {
  return useContext(TaskContext);
}
