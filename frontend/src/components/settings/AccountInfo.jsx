import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// handles name and email updates
export default function AccountInfo() {
  const { user, updateProfile, error } = useAuth(); //get data form auth context
  const [name, setName] = useState(user?.name || ''); 
  const [email, setEmail] = useState(user?.email || '');
  const [msg, setMsg] = useState('');   // Success message: "Profile updated!"
  const [saving, setSaving] = useState(false);   // Loading state for submit button (disables button)

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); //Disable submit button
    setMsg('');
    const ok = await updateProfile(name, email);
    setSaving(false); /// Re-enable submit button
    if (ok) setMsg('Profile updated!');
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            {/* User Icon */}
        <svg className="w-4 h-4 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Account Information
      </h2>
        {/*success or error message */}
      {msg && <p className="text-green-400 text-sm mb-3">{msg}</p>}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-primary" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-primary hover:bg-blue-glow text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
