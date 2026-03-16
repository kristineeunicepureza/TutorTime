export function StatusBadge({ status }) {
  const normalizedStatus = (status || 'UNKNOWN').toString().trim().toUpperCase();
  return <span className={`badge badge-${normalizedStatus.toLowerCase()}`}>{normalizedStatus}</span>;
}
