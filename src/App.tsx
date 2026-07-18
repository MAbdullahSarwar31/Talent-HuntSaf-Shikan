import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { MissionProfitabilityPage } from './pages/MissionProfitabilityPage';
import { MissionDetailPage } from './pages/MissionDetailPage';
import { FleetUtilizationPage } from './pages/FleetUtilizationPage';
import { OperatorEfficiencyPage } from './pages/OperatorEfficiencyPage';
import { LeakageAnalysisPage } from './pages/LeakageAnalysisPage';
import { RulesEnginePage } from './pages/RulesEnginePage';
import { ReportsPage } from './pages/ReportsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="missions" element={<MissionProfitabilityPage />} />
          <Route path="missions/:id" element={<MissionDetailPage />} />
          <Route path="fleet" element={<FleetUtilizationPage />} />
          <Route path="operators" element={<OperatorEfficiencyPage />} />
          <Route path="leakage" element={<LeakageAnalysisPage />} />
          <Route path="rules" element={<RulesEnginePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
