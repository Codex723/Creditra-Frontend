import { BrowserRouter, NavLink, Route, Routes, Link } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { CreditLines } from "./pages/CreditLines";
import { WalletProvider } from "./context/WalletContext";
import { WalletButton } from "./components/WalletButton";
import DrawCreditPage from "./pages/DrawCreditPage";
import { RequestEvaluation } from "./pages/RequestEvaluation";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="app">
          <header className="header">
            <Link to="/" className="logo">
              Creditra
            </Link>
            <nav className="header-nav" aria-label="Primary navigation">
              <NavLink to="/" end className="header-nav-link">
                Dashboard
              </NavLink>
              <NavLink to="/credit-lines" className="header-nav-link">
                Credit Lines
              </NavLink>
              <NavLink to="/open-credit" className="header-nav-link">
                Open Credit Line
              </NavLink>
            </nav>
            <WalletButton />
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
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
