import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// icon components
// the sqared icon for dashboard
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
// clock symbol
function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
// completed tick mark
function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
// chat icon
function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
// logout button icon
function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
// name the icons with routing to specific pages
const navItems = [
  { to: '/',          label: 'Dashboard',       icon: <DashboardIcon /> },
  { to: '/pending',   label: 'Pending Tasks',   icon: <ClockIcon /> },
  { to: '/completed', label: 'Completed Tasks',  icon: <CheckIcon /> },
  { to: '/ai',        label: 'AI Assistant',     icon: <ChatIcon /> },
];

// onClose: Function passed from parent to close sidebar on mobile
export default function Sidebar({ onClose }) {
  const { logout } = useAuth(); // get logout from auth context
  const navigate = useNavigate(); // hook for navigation

  // when logout press, use the logout fucntion and navigate to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // close sidebar on mobile when a link is clicked
  const handleNavClick = () => {
    if (onClose) onClose(); // onClose exists, call it
  };

  return (
    <aside className="w-56 bg-dark-card border-r border-dark-border flex flex-col h-screen">
      {/* blu logo - lighting */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </div>
          {/* Brand Name */}
          <span className="text-lg font-bold text-white">Taskify.AI</span>
        </div>
        {/* close button, only visible on mobile */}
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* nav links */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to} // unique key for react
            to={item.to} // url path (/, /pending ...)
            end={item.to === '/'} // should be exact match dashbaord
            onClick={handleNavClick} // close sidebar for mobile
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* bottom section */}
      <div className="p-3 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-400 hover:text-green-300 hover:bg-dark-hover w-full transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
        <p className="text-xs text-gray-600 mt-3 px-3">
          Made with Coffee ☕️ by<br />
          <span className="text-gray-500">Swayam Salvi</span>
        </p>
      </div>
    </aside>
  );
}
