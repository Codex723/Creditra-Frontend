export function Dashboard() {
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p className="card" style={{ color: 'var(--muted)' }}>
        Overview of your credit lines, risk score, and utilization. Connect the Creditra backend to see live data.
      </p>
      <div className="card">
        <h2>Credit summary</h2>
        <p>Total limit: — | Utilized: — | Available: —</p>
      </div>
      <div className="card">
        <h2>Risk score</h2>
        <p>Your dynamic risk score will appear here once the risk engine is connected.</p>
      </div>
    </>
  );
}
