import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRouter";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import AttributeList from "../pages/catalog/AttributeList";
import NotFound from "../pages/NotFound";
import AttributeSetList from "../pages/catalog/AttributeSetList";

const AppRouter = () => {
  return (
    <Routes>
      {/* Only logged-out users */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Only logged-in users, all inside the header + sidebar layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/catalog"
            element={<Navigate to="/catalog/attribute" replace />}
          />
          <Route path="/catalog/attribute" element={<AttributeList />} />
          <Route path="/catalog/attribute-set" element={<AttributeSetList />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
