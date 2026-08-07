import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function Signup() {
  const { signUp, signIn } = useUser()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

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
