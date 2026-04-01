import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/shared/Sidebar';
import { User, BookOpen, MapPin, ArrowRight, Sparkles, Users, Calendar, ShieldCheck } from 'lucide-react';

export function AdminDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const CatalogIcon = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <BookOpen size={22} color="white" style={{ marginRight: '-4px' }} />
      <MapPin size={22} color="white" />
    </div>
  );

  const quickActions = [
    { icon: CatalogIcon, label: 'Manage Catalog', desc: 'Subjects & Locations', path: '/admin/catalog', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', shadow: 'rgba(99,102,241,0.3)' },
    { icon: Users, label: 'Manage Users', desc: 'View all users', path: '/admin/users', gradient: 'linear-gradient(135deg, #10B981, #059669)', shadow: 'rgba(5,150,105,0.3)' },
    { icon: Calendar, label: 'Sessions', desc: 'Track all sessions', path: '/admin/sessions', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', shadow: 'rgba(217,119,6,0.3)' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f0fe 60%, #EFF6FF 100%)' }}>
      <Sidebar role="ADMIN" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,47,108,0.06)',
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{today}</div>
            <div style={{ color: '#001a4d', fontSize: '15px', fontWeight: 700 }}>Admin Dashboard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
              border: '1px solid #BFDBFE',
            }}>
              <ShieldCheck size={13} color="#2563EB" />
              <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: '12px' }}>Admin</span>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(59,130,246,0.35)', cursor: 'pointer',
            }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg, #001a4d 0%, #002F6C 40%, #003fa0 80%, #0052cc 100%)',
            borderRadius: '20px', padding: '28px 32px', marginBottom: '28px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#60A5FA" />
                <span style={{ color: '#93C5FD', fontSize: '13px', fontWeight: 600 }}>Admin Panel</span>
              </div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p style={{ color: 'rgba(186,214,255,0.75)', fontSize: '14px' }}>
                Manage the TutorTime platform and ensure smooth operations.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Total Users', value: '0', icon: Users, color: '#3B82F6' },
              { label: 'Active Sessions', value: '0', icon: Calendar, color: '#10B981' },
              { label: 'Pending Reviews', value: '0', icon: ShieldCheck, color: '#F59E0B' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 20px rgba(0,47,108,0.07)',
                border: '1px solid rgba(59,130,246,0.08)',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#6B8FC4', fontSize: '12px', marginTop: '4px' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '14px', letterSpacing: '-0.3px' }}>
            Admin Controls
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {quickActions.map(({ icon: Icon, label, desc, path, gradient, shadow }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  background: 'white', borderRadius: '16px', padding: '22px 20px',
                  border: '1px solid rgba(59,130,246,0.1)',
                  boxShadow: '0 4px 18px rgba(0,47,108,0.07)',
                  cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${shadow}`;
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,47,108,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.1)';
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${shadow}` }}>
                  <Icon />
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '14.5px', marginBottom: '3px' }}>{label}</div>
                  <div style={{ color: '#6B8FC4', fontSize: '12px' }}>{desc}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ArrowRight size={16} color="#93C5FD" />
                </div>
              </button>
            ))}
          </div>

          {/* Profile card */}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={16} color="#3B82F6" /> Admin Account
              </h2>
              <button onClick={() => navigate('/admin/settings')} style={{
                padding: '7px 14px', borderRadius: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE',
                color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              }}>Edit Settings</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Full Name', value: `${currentUser.firstName} ${currentUser.lastName}` },
                { label: 'Email', value: currentUser.email },
                { label: 'Access Level', value: 'Administrator' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '14px', borderRadius: '12px', background: '#f7faff', border: '1px solid #e0eaff' }}>
                  <div style={{ color: '#93B4D8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' }}>{label}</div>
                  <div style={{ color: '#001a4d', fontSize: '13.5px', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}