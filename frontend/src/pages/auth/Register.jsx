import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import '../../styles/auth/AuthPage.css'

function Register() {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      // Attempt automatic login after registration
      try {
        await login({
          email: formData.email,
          password: formData.password,
        })
        navigate('/dashboard')
      } catch {
        navigate('/login', { state: { registered: true } })
      }
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'string') {
        setError(data)
      } else if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ')
        setError(messages || 'Registration failed. Please check your information.')
      } else {
        setError('Unable to register. Please check your connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left branding panel (desktop) */}
      <div className="auth-page__branding">
        <div>
          <div className="auth-page__logo">
            <span className="auth-page__logo-icon">📅</span>
            <span className="auth-page__logo-text">EventPlan</span>
          </div>
          <p className="auth-page__tagline">
            Plan &bull; Organize &bull; Make it Happen
          </p>
        </div>

        <div>
          <h1 className="auth-page__headline">
            Your perfect events, well planned.
          </h1>
        </div>

        <div className="auth-page__illustration">📅</div>
      </div>

      {/* Right form panel */}
      <div className="auth-page__form-panel">
        {/* Mobile-only compact header (replaces the dark branding panel below md) */}
        <div className="auth-page__mobile-header">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="auth-page__back"
            aria-label="Go back"
          >
            ‹
          </button>
          <div className="auth-page__mobile-brand">
            <span className="auth-page__mobile-icon">📅</span>
            <span className="auth-page__mobile-title">EventPlan</span>
            <p className="auth-page__mobile-tagline">
              Plan &bull; Organize &bull; Make it Happen
            </p>
          </div>
        </div>

        <div className="auth-page__content">
          <h2 className="auth-page__title">Create Your Account</h2>
          <p className="auth-page__subtitle">
            Join EventPlan and start planning your events
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="auth-page__password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="auth-page__toggle-visibility"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="auth-page__password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="auth-page__toggle-visibility"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <p className="auth-page__error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-page__footer">
            Already have an account?{' '}
            <Link to="/login" className="btn-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
