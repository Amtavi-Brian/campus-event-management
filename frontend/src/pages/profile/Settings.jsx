import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import '../../styles/profile/Settings.css'

function SettingsForm({ user, updateProfile }) {
  const initialName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || ''

  const [formData, setFormData] = useState({
    fullName: initialName,
    email: user?.email || '',
    phone: user?.phone_number || '',
    bio: '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSaved(false)

    try {
      const parts = formData.fullName.trim().split(' ')
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''

      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone_number: formData.phone,
      })

      setSaved(true)
    } catch (err) {
      console.error('Failed to update profile:', err)
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' ')
        setError(msgs)
      } else {
        setError('Unable to save changes. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePhoto = () => {
    alert('Profile photo upload will be available in an upcoming update.')
  }

  const initials = formData.fullName
    ? formData.fullName
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="settings-page">
      <h1 className="page-title-standalone">Profile Settings</h1>
      <p className="page-subtitle">
        Manage your personal information and how it appears across EventPlan.
      </p>

      <div className="settings-card">
        {/* Profile summary */}
        <section className="settings-section settings-section--profile">
          <div className="settings-avatar">
            <span className="settings-avatar__initials">{initials}</span>
            <button
              type="button"
              onClick={handleChangePhoto}
              className="settings-avatar__edit"
              aria-label="Change photo"
              title="Change photo"
            >
              📷
            </button>
          </div>
          <div className="settings-profile-info">
            <p className="settings-profile-info__name">{formData.fullName}</p>
            <p className="settings-profile-info__email">{formData.email}</p>
            <div className="settings-profile-info__actions">
              <button
                type="button"
                onClick={handleChangePhoto}
                className="btn btn-secondary btn-sm"
              >
                Change Photo
              </button>
              <button type="button" className="btn btn-link btn-sm">
                Remove
              </button>
            </div>
          </div>
        </section>

        <div className="settings-divider" />

        {/* Personal information */}
        <form onSubmit={handleSubmit}>
          <section className="settings-section">
            <h2 className="settings-section__title">Personal Information</h2>
            <p className="settings-section__hint">
              This information will be displayed on your profile and event invitations.
            </p>

            <div className="form-row form-group">
              <div>
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell others a little about yourself..."
                className="form-textarea"
              />
              <p className="settings-section__hint settings-section__hint--tight">
                Brief description for your profile. Maximum 160 characters.
              </p>
            </div>
          </section>

          {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          <div className="settings-footer">
            {saved && (
              <span className="settings-saved">
                <span className="settings-saved__icon">✓</span>
                Changes saved
              </span>
            )}
            <div className="settings-footer__buttons">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Settings() {
  const { user, updateProfile } = useAuth()
  return <SettingsForm key={user?.id || 'guest'} user={user} updateProfile={updateProfile} />
}

export default Settings
