import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRouter';
import PublicRoute from './PublicRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import AttributeList from '../pages/catalog/AttributeList';
import AttributeSetList from '../pages/catalog/AttributeSetList';
import CollectionList from '../pages/catalog/CollectionList';
import CollectionView from '../pages/catalog/CollectionView';
import CollectionAddProducts from '../pages/catalog/CollectionAddProducts';
import CollectionProducts from '../pages/catalog/CollectionProducts';
import NotFound from '../pages/NotFound';

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

          {/* Catalog */}
          <Route path="/catalog" element={<Navigate to="/catalog/attribute" replace />} />
          <Route path="/catalog/attribute" element={<AttributeList />} />
          <Route path="/catalog/attribute-set" element={<AttributeSetList />} />

          {/* Collection: add and edit are popups on the list page */}
          <Route path="/catalog/collection" element={<CollectionList />} />
          <Route path="/catalog/collection/:id" element={<CollectionView />} />
          <Route path="/catalog/collection/:id/add-products" element={<CollectionAddProducts />} />
          <Route path="/catalog/collection/:id/products" element={<CollectionProducts />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;