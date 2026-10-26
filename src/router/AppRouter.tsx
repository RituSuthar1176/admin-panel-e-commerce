import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRouter';
import PublicRoute from './PublicRoute';
import Login from '../pages/login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <Routes>
      {/* Only users WITHOUT a token */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Only users WITH a token */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;