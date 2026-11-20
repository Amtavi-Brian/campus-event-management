import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GuestForm from '../../components/guests/GuestForm'
import { getEvent } from '../../services/eventService'
import { createGuest } from '../../services/guestService'

function EventAddGuest() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    getEvent(id)
      .then((data) => {
        if (isActive) setEvent(data)
      })
      .catch((err) => {
        console.error('Failed to load event:', err)
      })

    return () => {
      isActive = false
    }
  }, [id])

  const handleSubmit = async (formData) => {
    setError('')
    try {
      const rsvp =
        formData.status === 'Going'
          ? 'ACCEPTED'
          : formData.status === 'Not Going'
          ? 'NOT_GOING'
          : 'PENDING'

      const payload = {
        event: Number(id),
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        rsvp_status: rsvp,
      }

      await createGuest(payload)
      navigate(`/dashboard/events/${id}`, { state: { activeTab: 'Guests' } })
    } catch (err) {
      console.error('Failed to add guest:', err)
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' ')
        setError(messages)
      } else {
        setError('Failed to add guest. Please try again.')
      }
    }
  }

  const handleCancel = () => {
    navigate(`/dashboard/events/${id}`, { state: { activeTab: 'Guests' } })
  }

  return (
    <div>
      <Link to={`/dashboard/events/${id}`} className="back-link">
        ← Back to {event ? event.title : 'Event'}
      </Link>

      <h1 className="page-title-standalone">Add Guest</h1>
      {event && <p className="page-subtitle">For {event.title}</p>}
      {error && <p className="empty-state" role="alert">{error}</p>}

      <GuestForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Save Guest" />
    </div>
  )
}

export default EventAddGuest
