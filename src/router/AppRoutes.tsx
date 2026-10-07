import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const EmployeesPage = lazy(() => import('../pages/employees/EmployeesPage'));
const EmployeeDetailsPage = lazy(() => import('../pages/employees/EmployeeDetailsPage'));
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage'));
const CustomerDetailsPage = lazy(() => import('../pages/customers/CustomerDetailsPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const OrderDetailsPage = lazy(() => import('../pages/orders/OrderDetailsPage'));
const InventoryPage = lazy(() => import('../pages/inventory/InventoryPage'));
const FinancePage = lazy(() => import('../pages/finance/FinancePage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const CalendarPage = lazy(() => import('../pages/calendar/CalendarPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
