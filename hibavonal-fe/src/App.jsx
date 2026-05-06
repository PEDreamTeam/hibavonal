import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Tickets from './pages/tickets/Tickets';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import ToolOrderForm from './pages/tool-order/ToolOrderForm';
import ToolOrdersList from './pages/tool-orders/ToolOrdersList';
import Rooms from './pages/rooms/Rooms';
import AddTicketTypeForm from './pages/ticket-types/AddTicketTypeForm';
import StudentFeedbackForm from './pages/feedback/StudentFeedbackForm';
import AddToolForm from './pages/tools/AddToolForm';
import ToolsList from './pages/tools/ToolsList';
import Settings from './pages/settings/Settings';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tool-order" element={<ToolOrderForm />} />
        <Route path="/ticket-types/new" element={<AddTicketTypeForm />} />
        <Route path="/feedback/new" element={<StudentFeedbackForm />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/tools"
          element={
            <ProtectedRoute
              roles={['maintainer', 'maintenance_manager', 'admin']}
            >
              <ToolsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tools/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <AddToolForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tool-orders/list"
          element={
            <ProtectedRoute
              roles={['maintainer', 'maintenance_manager', 'admin']}
            >
              <ToolOrdersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute
              roles={['admin', 'maintainer', 'maintenance_manager']}
            >
              <Rooms />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
