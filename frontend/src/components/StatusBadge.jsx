const CFG = {
  CONFIRMED: { color:'#047857', bg:'#ECFDF5', border:'#A7F3D0', icon:'✓',  label:'Confirmed'  },
  PENDING:   { color:'#B45309', bg:'#FFFBEB', border:'#FDE68A', icon:'◷',  label:'Pending'    },
  CANCELLED: { color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', icon:'✕',  label:'Cancelled'  },
  COMPLETED: { color:'#1558D6', bg:'#EBF1FD', border:'#7BB3F7', icon:'★',  label:'Completed'  },
  UNKNOWN:   { color:'#6B7280', bg:'#F8FAFC', border:'#CBD5E1', icon:'○',  label:'Unknown'    },
};

export function StatusBadge({ status }) {
  const key = (status || 'UNKNOWN').toString().trim().toUpperCase();
  const c = CFG[key] || CFG.UNKNOWN;
  return (
    <span
      className={`badge badge-${key.toLowerCase()}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 11px 4px 9px', borderRadius: '20px',
        fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.02em',
        color: c.color, background: c.bg,
        border: `1.5px solid ${c.border}`,
        whiteSpace: 'nowrap',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <span style={{ fontSize: '10px', lineHeight: 1 }}>{c.icon}</span>
      {c.label}
    </span>
  );
}