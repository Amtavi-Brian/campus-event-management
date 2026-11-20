import { Link } from 'react-router-dom'
import EventStatus from '../events/EventStatus'

function TaskRow({ task, onToggle, onDelete }) {
  const isCompleted =
    task.status === 'Completed' ||
    task.status === 'COMPLETED' ||
    Boolean(task.completed)

  return (
    <tr>
      <td style={{ width: '32px' }}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle?.(task.id)}
        />
      </td>
      <td>
        <div>
          <span
            className={`data-table__primary-text${
              isCompleted ? ' data-table__primary-text--done' : ''
            }`}
          >
            {task.title}
          </span>
          {task.event_title && (
            <p className="data-table__secondary-text" style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
              {task.event_title}
            </p>
          )}
        </div>
      </td>
      <td>{task.deadline}</td>
      <td>
        <EventStatus status={task.status} />
      </td>
      <td className="table-cell--right">
        <div className="data-table__actions">
          <Link
            to={`/dashboard/tasks/${task.id}/edit`}
            className="data-table__action"
            aria-label={`Edit ${task.title}`}
          >
            ✎
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(task.id)}
            className="data-table__action data-table__action--danger"
            aria-label={`Delete ${task.title}`}
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  )
}

export default TaskRow
