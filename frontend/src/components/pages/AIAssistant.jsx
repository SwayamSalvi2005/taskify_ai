import { useRef, useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../api/taskApi';

export default function AIAssistant() {
  const { fetchTasks } = useTasks();

  // CHANGED: Pull chatHistory and setChatHistory from AuthContext instead of local useState.
  // This means the chat messages survive navigation (Dashboard → Chat → Dashboard → Chat).
  // The history is cleared only when the user logs out (handled in AuthContext.logout()).
  const { chatHistory: messages, setChatHistory: setMessages } = useAuth();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');

    // Add the user's message to context (persists across navigation)
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setSending(true);

    try {
      // Send the full conversation history to the backend so Gemini has context
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({ role: m.role, text: m.text }));

      const res = await sendChatMessage(userMessage, history);

      // Add AI reply to context (also persists across navigation)
      setMessages(prev => [...prev, { role: 'model', text: res.data.data.aiResponse }]);

      // If Gemini created/updated/deleted a task, refresh the task list
      if (res.data.data.taskActionPerformed) fetchTasks();

    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-7.5rem)]">
      {/* header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-primary/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white">AI Assistant</h1>
          <p className="text-xs text-gray-500">Powered by Gemini — knows your tasks</p>
        </div>
      </div>

      {/* chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-primary text-white rounded-br-md'
                : 'bg-dark-card border border-dark-border text-gray-300 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* input */}
      <form onSubmit={handleSend} className="mt-3 sm:mt-4">
        <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl px-3 sm:px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your tasks..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none min-w-0"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()}
            className="text-blue-primary hover:text-blue-400 disabled:text-gray-600 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
