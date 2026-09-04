import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';
import AccountInfo from '../components/settings/AccountInfo';
import SecuritySection from '../components/settings/SecuritySection';
import SidePanel from '../components/settings/SidePanel';

export default function Settings() {
  const { user, clearError } = useAuth();
  const { fetchStats } = useTasks();
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); clearError(); }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-white mb-4">← Back</button>

      {/* header - stacks on mobile */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-primary flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Profile Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your account and security.</p>
        </div>
      </div>

      {/* two column → stacks on mobile */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <AccountInfo />
          <SecuritySection />
        </div>
        <div className="w-full lg:w-72 flex-shrink-0">
          <SidePanel />
        </div>
      </div>
    </div>
  );
}
