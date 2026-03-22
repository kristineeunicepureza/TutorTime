/* Shared font + token injection (safe no-op if DashboardView already ran it) */
if (typeof document !== 'undefined' && !document.getElementById('tt-blue-theme')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.id = 'tt-blue-theme';
  style.textContent = `
    :root {
      --navy:#08213E;--blue:#1558D6;--blue-mid:#2E71F0;--blue-light:#EBF1FD;
      --blue-pale:#F5F8FF;--sky:#7BB3F7;--gold:#F59E0B;--red:#DC2626;
      --green:#059669;--white:#FFFFFF;--text:#08213E;--body:#374151;
      --muted:#6B7280;--border:#D5E3F7;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .tt-btn-primary{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#2E71F0 0%,#1045B8 100%);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:700;cursor:pointer;letter-spacing:.01em;box-shadow:0 4px 16px rgba(21,88,214,.30);transition:transform .15s ease,box-shadow .15s ease;}
    .tt-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(21,88,214,.40);}
    .tt-btn-primary:disabled{background:#CBD5E1;box-shadow:none;cursor:not-allowed;transform:none;}
    .tt-btn-ghost{display:inline-flex;align-items:center;gap:5px;background:var(--blue-light);color:var(--blue);border:1.5px solid #C3D9F8;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:700;cursor:pointer;transition:background .12s,border-color .12s;}
    .tt-btn-ghost:hover{background:#D9EAFD;border-color:var(--blue-mid);}
    .tt-btn-ghost:disabled{opacity:.5;cursor:not-allowed;}
    .tt-btn-danger{display:inline-flex;align-items:center;gap:5px;background:transparent;color:#DC2626;border:1.5px solid #FECACA;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:700;cursor:pointer;transition:background .12s;}
    .tt-btn-danger:hover{background:#FEF2F2;}
    .tt-card{background:#fff;border-radius:16px;border:1.5px solid var(--border);box-shadow:0 1px 3px rgba(8,33,62,.05),0 6px 20px rgba(8,33,62,.07);}
    .tt-input{width:100%;border:1.5px solid #D5E3F7;border-radius:10px;padding:10px 14px;font-size:13.5px;color:#08213E;background:#F8FBFF;outline:none;transition:border-color .15s,box-shadow .15s;font-family:'Plus Jakarta Sans',sans-serif;}
    .tt-input:focus{border-color:#2E71F0;box-shadow:0 0 0 3px rgba(46,113,240,.12);}
    .tt-input:disabled{background:#F1F5F9;color:#9CA3AF;cursor:not-allowed;}
    .tt-label{display:block;font-size:11.5px;font-weight:700;color:#475569;letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px;}
    .tt-modal-overlay{position:fixed;inset:0;background:rgba(8,33,62,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px);}
    .tt-modal{background:#fff;border-radius:20px;width:100%;box-shadow:0 24px 64px rgba(8,33,62,.20);overflow:hidden;}
    .tt-modal-head{background:linear-gradient(135deg,#2E71F0 0%,#1045B8 100%);padding:18px 22px;display:flex;align-items:center;justify-content:space-between;}
    .tt-modal-title{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.2px;font-family:'Sora',sans-serif;}
    .tt-modal-close{background:rgba(255,255,255,.20);border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:13px;font-weight:700;}
    .tt-modal-body{padding:20px 22px;display:flex;flex-direction:column;gap:14px;max-height:65vh;overflow-y:auto;}
    .tt-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 22px;border-top:1.5px solid #EBF1FD;}
    .tt-section-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:#08213E;letter-spacing:-.1px;}
    .tt-divider{border:none;border-top:1.5px solid #EBF1FD;margin:0;}
    .badge{font-family:'Plus Jakarta Sans',sans-serif!important;font-size:11.5px!important;font-weight:700!important;padding:4px 11px!important;border-radius:20px!important;border-width:1.5px!important;border-style:solid!important;}
    .badge-confirmed{color:#047857!important;background:#ECFDF5!important;border-color:#A7F3D0!important;}
    .badge-pending{color:#B45309!important;background:#FFFBEB!important;border-color:#FDE68A!important;}
    .badge-cancelled{color:#DC2626!important;background:#FEF2F2!important;border-color:#FECACA!important;}
    .badge-completed{color:var(--blue)!important;background:var(--blue-light)!important;border-color:var(--sky)!important;}
    @keyframes ttUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    .tt-a0{animation:ttUp .38s .00s ease both}
    .tt-a1{animation:ttUp .38s .07s ease both}
    .tt-a2{animation:ttUp .38s .14s ease both}
    .tt-a3{animation:ttUp .38s .21s ease both}
  `;
  document.head.appendChild(style);
}

const BLUE_SHADES = [
  ['#1558D6','#2E71F0'],['#0A3FA0','#1558D6'],['#2E71F0','#60A5FA'],
  ['#1045B8','#2E71F0'],['#0B2347','#1558D6'],['#1E6BF1','#60A5FA'],
];

function pickShade(text) {
  let h = 0;
  for (let i = 0; i < (text||'').length; i++) h = (text.charCodeAt(i)+((h<<5)-h))|0;
  return BLUE_SHADES[Math.abs(h) % BLUE_SHADES.length];
}

export function Avatar({ initials, size = 40, photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="avatar"
        className="avatar"
        style={{
          width: size, height: size, objectFit: 'cover', borderRadius: '50%',
          border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(8,33,62,.14)',
          flexShrink: 0, display: 'block',
        }}
      />
    );
  }
  const [from, to] = pickShade(initials);
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, letterSpacing: '-0.01em', flexShrink: 0,
        boxShadow: `0 3px 10px ${from}55`,
        border: '2.5px solid #fff', userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}