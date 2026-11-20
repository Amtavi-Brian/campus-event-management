import useAuth from '../../hooks/useAuth'
import '../../styles/common/Navbar.css'

function Navbar({ userName }) {
  const { user } = useAuth()
  const displayName =
    userName ||
    (user?.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user?.username || 'User')

  const initial = displayName.charAt(0).toUpperCase() || 'U'

  return (
    <header className="navbar">
      <div className="navbar__search">
        <span className="navbar__search-icon">🔍</span>
        <input
          type="search"
          placeholder="Search..."
          className="navbar__search-input"
        />
      </div>

      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__bell"
          aria-label="Notifications"
        >
          🔔
        </button>
        <div className="navbar__user">
          <span className="navbar__avatar">{initial}</span>
          <span className="navbar__username">{displayName}</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
