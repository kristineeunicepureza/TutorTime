export function Avatar({ initials, size = 40, photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="avatar"
        className="avatar"
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}
