import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Create from './pages/create/Create';
import Signup from './pages/signup/Signup';
import Rooms from './pages/rooms/Rooms';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/signup" element={<Signup />} />
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
