import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TaskForm from '../../components/tasks/TaskForm'
import { createTask, getTask, updateTask } from '../../services/taskService'
import { getEvents } from '../../services/eventService'

function AddTask() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [existingTask, setExistingTask] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const promises = [getEvents()]
    if (isEditing) {
      promises.push(getTask(id))
    }

    Promise.all(promises)
      .then(([eventsData, taskData]) => {
        if (!isActive) return
        const eventList = Array.isArray(eventsData) ? eventsData : eventsData.results || []
        setEvents(eventList)

        if (taskData) {
          setExistingTask({
            ...taskData,
            status:
              taskData.status === 'COMPLETED' || taskData.status === 'Completed'
                ? 'Completed'
                : 'Pending',
            event: String(taskData.event),
          })
        }
      })
      .catch((err) => {
        console.error('Failed to load task data:', err)
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
      const payload = {
        event: Number(formData.event),
        title: formData.title,
        description: formData.description || '',
        deadline: formData.deadline,
        status: formData.status === 'Completed' ? 'COMPLETED' : 'PENDING',
      }

      if (isEditing) {
        await updateTask(id, payload)
      } else {
        await createTask(payload)
      }

      navigate('/dashboard/tasks')
    } catch (err) {
      console.error('Failed to save task:', err)
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' ')
        setError(messages)
      } else {
        setError('Unable to save task. Please try again.')
      }
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/tasks')
  }

  return (
    <div>
      <Link to="/dashboard/tasks" className="back-link">
        ← Back to Tasks
      </Link>

      <h1 className="page-title-standalone">
        {isEditing ? 'Edit Task' : 'Add Task'}
      </h1>

      {isLoading ? (
        <p className="empty-state">Loading...</p>
      ) : error ? (
        <p className="empty-state" role="alert">{error}</p>
      ) : events.length === 0 ? (
        <p className="empty-state" role="alert">
          Please create an event first before creating tasks.
        </p>
      ) : (
        <TaskForm
          initialValues={existingTask || undefined}
          events={events}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isEditing ? 'Save Changes' : 'Save Task'}
        />
      )}
    </div>
  )
}

export default AddTask
