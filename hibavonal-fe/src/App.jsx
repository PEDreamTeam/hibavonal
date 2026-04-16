import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import ToolOrders from './pages/toolorders/ToolOrders';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tool-orders" element={<ToolOrders />} />
      </Routes>
    </Layout>
  );
}

export default App;
