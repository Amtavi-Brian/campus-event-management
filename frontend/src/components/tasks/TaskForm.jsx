
import { useState } from 'react'
import '../../styles/tasks/TaskForm.css'

const defaultValues = {
  title: '',
  description: '',
  deadline: '',
  status: 'Pending',
  event: '',
  assigned_to: '',
}

function TaskForm({
  initialValues = defaultValues,
  events,
  users = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save Task',
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialValues,
    event:
      initialValues.event ||
      (events && events.length > 0 ? String(events[0].id) : ''),
    assigned_to: initialValues.assigned_to
      ? String(initialValues.assigned_to)
      : '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">

      {/* Event Selection */}
      {events && (
        <div className="form-group">
          <label htmlFor="event" className="form-label">
            Event *
          </label>

          <select
            id="event"
            name="event"
            required
            value={formData.event}
            onChange={handleChange}
            className="form-select"
          >
            <option value="" disabled>
              Select an event
            </option>

            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Task Title */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Task Title *
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Book venue"
          className="form-input"
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description (optional)"
          className="form-textarea"
        />
      </div>

      {/* Deadline */}
      <div className="form-group">
        <label htmlFor="deadline" className="form-label">
          Deadline
        </label>

        <input
          id="deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      {/* Assign To */}
      <div className="form-group">
        <label htmlFor="assigned_to" className="form-label">
          Assign To
        </label>

        <select
          id="assigned_to"
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Unassigned</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name || user.last_name
                ? `${user.first_name} ${user.last_name}`.trim()
                : user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="form-group">
        <label htmlFor="status" className="form-label">
          Status
        </label>

        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-select"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
