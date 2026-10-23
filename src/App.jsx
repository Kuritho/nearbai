import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Login from './pages/Login';

// Public
import ReservePage from './pages/public/ReservePage';
import ReserveSuccess from './pages/public/ReserveSuccess';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProperties from './pages/admin/ManageProperties';
import ManageRooms from './pages/admin/ManageRooms';
import ManageTenants from './pages/admin/ManageTenants';
import Reservations from './pages/admin/Reservations';
import RentPayments from './pages/admin/RentPayments';
import UtilityCharges from './pages/admin/UtilityCharges';
import Expenses from './pages/admin/Expenses';
import Analytics from './pages/admin/Analytics';
import PaymentSettings from './pages/admin/PaymentSettings';
import ManageUsers from './pages/admin/ManageUsers';

// Caretaker
import CaretakerDashboard from './pages/caretaker/CaretakerDashboard';

// Tenant
import TenantDashboard from './pages/tenant/TenantDashboard';
import PayBill from './pages/tenant/PayBill';
import PaymentPending from './pages/tenant/PaymentPending';
import Receipt from './pages/tenant/Receipt';

// ============================================================
// IMPORT SANITY CHECK — logs any missing page to the console
// ============================================================
const PAGE_IMPORTS = {
  Login,
  ReservePage,
  ReserveSuccess,
  AdminDashboard,
  ManageProperties,
  ManageRooms,
  ManageTenants,
  Reservations,
  RentPayments,
  UtilityCharges,
  Expenses,
  Analytics,
  PaymentSettings,
  ManageUsers,
  CaretakerDashboard,
  TenantDashboard,
  PayBill,
  PaymentPending,
  Receipt,
  Layout,
};

(() => {
  const missing = Object.entries(PAGE_IMPORTS)
    .filter(([, v]) => v === undefined || v === null)
    .map(([k]) => k);

  if (missing.length) {
    console.error(
      '❌ NearBai: The following page components are MISSING or not default-exported:',
      missing
    );
    console.error(
      '💡 Fix: open each file listed and make sure it ends with `export default ComponentName;`'
    );
  } else {
    console.log('✅ NearBai: All page imports resolved successfully.');
  }
})();

// ============================================================
// ERROR BOUNDARY — shows a readable error if a page crashes
// ============================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('🔥 Page render error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-lg w-full">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <span className="text-rose-500 text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              A page failed to load. This is usually caused by a missing file or a
              broken import. Check the browser console for details.
            </p>
            <details className="mb-4">
              <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">
                Show error details
              </summary>
              <pre className="mt-2 bg-slate-50 p-3 rounded-xl text-[10px] text-rose-700 overflow-auto max-h-40 whitespace-pre-wrap">
                {String(this.state.error)}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex-1"
              >
                Reload page
              </button>
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="btn-secondary flex-1"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// PAGE FALLBACK — shown when a route's component is undefined
// ============================================================
function MissingPage({ name }) {
  return (
    <div className="max-w-lg mx-auto my-16">
      <div className="card text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-amber-500 text-3xl">🔧</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">
          Page unavailable
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          The <strong>{name}</strong> page hasn't been created yet, or its file
          doesn't have a <code className="bg-slate-100 px-1 rounded">export default</code>.
        </p>
        <p className="text-xs text-slate-500">
          Open the browser console (<kbd>F12</kbd>) — it lists exactly which
          components are missing.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-secondary mt-6"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

// Wrap a page so an undefined import doesn't crash the whole app
function Safe({ component: Comp, name, role }) {
  if (!Comp) {
    return <MissingPage name={name} />;
  }
  const element = <Comp />;
  if (role) {
    return <ProtectedRoute role={role}>{element}</ProtectedRoute>;
  }
  return element;
}

// ============================================================
// AUTH GUARD
// ============================================================
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const redirect =
      user.role === 'admin' ? '/admin'
      : user.role === 'caretaker' ? '/caretaker'
      : '/tenant';
    return <Navigate to={redirect} replace />;
  }
  // Guard against broken Layout too
  if (!Layout) {
    return (
      <div className="p-8 text-rose-600">
        ⚠️ Layout component is missing — check <code>src/components/Layout.jsx</code>
      </div>
    );
  }
  return <Layout>{children}</Layout>;
}

// ============================================================
// ROUTES
// ============================================================
function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Safe component={Login} name="Login" />} />
      <Route path="/reserve" element={<Safe component={ReservePage} name="ReservePage" />} />
      <Route
        path="/reserve/success/:reference"
        element={<Safe component={ReserveSuccess} name="ReserveSuccess" />}
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={<Safe component={AdminDashboard} name="AdminDashboard" role="admin" />}
      />
      <Route
        path="/admin/properties"
        element={<Safe component={ManageProperties} name="ManageProperties" role="admin" />}
      />
      <Route
        path="/admin/rooms"
        element={<Safe component={ManageRooms} name="ManageRooms" role="admin" />}
      />
      <Route
        path="/admin/tenants"
        element={<Safe component={ManageTenants} name="ManageTenants" role="admin" />}
      />
      <Route
        path="/admin/reservations"
        element={<Safe component={Reservations} name="Reservations" role="admin" />}
      />
      <Route
        path="/admin/rent"
        element={<Safe component={RentPayments} name="RentPayments" role="admin" />}
      />
      <Route
        path="/admin/utilities"
        element={<Safe component={UtilityCharges} name="UtilityCharges" role="admin" />}
      />
      <Route
        path="/admin/expenses"
        element={<Safe component={Expenses} name="Expenses" role="admin" />}
      />
      <Route
        path="/admin/analytics"
        element={<Safe component={Analytics} name="Analytics" role="admin" />}
      />
      <Route
        path="/admin/settings"
        element={<Safe component={PaymentSettings} name="PaymentSettings" role="admin" />}
      />
      <Route
        path="/admin/users"
        element={<Safe component={ManageUsers} name="ManageUsers" role="admin" />}
      />

      {/* CARETAKER */}
      <Route
        path="/caretaker"
        element={<Safe component={CaretakerDashboard} name="CaretakerDashboard" role="caretaker" />}
      />
      <Route
        path="/caretaker/tenants"
        element={<Safe component={ManageTenants} name="ManageTenants" role="caretaker" />}
      />
      <Route
        path="/caretaker/reservations"
        element={<Safe component={Reservations} name="Reservations" role="caretaker" />}
      />
      <Route
        path="/caretaker/rent"
        element={<Safe component={RentPayments} name="RentPayments" role="caretaker" />}
      />

      {/* TENANT */}
      <Route
        path="/tenant"
        element={<Safe component={TenantDashboard} name="TenantDashboard" role="tenant" />}
      />
      <Route
        path="/tenant/pay"
        element={<Safe component={PayBill} name="PayBill" role="tenant" />}
      />
      <Route
        path="/tenant/pending/:id"
        element={<Safe component={PaymentPending} name="PaymentPending" role="tenant" />}
      />
      <Route
        path="/tenant/receipt/:id"
        element={<Safe component={Receipt} name="Receipt" role="tenant" />}
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}