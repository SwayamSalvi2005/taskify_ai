import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

 // onMenuClick: Function from parent to open sidebar on mobile
export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // create user name initial
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="h-14 bg-dark-card border-b border-dark-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      {/* left side: hamburger (mobile) + greeting */}
      <div className="flex items-center gap-3">
        {/* hamburger menu button - only on mobile */}
        <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* User greet and msg */}
        <div>
          <h2 className="text-sm font-semibold text-white">Hey, {user?.name || 'there'}</h2>
          <p className="text-xs text-gray-500 hidden sm:block">✨ Let's get some work done</p>
        </div>
      </div>

      {/* right side: settings + user */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* user name + avatar */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-primary flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
