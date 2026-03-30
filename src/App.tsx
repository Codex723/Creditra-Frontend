import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { CreditLines } from "./pages/CreditLines";
import { WalletProvider } from "./context/WalletContext";
import { WalletButton } from "./components/WalletButton";
import DrawCreditPage from "./pages/DrawCreditPage";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "./components/notifications/ToastContainer";
import { BannerAlerts } from "./components/notifications/BannerAlert";
import { NotificationCenter } from "./components/notifications/NotificationCenter";
import { NotificationBell } from "./components/notifications/NotificationBell";

function App() {
  return (
    <WalletProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="app">
            <BannerAlerts />
            <header className="header">
              <Link to="/" className="logo">
                Creditra
              </Link>
              <nav>
                <Link to="/">Dashboard</Link>
                <Link to="/credit-lines">Credit Lines</Link>
                <Link to="/open-credit">Open Credit Line</Link>
              </nav>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <NotificationBell />
                <WalletButton />
              </div>
            </header>
            <main className="main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/draw-credit" element={<DrawCreditPage />} />
                <Route path="/credit-lines" element={<CreditLines />} />
                <Route path="/open-credit" element={<RequestEvaluation />} />
              </Routes>
            </main>
          </div>
          <ToastContainer />
          <NotificationCenter />
        </BrowserRouter>
      </NotificationProvider>
    </WalletProvider>
  );
}

export default App;
