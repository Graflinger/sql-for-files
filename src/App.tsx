import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Docs from './pages/Docs';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/Notification/NotificationContainer';

/**
 * Main App Component
 *
 * Handles routing for the application
 */
function App() {
  return (
    <NotificationProvider>
      <ScrollToTop />
      <NotificationContainer />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Layout>
    </NotificationProvider>
  );
}

export default App;
