import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import TaskItem from '../../components/tasks/TaskItem'
import EventStatus from '../../components/events/EventStatus'
import { deleteEvent, getEvent, getEventErrorMessage } from '../../services/eventService'
import { getTasks, updateTask } from '../../services/taskService'
import { getGuests } from '../../services/guestService'
import '../../styles/events/EventDetails.css'

const tabs = ['Tasks', 'Guests', 'Details']

function EventDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Tasks')
  const [event, setEvent] = useState(null)
  const [tasks, setTasks] = useState([])
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [eventData, taskData, guestData] = await Promise.all([
          getEvent(id),
          getTasks({ event_id: id }),
          getGuests({ event_id: id }),
        ])

        if (!isActive) return

        setEvent(eventData)
        const taskList = Array.isArray(taskData) ? taskData : taskData.results || []
        setTasks(
          taskList.map((t) => ({
            ...t,
            completed: t.status === 'COMPLETED' || t.status === 'Completed',
          }))
        )

        const guestList = Array.isArray(guestData) ? guestData : guestData.results || []
        setGuests(guestList)
      } catch (err) {
        console.error('Failed to load event details:', err)
        if (isActive) {
          setError(getEventErrorMessage(err))
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [id])

  const handleToggleTask = async (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const newCompleted = !targetTask.completed
    const newStatus = newCompleted ? 'COMPLETED' : 'PENDING'

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted, status: newStatus } : t
      )
    )

    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      console.error('Failed to update task:', err)
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? targetTask : t))
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await deleteEvent(id)
      navigate('/dashboard/events')
    } catch (err) {
      alert(getEventErrorMessage(err))
    }
  }

  if (isLoading) {
    return <p className="empty-state">Loading event details...</p>
  }

  if (error || !event) {
    return (
      <div>
        <Link to="/dashboard/events" className="back-link">
          ← Back to My Events
        </Link>
        <p className="empty-state" role="alert">{error || 'Event not found.'}</p>
      </div>
    )
  }

  const formattedDate = event.event_date || 'Date TBD'
  const formattedTime = event.event_time?.slice(0, 5) || 'Time TBD'

  return (
    <div>
      <Link to="/dashboard/events" className="back-link">
        ← Back to My Events
      </Link>

      {/* Header */}
      <div className="event-details__header">
        <div className="event-details__title-block">
          <div className="event-details__thumbnail">🎉</div>
          <div>
            <h1 className="event-details__title">{event.title}</h1>
            <p className="event-details__meta">
              {formattedDate} &bull; {formattedTime}
            </p>
            <p className="event-details__meta">📍 {event.location}</p>
          </div>
        </div>

        <div className="event-details__actions">
          <Link
            to={`/dashboard/events/${id}/edit`}
            className="btn btn-secondary"
          >
            ✎ Edit Event
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete Event
          </button>
        </div>
      </div>

      <p className="event-details__description">{event.description}</p>

      {/* Tabs */}
      <div className="event-details__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`event-details__tab${
              activeTab === tab ? ' event-details__tab--active' : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Tasks' && (
        <div className="event-details__panel">
          <div className="event-details__panel-header">
            <h2 className="event-details__panel-title">Planning Tasks</h2>
            <Link
              to={`/dashboard/events/${id}/tasks/new`}
              className="btn btn-primary"
            >
              + Add Task
            </Link>
          </div>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
            ))
          ) : (
            <p className="empty-state">No tasks created for this event yet.</p>
          )}
        </div>
      )}

      {activeTab === 'Guests' && (
        <div className="event-details__panel">
          <div className="event-details__panel-header">
            <h2 className="event-details__panel-title">Guest List</h2>
            <Link
              to={`/dashboard/events/${id}/guests/new`}
              className="btn btn-primary"
            >
              + Add Guest
            </Link>
          </div>
          {guests.length > 0 ? (
            guests.map((guest) => (
              <div key={guest.id} className="event-details__guest-row">
                <span className="event-details__guest-avatar">
                  {guest.name.charAt(0).toUpperCase()}
                </span>
                <div className="event-details__guest-body">
                  <p className="event-details__guest-name">{guest.name}</p>
                  <p className="event-details__guest-email">
                    {guest.email} {guest.phone_number ? `\u2022 ${guest.phone_number}` : ''}
                  </p>
                </div>
                <EventStatus status={guest.rsvp_status || guest.status} />
              </div>
            ))
          ) : (
            <p className="empty-state">No guests added to this event yet.</p>
          )}
        </div>
      )}

      {activeTab === 'Details' && (
        <div className="event-details__panel event-details__info">
          <div>
            <p className="event-details__info-label">Description</p>
            <p className="event-details__info-value">
              {event.description}
            </p>
          </div>
          <div className="event-details__info-grid">
            <div>
              <p className="event-details__info-label">Category</p>
              <p className="event-details__info-value">{event.category_name || event.category}</p>
            </div>
            <div>
              <p className="event-details__info-label">Status</p>
              <p className="event-details__info-value">{event.status}</p>
            </div>
            <div>
              <p className="event-details__info-label">Date</p>
              <p className="event-details__info-value">{formattedDate}</p>
            </div>
            <div>
              <p className="event-details__info-label">Time</p>
              <p className="event-details__info-value">{formattedTime}</p>
            </div>
            <div>
              <p className="event-details__info-label">Location</p>
              <p className="event-details__info-value">
                {event.location}
              </p>
            </div>
            <div>
              <p className="event-details__info-label">Maximum Guests</p>
              <p className="event-details__info-value">
                {event.maximum_guests ?? 'Unlimited'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetails
