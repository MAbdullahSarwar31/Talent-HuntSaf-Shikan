import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole, ROLE_DEFAULT_ROUTES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardShell } from '../components/layout/DashboardShell';

// Page imports following SaaS directory pattern
import { LoginPage } from '../pages/Login/LoginPage';
import { OverviewPage } from '../pages/admin/BI/Overview/OverviewPage';
import { MissionProfitabilityPage } from '../pages/admin/BI/Profitability/MissionProfitabilityPage';
import { MissionDetailPage } from '../pages/admin/BI/MissionDetail/MissionDetailPage';
import { FleetUtilizationPage } from '../pages/admin/BI/Fleet/FleetUtilizationPage';
import { OperatorEfficiencyPage } from '../pages/admin/BI/Operators/OperatorEfficiencyPage';
import { LeakageAnalysisPage } from '../pages/admin/BI/Leakage/LeakageAnalysisPage';
import { RulesEnginePage } from '../pages/admin/BI/RulesEngine/RulesEnginePage';
import { ReportsPage } from '../pages/admin/BI/Reports/ReportsPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  const defaultRoute = ROLE_DEFAULT_ROUTES[user.role] || ROUTES.LOGIN;
  return <Navigate to={defaultRoute} replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Master Dashboard Shell with RBAC Role Gating */}
        <Route element={<DashboardShell />}>
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} />}>
            <Route path={ROUTES.ADMIN.BI_OVERVIEW} element={<OverviewPage />} />
            <Route path={ROUTES.ADMIN.BI_PROFITABILITY} element={<MissionProfitabilityPage />} />
            <Route path={`${ROUTES.ADMIN.BI_MISSIONS}/:id`} element={<MissionDetailPage />} />
            <Route path={ROUTES.ADMIN.BI_FLEET} element={<FleetUtilizationPage />} />
            <Route path={ROUTES.ADMIN.BI_OPERATORS} element={<OperatorEfficiencyPage />} />
            <Route path={ROUTES.ADMIN.BI_LEAKAGE} element={<LeakageAnalysisPage />} />
            <Route path={ROUTES.ADMIN.BI_RULES_ENGINE} element={<RulesEnginePage />} />
            <Route path={ROUTES.ADMIN.BI_REPORTS} element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
