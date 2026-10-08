import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../context/UserContext'

// Set a new password. Reached two ways:
//  - from the "reset your password" email: Supabase's link signs the person
//    in with a short-lived recovery session (picked up automatically from
//    the URL by the Supabase client), and lands them here;
//  - from Settings → "Change password" while already signed in.
// Either way there's a signed-in user, so updateUser() can set the password.
export default function ResetPassword() {
  const { user, loading } = useUser()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError("Passwords don't match"); return }
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (updateError) { setError(updateError.message); return }
    setDone(true)
    setTimeout(() => navigate('/portfolio'), 1500)
  }

  const inputClass = 'border border-gray-200 rounded px-4 py-3 text-sm outline-none focus:border-black transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">Set a new password</h1>

        {loading ? (
          <p className="text-center text-sm text-gray-400 mt-6">Checking your link…</p>
        ) : !user ? (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-4">
              This reset link is invalid or has expired. Reset links only work once and for a limited time.
            </p>
            <Link to="/signup?forgot=1" className="text-black underline text-sm">Send a new reset link</Link>
          </div>
        ) : done ? (
          <p className="text-center text-sm text-gray-500 mt-6">Password updated. Taking you to your portfolio…</p>
        ) : (
          <>
            <p className="text-center text-sm text-gray-400 mb-8">for {user.email}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-gray-400">New password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-widest text-gray-400">Confirm new password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white py-3 rounded text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
