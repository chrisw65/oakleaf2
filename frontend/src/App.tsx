import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ContactsPage from './pages/crm/ContactsPage';
import ContactDetailPage from './pages/crm/ContactDetailPage';
import TasksPage from './pages/crm/TasksPage';
import CRMDashboardPage from './pages/crm/CRMDashboardPage';
import OpportunitiesPage from './pages/crm/OpportunitiesPage';
import PipelinesPage from './pages/crm/PipelinesPage';
import CampaignsPage from './pages/email/CampaignsPage';
import TemplatesPage from './pages/email/TemplatesPage';
import SegmentsPage from './pages/email/SegmentsPage';
import ProductsPage from './pages/ecommerce/ProductsPage';
import OrdersPage from './pages/ecommerce/OrdersPage';
import FunnelsPage from './pages/funnels/FunnelsPage';
import FunnelBuilderPage from './pages/funnels/FunnelBuilderPage';
import FunnelAnalyticsPage from './pages/funnels/FunnelAnalyticsPage';
import PageEditPage from './pages/funnels/PageEditPage';
import EngagementPage from './pages/engagement/EngagementPage';
import ComingSoon from './components/common/ComingSoon';
import PublicPage from './pages/public/PublicPage';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import CookiePolicy from './pages/public/CookiePolicy';
import TermsAndConditions from './pages/public/TermsAndConditions';
import CookieConsent from './components/common/CookieConsent';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Brand Colors - Premium gradient palette
          colorPrimary: '#6366f1',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          colorLink: '#6366f1',

          // Typography
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          fontSizeHeading1: 38,
          fontSizeHeading2: 30,
          fontSizeHeading3: 24,
          fontSizeHeading4: 20,
          fontSizeHeading5: 16,

          // Spacing & Layout
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,

          // Shadows - Premium depth
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

          // Motion
          motionDurationSlow: '0.3s',
          motionDurationMid: '0.2s',
          motionDurationFast: '0.1s',
        },
        components: {
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontSizeLG: 16,
            controlHeightLG: 48,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Table: {
            borderRadius: 12,
          },
          Modal: {
            borderRadiusLG: 12,
          },
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#1e293b',
            triggerBg: '#334155',
          },
          Menu: {
            darkItemBg: '#1e293b',
            darkItemSelectedBg: '#334155',
            darkItemHoverBg: '#334155',
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <Router>
          <CookieConsent />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/p/:funnelSlug/:pageSlug" element={<PublicPage />} />

            {/* Legal pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* CRM Routes */}
              <Route path="crm/dashboard" element={<CRMDashboardPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="pipelines" element={<PipelinesPage />} />

              {/* Product Routes */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />

              {/* Email Marketing Routes */}
              <Route path="email/campaigns" element={<CampaignsPage />} />
              <Route path="email/templates" element={<TemplatesPage />} />
              <Route path="email/sequences" element={<ComingSoon title="Email Sequences" description="Create automated email sequences" />} />
              <Route path="email/segments" element={<SegmentsPage />} />

              {/* Funnel Routes */}
              <Route path="funnels" element={<FunnelsPage />} />
              <Route path="funnels/:funnelId/builder" element={<FunnelBuilderPage />} />
              <Route path="funnels/:funnelId/pages/:pageId/edit" element={<PageEditPage />} />
              <Route path="funnels/:funnelId/analytics" element={<FunnelAnalyticsPage />} />

              {/* Engagement Routes */}
              <Route path="engagement" element={<EngagementPage />} />

              {/* Affiliate Routes */}
              <Route path="affiliates" element={<ComingSoon title="Affiliates" description="Manage your affiliate program" />} />

              {/* Analytics Routes */}
              <Route path="analytics" element={<ComingSoon title="Analytics" description="View your analytics and reports" />} />

              {/* Webhook Routes */}
              <Route path="webhooks" element={<ComingSoon title="Webhooks" description="Manage your webhooks" />} />

              {/* Settings Routes */}
              <Route path="settings" element={<ComingSoon title="Settings" description="Manage your account settings" />} />
              <Route path="settings/profile" element={<ComingSoon title="Profile Settings" description="Update your profile information" />} />
              <Route path="settings/users" element={<ComingSoon title="User Management" description="Manage team members" />} />
              <Route path="settings/roles" element={<ComingSoon title="Roles & Permissions" description="Configure user roles and permissions" />} />
              <Route path="settings/api-keys" element={<ComingSoon title="API Keys" description="Manage your API keys" />} />
              <Route path="settings/domains" element={<ComingSoon title="Custom Domains" description="Configure custom domains" />} />

              {/* Audit Routes */}
              <Route path="audit" element={<ComingSoon title="Audit Logs" description="View system audit logs" />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
