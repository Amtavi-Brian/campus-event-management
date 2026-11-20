import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../../components/events/EventCard'
import useAuth from '../../hooks/useAuth'
import { getEvents } from '../../services/eventService'
import { getTasks } from '../../services/taskService'
import { getGuests } from '../../services/guestService'
import '../../styles/dashboard/Dashboard.css'

function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    Promise.allSettled([getEvents(), getTasks(), getGuests()])
      .then(([eventsResult, tasksResult, guestsResult]) => {
        if (!isActive) return

        if (eventsResult.status === 'fulfilled') {
          const raw = eventsResult.value
          setEvents(Array.isArray(raw) ? raw : raw.results || [])
        }

        if (tasksResult.status === 'fulfilled') {
          const raw = tasksResult.value
          setTasks(Array.isArray(raw) ? raw : raw.results || [])
        }

        if (guestsResult.status === 'fulfilled') {
          const raw = guestsResult.value
          setGuests(Array.isArray(raw) ? raw : raw.results || [])
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const userName = user?.first_name || user?.username || 'Planner'

  // Calculate dynamic stats
  const totalEvents = events.length
  const pendingTasks = tasks.filter(
    (t) =>
      t.status === 'PENDING' ||
      t.status === 'IN_PROGRESS' ||
      t.status === 'Pending'
  ).length
  const totalGuests = guests.length

  // Filter events happening this week
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const thisWeekCount = events.filter((e) => {
    if (!e.event_date) return false
    const d = new Date(e.event_date)
    return d >= now && d <= nextWeek
  }).length

  const stats = [
    { label: 'Total Events', value: totalEvents, icon: '📅', color: 'purple' },
    { label: 'Pending Tasks', value: pendingTasks, icon: '✅', color: 'green' },
    { label: 'Total Guests', value: totalGuests, icon: '👥', color: 'blue' },
    { label: 'This Week', value: thisWeekCount, icon: '🗓️', color: 'orange' },
  ]

  // Prepare upcoming events (up to 4)
  const formattedUpcoming = events.slice(0, 4).map((evt) => ({
    id: evt.id,
    title: evt.title,
    date: evt.event_date || 'TBD',
    time: evt.event_time?.slice(0, 5) || '',
    location: evt.location,
    tasksRemaining: evt.pending_tasks_count ?? 0,
    guests: evt.guests_count ?? 0,
    emoji: '🎉',
    color: 'purple',
  }))

  return (
    <div>
      <h1 className="dashboard__greeting">Welcome back, {userName} 👋</h1>
      <p className="dashboard__subtitle">
        Here&apos;s what&apos;s happening with your events
      </p>

      <div className="dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dashboard__stat-card">
            <span
              className={`dashboard__stat-icon dashboard__stat-icon--${stat.color}`}
            >
              {stat.icon}
            </span>
            <p className="dashboard__stat-value">
              {isLoading ? '...' : stat.value}
            </p>
            <p className="dashboard__stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Upcoming Events</h2>
          <Link to="/dashboard/events" className="btn-link">
            View all
          </Link>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading events...</p>
        ) : formattedUpcoming.length > 0 ? (
          <div className="dashboard__events-list">
            {formattedUpcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No events scheduled yet. Create your first event!</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
