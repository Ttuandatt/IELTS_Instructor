'use client';

import { useAuth } from '@/providers/AuthProvider';
import LearnerDashboard from '@/components/dashboard/LearnerDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <div className="app-loading-spinner" />
      </div>
    );
  }
  if (!user) return null; // AppShell handles redirect to /login

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'learner':
    default:
      return <LearnerDashboard />;
  }
}