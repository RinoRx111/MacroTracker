import React, { useState } from 'react';
import { authApi, storeAuth } from '../api/authApi';

const INPUT = "w-full px-4 py-3 rounded-xl bg-[var(--bg-card-tint)] border border-[var(--border-main)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition";

export const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await authApi.register({
          username: form.username,
          email: form.email,
          password: form.password,
          full_name: form.full_name || undefined,
        });
      } else {
        res = await authApi.login({
          username: form.username,
          password: form.password,
        });
      }
      storeAuth(res.data);
      onAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-card-tint)] border border-[var(--border-main)] mb-4">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            MacroTracker
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm">Professional nutrition tracking</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-[var(--bg-card-tint)] rounded-xl p-1 mb-6 border border-[var(--border-main)]">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m
                    ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={set('full_name')}
                  className={INPUT}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={form.username}
                onChange={set('username')}
                required
                minLength={3}
                className={INPUT}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  className={INPUT}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Password</label>
              <input
                type="password"
                placeholder={mode === 'register' ? 'Min. 8 characters' : 'Your password'}
                value={form.password}
                onChange={set('password')}
                required
                minLength={mode === 'register' ? 8 : 1}
                className={INPUT}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-[rgba(255,107,92,0.1)] border border-[var(--warning-state)] rounded-xl px-4 py-3">
                <span className="text-[var(--warning-state)] text-sm mt-0.5">⚠</span>
                <p className="text-[var(--warning-state)] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] text-xs mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-[var(--accent-primary)] hover:underline font-semibold"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-xs mt-6">
          Your first account becomes the active profile
        </p>
      </div>
    </div>
  );
};
