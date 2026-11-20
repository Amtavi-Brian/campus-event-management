import { Link } from 'react-router-dom'
import EventStatus from '../events/EventStatus'

function GuestItem({ guest, onDelete }) {
  const phone = guest.phone || guest.phone_number || '—'
  const status = guest.rsvp_status || guest.status

  return (
    <tr>
      <td>
        <div className="data-table__name-cell">
          <span className="data-table__avatar">{guest.name.charAt(0).toUpperCase()}</span>
          <div>
            <span className="data-table__primary-text">{guest.name}</span>
            {guest.event_title && (
              <p className="data-table__secondary-text" style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                {guest.event_title}
              </p>
            )}
          </div>
        </div>
      </td>
      <td>{guest.email}</td>
      <td>{phone}</td>
      <td>
        <EventStatus status={status} />
      </td>
      <td className="table-cell--right">
        <div className="data-table__actions">
          <Link
            to={`/dashboard/guests/${guest.id}/edit`}
            className="data-table__action"
            aria-label={`Edit ${guest.name}`}
          >
            ✎
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(guest.id)}
            className="data-table__action data-table__action--danger"
            aria-label={`Delete ${guest.name}`}
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  )
}

export default GuestItem
