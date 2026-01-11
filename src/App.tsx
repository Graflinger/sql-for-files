import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import SqlEditor from "./pages/SQLEditor";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/Notification/NotificationContainer";

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
          <Route path="/editor" element={<SqlEditor />} />
          <Route path="/" element={<About />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<Legal />} />
        </Routes>
      </Layout>
    </NotificationProvider>
  );
}

export default App;
