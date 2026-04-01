import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout }               from './components/layouts/RootLayout';
import { LoginPage }                from './pages/auth/LoginPage';
import { SignupPage }               from './pages/auth/SignupPage';

import { StudentDashboard }         from './pages/student/StudentDashboard';
import { TutorDirectory }           from './pages/student/TutorDirectory';
import { TutorProfile }             from './pages/student/TutorProfile';
import { MyBookings }               from './pages/student/MyBookings';

import { TutorDashboard }           from './pages/tutor/TutorDashboard';
import { TutorAvailability }        from './pages/tutor/TutorAvailability';
import { TutorStudents }            from './pages/tutor/TutorStudents';
import { TutorPendingPage }         from './pages/tutor/TutorPendingPage';

import { AdminDashboard }           from './pages/admin/AdminDashboard';
import { AdminUsers }               from './pages/admin/AdminUsers';
import { AdminSessions }            from './pages/admin/AdminSessions';
import { AdminTutorVerification }   from './pages/admin/AdminTutorVerification';
import { AdminCatalog }             from './pages/admin/AdminCatalog';
import { AdminSettings }            from './pages/admin/AdminSettings';

import { ProfilePage }              from './pages/shared/ProfilePage';
import { NotificationsPage }        from './pages/shared/NotificationsPage';
import { NotFound }                 from './pages/NotFound';

import { useApp }                   from './context/AppContext';

function TutorApprovedRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'TUTOR') return <Navigate to="/login" replace />;
  if (currentUser.verificationStatus !== 'APPROVED') return <Navigate to="/tutor/pending" replace />;
  return <Component />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true,                  element: <Navigate to="/login" replace /> },
      { path: 'login',                Component: LoginPage   },
      { path: 'signup',               Component: SignupPage  },

      { path: 'student/dashboard',    Component: StudentDashboard },
      { path: 'student/tutors',       Component: TutorDirectory   },
      { path: 'student/tutor/:id',    Component: TutorProfile     },
      { path: 'student/bookings',     Component: MyBookings       },

      { path: 'tutor/pending',        Component: TutorPendingPage },
      { path: 'tutor/dashboard',      element: <TutorApprovedRoute component={TutorDashboard}    /> },
      { path: 'tutor/schedule',       element: <TutorApprovedRoute component={TutorAvailability} /> },
      { path: 'tutor/students',       element: <TutorApprovedRoute component={TutorStudents}     /> },

      { path: 'admin/dashboard',      Component: AdminDashboard         },
      { path: 'admin/catalog',        Component: AdminCatalog           },
      { path: 'admin/users',          Component: AdminUsers             },
      { path: 'admin/sessions',       Component: AdminSessions          },
      { path: 'admin/tutor-verify',   Component: AdminTutorVerification },
      { path: 'admin/settings',       Component: AdminSettings          },

      { path: 'profile',              Component: ProfilePage        },
      { path: 'notifications',        Component: NotificationsPage  },
      { path: '*',                    Component: NotFound           },
    ],
  },
]);