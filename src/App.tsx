import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CreditLines } from './pages/CreditLines';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <Link to="/" className="logo">Creditra</Link>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/credit-lines">Credit Lines</Link>
          </nav>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/credit-lines" element={<CreditLines />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
