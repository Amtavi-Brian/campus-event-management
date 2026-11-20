import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GuestForm from '../../components/guests/GuestForm'
import { createGuest, getGuest, updateGuest } from '../../services/guestService'
import { getEvents } from '../../services/eventService'

function AddGuest() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [existingGuest, setExistingGuest] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const promises = [getEvents()]
    if (isEditing) {
      promises.push(getGuest(id))
    }

    Promise.all(promises)
      .then(([eventsData, guestData]) => {
        if (!isActive) return
        const eventList = Array.isArray(eventsData) ? eventsData : eventsData.results || []
        setEvents(eventList)

        if (guestData) {
          setExistingGuest({
            ...guestData,
            phone: guestData.phone_number || guestData.phone || '',
            status:
              guestData.rsvp_status === 'ACCEPTED'
                ? 'Going'
                : guestData.rsvp_status === 'NOT_GOING'
                ? 'Not Going'
                : 'Pending',
            event: String(guestData.event),
          })
        }
      })
      .catch((err) => {
        console.error('Failed to load guest data:', err)
        if (isActive) {
          setError('Unable to load data. Please try again.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [id, isEditing])

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
        event: Number(formData.event),
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        rsvp_status: rsvp,
      }

      if (isEditing) {
        await updateGuest(id, payload)
      } else {
        await createGuest(payload)
      }

      navigate('/dashboard/guests')
    } catch (err) {
      console.error('Failed to save guest:', err)
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' ')
        setError(messages)
      } else {
        setError('Unable to save guest. Please try again.')
      }
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/guests')
  }

  return (
    <div>
      <Link to="/dashboard/guests" className="back-link">
        ← Back to Guests
      </Link>

      <h1 className="page-title-standalone">
        {isEditing ? 'Edit Guest' : 'Add Guest'}
      </h1>

      {isLoading ? (
        <p className="empty-state">Loading...</p>
      ) : error ? (
        <p className="empty-state" role="alert">{error}</p>
      ) : events.length === 0 ? (
        <p className="empty-state" role="alert">
          Please create an event first before inviting guests.
        </p>
      ) : (
        <GuestForm
          initialValues={existingGuest || undefined}
          events={events}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isEditing ? 'Save Changes' : 'Save Guest'}
        />
      )}
    </div>
  )
}

export default AddGuest
