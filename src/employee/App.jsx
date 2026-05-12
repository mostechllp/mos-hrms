import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leaves from './pages/Leaves';
import RequestLeave from './pages/RequestLeave';
import Profile from './pages/Profile';
import './App.css'
import WFH from './pages/WFH';
import TaskReports from './pages/TaskReports';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/request-leave" element={<RequestLeave />} />
          <Route path="/wfh" element={<WFH />} />
          <Route path="/task-reports" element={<TaskReports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;