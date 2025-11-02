import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ContactsPage from './pages/crm/ContactsPage';
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
import ComingSoon from './components/common/ComingSoon';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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
              <Route path="contacts" element={<ContactsPage />} />
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
              <Route path="funnels/:funnelId/analytics" element={<FunnelAnalyticsPage />} />

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

            {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
