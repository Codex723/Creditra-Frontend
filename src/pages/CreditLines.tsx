export function CreditLines() {
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Credit Lines</h1>
      <p className="card" style={{ color: 'var(--muted)' }}>
        View and manage your credit lines. Open, draw, and repay through the Soroban contract once deployed.
      </p>
      <div className="card">
        <h2>Active credit lines</h2>
        <p>No credit lines yet. Request a credit evaluation from the Risk Engine to open a line.</p>
      </div>
    </>
  );
}
