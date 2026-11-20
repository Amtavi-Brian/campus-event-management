
import { useState } from 'react'
import '../../styles/events/EventForm.css'

const defaultValues = {
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  maxGuests: '',
}

function EventForm({
  initialValues = defaultValues,
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = 'Create Event',
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setErrorMessage('')
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmit?.(formData)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save the event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="event-form">

      {errorMessage && (
        <p className="event-form__error" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Event Title */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Event Title *
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Birthday Party"
          className="form-input"
        />
      </div>

      {/* Event Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description *
        </label>

        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell us more about your event..."
          className="form-textarea"
        />
      </div>

      {/* Event Category */}
      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Event Category *
        </label>

        <select
          id="category"
          name="category"
          required
          value={formData.category}
          onChange={handleChange}
          className="form-input"
        >
          <option value="">Select an event category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date and Time */}
      <div className="form-row form-group">
        <div>
          <label htmlFor="date" className="form-label">
            Date *
          </label>

          <input
            id="date"
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="time" className="form-label">
            Time *
          </label>

          <input
            id="time"
            name="time"
            type="time"
            required
            value={formData.time}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      {/* Location and Maximum Guests */}
      <div className="form-row form-group">
        <div>
          <label htmlFor="location" className="form-label">
            Location *
          </label>

          <input
            id="location"
            name="location"
            type="text"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Nairobi"
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="maxGuests" className="form-label">
            Maximum Guests
          </label>

          <input
            id="maxGuests"
            name="maxGuests"
            type="number"
            min={1}
            value={formData.maxGuests}
            onChange={handleChange}
            placeholder="e.g. 50"
            className="form-input"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Please wait...' : submitLabel}
        </button>
      </div>

    </form>
  )
}

export default EventForm
