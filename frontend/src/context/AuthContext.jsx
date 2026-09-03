import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getMe, registerUser, loginUser, updateProfile, updatePassword, deleteAccount } from '../api/authApi';

// create context to hold auth data
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // stores user data
  const [loading, setLoading] = useState(true); // indicate auth loading in progress
  const [error, setError] = useState(null); // stores error messages

  // initial/welcome message for the chat 
  const INITIAL_MESSAGE = [
    { role: 'model', text: "Hi there! 👋 I'm your TaskFlow AI assistant powered by Gemini. I have access to all your tasks — ask me anything like \"What's due today?\", \"Summarize my high priority tasks\", or \"How am I doing on my goals?\" I can also create, update, or delete tasks for you — just ask!" }
  ];
  // stores chat history, persitss when regresh
  const [chatHistory, setChatHistory] = useState(INITIAL_MESSAGE);

  // run onces on mount, check is jwt is stored in lcoal storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      getMe()
        // if user exists attach to res
        .then(res => setUser(res.data.user))
        .catch(() => {
          // token expired or invalid, clean up
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false)); // token correct loading stop
    } else {
      setLoading(false);
    }
  }, []);

  // register a new user
  const register = async (name, email, password) => {
    try {
      setError(null);
      await registerUser(name, email, password);

      // user need to verify before login
      return 'verify_email'; // signal to Register page to show the check-your-email screen
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // login an existing user
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await loginUser(email, password);

      // save token and set user
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // logout — clear token, user, and chat history
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setChatHistory(INITIAL_MESSAGE); // clear chat so next user's session starts fresh
  };

  // update user profile (name, email)
  const updateUserProfile = async (name, email) => {
    try {
      setError(null);
      const res = await updateProfile(name, email);
      setUser(res.data.user); // set updated user
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  // update password
  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await updatePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
      return false;
    }
  };

  // delete account
  const deleteUserAccount = async (currentPassword) => {
    try {
      setError(null);
      await deleteAccount(currentPassword);
      // after deletion, logout
      logout();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      return false;
    }
  };

  // clear error // helper function
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      register, login, logout,
      updateProfile: updateUserProfile,
      updatePassword: updateUserPassword,
      deleteAccount: deleteUserAccount,
      clearError,
      chatHistory, setChatHistory  // expose chat state to AIAssistant page
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook so we dont have to import useContext everywhere
export function useAuth() {
  return useContext(AuthContext);
}
