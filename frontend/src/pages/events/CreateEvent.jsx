import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventForm from '../../components/events/EventForm'
import {
  createEvent,
  getCategories,
  getEventErrorMessage,
  toEventPayload,
} from '../../services/eventService'

function CreateEvent() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true

    getCategories()
      .then((data) => {
        if (isActive) {
          setCategories(Array.isArray(data) ? data : data.results || [])
        }
      })
      .catch((error) => {
        console.error('Failed to fetch event categories:', error)
        if (isActive) {
          setLoadError('Unable to load event categories. Please try again.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (formData) => {
    try {
      await createEvent(toEventPayload(formData))
    } catch (error) {
      throw new Error(getEventErrorMessage(error), { cause: error })
    }

    navigate('/dashboard/events')
  }

  const handleCancel = () => {
    navigate('/dashboard/events')
  }

  return (
    <div>
      <Link to="/dashboard/events" className="back-link">
        ← Back to My Events
      </Link>

      <h1 className="page-title-standalone">Create New Event</h1>

      {isLoading ? (
        <p className="empty-state">Loading event categories...</p>
      ) : loadError ? (
        <p className="empty-state" role="alert">{loadError}</p>
      ) : categories.length === 0 ? (
        <p className="empty-state" role="alert">
          No event categories are available. Ask an administrator to add one.
        </p>
      ) : (
        <EventForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default CreateEvent
