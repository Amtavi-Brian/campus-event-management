
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EventGridCard from '../../components/events/EventGridCard'
import { getEvents } from '../../services/eventService'
import '../../styles/events/Events.css'

function Events() {
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch events from Django
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError('')

        const data = await getEvents()

        const eventList = Array.isArray(data)
          ? data
          : data.results || []

        const formattedEvents = eventList.map((event) => ({
          ...event,
          date: event.event_date,
          time: event.event_time?.slice(0, 5),
          maxGuests: event.maximum_guests,
        }))

        setEvents(formattedEvents)
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setError('Unable to load events. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Search events
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return events

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
    )
  }, [search, events])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Events</h1>

        <Link to="/dashboard/events/new" className="btn btn-primary">
          + Create Event
        </Link>
      </div>

      <div className="search-field search-field--spaced">
        <span className="search-field__icon">🔍</span>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="search-field__input"
        />
      </div>

      {isLoading ? (
        <p className="empty-state">Loading events...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : filteredEvents.length > 0 ? (
        <div className="events-page__grid">
          {filteredEvents.map((event) => (
            <EventGridCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {search
            ? 'No events match your search.'
            : 'No events available yet.'}
        </p>
      )}
    </div>
  )
}

export default Events
