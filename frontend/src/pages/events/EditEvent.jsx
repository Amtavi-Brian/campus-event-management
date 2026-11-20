import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EventForm from '../../components/events/EventForm'
import {
  getCategories,
  getEvent,
  getEventErrorMessage,
  toEventFormValues,
  toEventPayload,
  updateEvent,
} from '../../services/eventService'

function EditEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [existingEvent, setExistingEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true

    Promise.all([getEvent(id), getCategories()])
      .then(([event, categoryData]) => {
        if (!isActive) return
        setExistingEvent(event)
        setCategories(
          Array.isArray(categoryData) ? categoryData : categoryData.results || []
        )
      })
      .catch((error) => {
        console.error(`Failed to load event ${id}:`, error)
        if (isActive) {
          setLoadError(getEventErrorMessage(error))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [id])

  const handleSubmit = async (formData) => {
    try {
      await updateEvent(id, toEventPayload(formData))
    } catch (error) {
      throw new Error(getEventErrorMessage(error), { cause: error })
    }

    navigate(`/dashboard/events/${id}`)
  }

  const handleCancel = () => {
    navigate(`/dashboard/events/${id}`)
  }

  return (
    <div>
      <Link to={`/dashboard/events/${id}`} className="back-link">
        ← Back to Event
      </Link>

      <h1 className="page-title-standalone">Edit Event</h1>

      {isLoading ? (
        <p className="empty-state">Loading event...</p>
      ) : loadError ? (
        <p className="empty-state" role="alert">{loadError}</p>
      ) : categories.length === 0 ? (
        <p className="empty-state" role="alert">
          No event categories are available. Ask an administrator to add one.
        </p>
      ) : existingEvent ? (
        <EventForm
          initialValues={toEventFormValues(existingEvent)}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Save Changes"
        />
      ) : (
        <p className="empty-state">Event not found.</p>
      )}
    </div>
  )
}

export default EditEvent
