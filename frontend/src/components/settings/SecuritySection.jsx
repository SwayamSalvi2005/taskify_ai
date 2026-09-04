import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// handles password change form
export default function SecuritySection() {
  const { updatePassword } = useAuth(); // get form context
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (newPassword !== confirmPassword) { setMsg('Passwords do not match.'); return; }

    setSaving(true);// Disable submit button
    const ok = await updatePassword(currentPassword, newPassword); // call api
    setSaving(false);   // Re-enable submit button

    if (ok) {
      setMsg('Password updated!');
      setCurrentPassword(''); 
      setNewPassword(''); 
      setConfirmPassword(''); //clear all after process
    }
      // If error, AuthContext handles it (no error state here)
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        {/* Lock Icon */}
        <svg className="w-4 h-4 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Security
      </h2>

      {msg && <p className={`text-sm mb-3 ${msg.includes('match') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
        </div>
        {/* stacks on mobile, side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-primary hover:bg-blue-glow text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto">
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
