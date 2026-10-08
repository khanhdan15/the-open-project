import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const { signUp, signIn } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // "Forgot password" view — opened from the sign-in form, or directly via
  // /signup?forgot=1 (the link on an expired reset page).
  const [forgot, setForgot] = useState(() => searchParams.get('forgot') === '1')
  const [resetSent, setResetSent] = useState(false)
  const [isLogin, setIsLogin] = useState(() => searchParams.get('forgot') === '1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSendReset = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.email.trim()) { setError('Enter the email you signed up with'); return }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    setResetSent(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(form.email, form.password)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      if (!form.name.trim()) { setError('Name is required'); setLoading(false); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) { setError(error.message); setLoading(false); return }
    }

    setLoading(false)
    navigate('/portfolio')
  }

  if (forgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl mb-2 text-center">Reset password</h1>
          {resetSent ? (
            <p className="text-center text-sm text-gray-500 mt-6 mb-8">
              If an account exists for {form.email.trim()}, a reset link is on its way. Check your inbox (and spam folder),
              then follow the link to choose a new password.
            </p>
          ) : (
            <>
              <p className="text-center text-sm text-gray-400 mb-8">
                Enter your account email and we'll send you a link to set a new password.
              </p>
              <form onSubmit={handleSendReset} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white py-3 rounded text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
          <p className="text-center text-sm text-gray-400 mt-6">
            <button
              onClick={() => { setForgot(false); setResetSent(false); setIsLogin(true); setError(null) }}
              className="text-black underline"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">
          {isLogin ? 'Sign in to your account' : 'Join Open Ruler'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-400">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-400">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-400">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
            {isLogin && (
              <button
                type="button"
                onClick={() => { setForgot(true); setError(null) }}
                className="self-end text-xs text-gray-400 underline mt-1 hover:text-black"
              >
                Forgot password?
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 rounded text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null) }}
            className="text-black underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
