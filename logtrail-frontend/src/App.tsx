import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Logs from './pages/Logs';
import LiveConsole from './pages/LiveConsole';
import Settings from './pages/Settings';
import { SidebarProvider } from './hooks/useSidebar';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <SidebarProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/live-console" element={<LiveConsole />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </SidebarProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;