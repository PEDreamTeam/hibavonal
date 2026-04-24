import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Tickets from './pages/tickets/Tickets';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import ToolOrderForm from './pages/tool-order/ToolOrderForm';
import Rooms from './pages/rooms/Rooms';
import AddToolForm from './pages/tools/AddToolForm';
const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tool-order" element={<ToolOrderForm />} />
        <Route path="/tools/new" element={<AddToolForm />} />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute roles={['admin']}>
              <Rooms />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
