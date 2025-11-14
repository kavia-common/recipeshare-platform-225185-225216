'use client';

import React, { useState } from 'react';
import { z } from 'zod';

type Mode = 'login' | 'signup';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface AuthFormProps {
  mode: Mode;
}

/**
 * PUBLIC_INTERFACE
 * AuthForm
 * A simple authentication form supporting 'login' and 'signup' with client validation.
 */
export default function AuthForm({ mode }: AuthFormProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const schema = isSignup ? signupSchema : loginSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return false;
    }
    setErrors([]);
    return true;
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setNotice(null);

    try {
      if (isSignup) {
        const resp = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        });

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data?.error || 'Signup failed');
        }
        setNotice('Signup successful. You can now sign in.');
      } else {
        // In pure Express this won't function; with NextAuth, signIn('credentials') would be used.
        const resp = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            csrfToken: '',
            email: form.email,
            password: form.password,
          }).toString(),
        });
        if (!resp.ok) {
          throw new Error('Login failed');
        }
        setNotice('Login successful.');
      }
    } catch (err: any) {
      setErrors([err?.message || 'Something went wrong']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{
      background: '#ffffff',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.12)',
      maxWidth: 420
    }}>
      <h2 style={{ marginBottom: 16, color: '#111827' }}>
        {isSignup ? 'Create your FlavorFolio account' : 'Welcome back'}
      </h2>

      {isSignup && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: 6, color: '#111827' }}>Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jamie Oliver"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e5e7eb', outlineColor: '#2563EB'
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 6, color: '#111827' }}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e5e7eb', outlineColor: '#2563EB'
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: 6, color: '#111827' }}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="********"
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e5e7eb', outlineColor: '#2563EB'
          }}
        />
      </div>

      {!!errors.length && (
        <div style={{ background: '#FEF2F2', color: '#EF4444', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {errors.map((e, idx) => <div key={idx}>{e}</div>)}
        </div>
      )}

      {notice && (
        <div style={{ background: '#ECFDF5', color: '#2563EB', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {notice}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: '#2563EB',
          color: 'white',
          padding: '10px 14px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
      </button>
    </form>
  );
}
