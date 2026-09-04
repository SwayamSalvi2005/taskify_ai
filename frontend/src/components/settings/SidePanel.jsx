import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';

// right sidebar with account activity + danger zone
export default function SidePanel() {
  const { user, deleteAccount } = useAuth();
  const { stats } = useTasks();
  const navigate = useNavigate();

  // join date formatted nicely
  //Converts: "2026-12-01T00:00:00.000Z" → "December 2026"
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  // delete account flow
 const handleDelete = async () => {
    // Step 1: Ask for password
    const pwd = prompt('Enter your current password to delete your account:');
    if (!pwd) return;  // User cancelled or entered empty
    // Step 2: Final confirmation
    if (!confirm('Are you sure? This cannot be undone.')) return;
    // Step 3: Call API to delete account
    const ok = await deleteAccount(pwd);

    // Step 4: Redirect to login if successful
    if (ok) navigate('/login');
  };
  
  return (
    <div className="space-y-4">
      {/* account activity */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">⭐ Account Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-400">Joined</span>
            <span className="text-white">{joinDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400">Tasks Done</span>
            <span className="text-white">{stats?.completed || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400">Total Tasks</span>
            <span className="text-white">{stats?.total || 0}</span>
          </div>
        </div>
      </div>

      {/* danger zone */}
      <div className="bg-dark-card border border-red-900/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ Danger Zone</h3>
        <p className="text-xs text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
        <button onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
