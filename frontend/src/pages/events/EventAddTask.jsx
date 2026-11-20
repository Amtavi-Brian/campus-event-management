import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TaskForm from '../../components/tasks/TaskForm'
import { getEvent } from '../../services/eventService'
import { createTask } from '../../services/taskService'

function EventAddTask() {
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
      const payload = {
        event: Number(id),
        title: formData.title,
        description: formData.description || '',
        deadline: formData.deadline,
        status: formData.status === 'Completed' ? 'COMPLETED' : 'PENDING',
      }
      await createTask(payload)
      navigate(`/dashboard/events/${id}`, { state: { activeTab: 'Tasks' } })
    } catch (err) {
      console.error('Failed to create task:', err)
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' ')
        setError(messages)
      } else {
        setError('Failed to create task. Please try again.')
      }
    }
  }

  const handleCancel = () => {
    navigate(`/dashboard/events/${id}`, { state: { activeTab: 'Tasks' } })
  }

  return (
    <div>
      <Link to={`/dashboard/events/${id}`} className="back-link">
        ← Back to {event ? event.title : 'Event'}
      </Link>

      <h1 className="page-title-standalone">Add Task</h1>
      {event && <p className="page-subtitle">For {event.title}</p>}
      {error && <p className="empty-state" role="alert">{error}</p>}

      <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Save Task" />
    </div>
  )
}

export default EventAddTask
