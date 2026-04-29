import { createBrowserRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { ProtectedRoute } from '@/app/route-guards';

const lazy = (loader: () => Promise<{ default: ComponentType }>) => ({
  lazy: async () => {
    const module = await loader();
    return { Component: module.default };
  },
});

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', ...lazy(() => import('@/features/home/LandingPage')) },
      { path: '/charities', ...lazy(() => import('@/features/charities/CharitiesPage')) },
      { path: '/charities/:slug', ...lazy(() => import('@/features/charities/CharityDetailPage')) },
      { path: '/pricing', ...lazy(() => import('@/features/auth/PricingPage')) },
      { path: '/login', ...lazy(() => import('@/features/auth/LoginPage')) },
      { path: '/signup', ...lazy(() => import('@/features/auth/SignupPage')) },
      { path: '/forgot-password', ...lazy(() => import('@/features/auth/ForgotPasswordPage')) },
      { path: '/reset-password', ...lazy(() => import('@/features/auth/ResetPasswordPage')) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', ...lazy(() => import('@/features/dashboard/DashboardPage')) },
          { path: '/subscription', ...lazy(() => import('@/features/subscription/SubscriptionPage')) },
          { path: '/scores', ...lazy(() => import('@/features/scores/ScoresPage')) },
          { path: '/draws', ...lazy(() => import('@/features/draws/DrawsPage')) },
          { path: '/winnings', ...lazy(() => import('@/features/winners/WinningsPage')) },
          { path: '/profile', ...lazy(() => import('@/features/profile/ProfilePage')) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/admin', ...lazy(() => import('@/features/admin/AdminDashboardPage')), },
          { path: '/admin/users', ...lazy(() => import('@/features/admin/UsersPage')) },
          { path: '/admin/subscriptions', ...lazy(() => import('@/features/admin/SubscriptionsPage')) },
          { path: '/admin/draws', ...lazy(() => import('@/features/admin/DrawsAdminPage')) },
          { path: '/admin/charities', ...lazy(() => import('@/features/admin/CharitiesAdminPage')) },
          { path: '/admin/winners', ...lazy(() => import('@/features/admin/WinnersAdminPage')) },
          { path: '/admin/broadcast', ...lazy(() => import('@/features/admin/BroadcastPage')) },
        ],
      },
    ],
  },
]);