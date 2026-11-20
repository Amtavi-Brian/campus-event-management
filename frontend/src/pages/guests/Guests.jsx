import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GuestItem from '../../components/guests/GuestItem'
import { deleteGuest, getGuests } from '../../services/guestService'

function Guests() {
  const [guests, setGuests] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchGuests = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getGuests()
        if (isActive) {
          setGuests(Array.isArray(data) ? data : data.results || [])
        }
      } catch (err) {
        console.error('Failed to load guests:', err)
        if (isActive) {
          setError('Unable to load guests. Please try again.')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchGuests()

    return () => {
      isActive = false
    }
  }, [])

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return guests
    return guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        (guest.event_title && guest.event_title.toLowerCase().includes(query))
    )
  }, [guests, search])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this guest?')) return

    try {
      await deleteGuest(id)
      setGuests((prev) => prev.filter((guest) => guest.id !== id))
    } catch (err) {
      console.error('Failed to delete guest:', err)
      alert('Unable to remove guest. Please try again.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Guests</h1>
        <Link to="/dashboard/guests/new" className="btn btn-primary">
          + Add Guest
        </Link>
      </div>

      <div className="search-field search-field--spaced">
        <span className="search-field__icon">🔍</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests..."
          className="search-field__input"
        />
      </div>

      <div className="table-card">
        {isLoading ? (
          <p className="empty-state">Loading guests...</p>
        ) : error ? (
          <p className="empty-state" role="alert">{error}</p>
        ) : filteredGuests.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>RSVP Status</th>
                <th className="table-cell--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <GuestItem
                  key={guest.id}
                  guest={guest}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">
            {search ? 'No guests match your search.' : 'No guests available yet.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default Guests
