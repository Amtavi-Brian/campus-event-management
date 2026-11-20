import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TaskRow from '../../components/tasks/TaskRow'
import { deleteTask, getTasks, updateTask } from '../../services/taskService'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getTasks()
        if (isActive) {
          setTasks(Array.isArray(data) ? data : data.results || [])
        }
      } catch (err) {
        console.error('Failed to load tasks:', err)
        if (isActive) {
          setError('Unable to load tasks. Please try again.')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchTasks()

    return () => {
      isActive = false
    }
  }, [])

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tasks
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(query) ||
      (task.event_title && task.event_title.toLowerCase().includes(query))
    )
  }, [tasks, search])

  const handleToggle = async (id) => {
    const targetTask = tasks.find((t) => t.id === id)
    if (!targetTask) return

    const isCurrentlyDone =
      targetTask.status === 'COMPLETED' ||
      targetTask.status === 'Completed' ||
      Boolean(targetTask.completed)

    const nextStatus = isCurrentlyDone ? 'PENDING' : 'COMPLETED'

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: nextStatus,
              completed: !isCurrentlyDone,
            }
          : task
      )
    )

    try {
      await updateTask(id, { status: nextStatus })
    } catch (err) {
      console.error('Failed to update task:', err)
      // Rollback
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? targetTask : task))
      )
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return

    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert('Unable to delete task. Please try again.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <Link to="/dashboard/tasks/new" className="btn btn-primary">
          + Add Task
        </Link>
      </div>

      <div className="search-field search-field--spaced">
        <span className="search-field__icon">🔍</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="search-field__input"
        />
      </div>

      <div className="table-card">
        {isLoading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : error ? (
          <p className="empty-state" role="alert">{error}</p>
        ) : filteredTasks.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}></th>
                <th>Task</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="table-cell--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">
            {search ? 'No tasks match your search.' : 'No tasks available yet.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default Tasks
