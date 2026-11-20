import '../../styles/events/EventStatus.css'

const statusModifiers = {
  Completed: 'status-badge--completed',
  COMPLETED: 'status-badge--completed',
  Pending: 'status-badge--pending',
  PENDING: 'status-badge--pending',
  'In Progress': 'status-badge--pending',
  IN_PROGRESS: 'status-badge--pending',
  Planning: 'status-badge--pending',
  PLANNING: 'status-badge--pending',
  Upcoming: 'status-badge--pending',
  UPCOMING: 'status-badge--pending',
  Ongoing: 'status-badge--going',
  ONGOING: 'status-badge--going',
  Going: 'status-badge--going',
  GOING: 'status-badge--going',
  Accepted: 'status-badge--going',
  ACCEPTED: 'status-badge--going',
  'Not Going': 'status-badge--not-going',
  NOT_GOING: 'status-badge--not-going',
  Canceled: 'status-badge--not-going',
  CANCELED: 'status-badge--not-going',
}

const statusDisplayLabels = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  PLANNING: 'Planning',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  ACCEPTED: 'Going',
  NOT_GOING: 'Not Going',
  CANCELED: 'Canceled',
}

function EventStatus({ status }) {
  if (!status) return null

  const modifier = statusModifiers[status] || 'status-badge--default'
  const label = statusDisplayLabels[status] || status

  return <span className={`status-badge ${modifier}`}>{label}</span>
}

export default EventStatus
