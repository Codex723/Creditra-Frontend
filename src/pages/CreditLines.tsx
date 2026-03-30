import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RepayModal } from '../components/RepayModal';
import { MOCK_CREDIT_LINES } from '../data/mockData';
import type {
  CreditLine,
  CreditLineStatus,
  SortDirection,
  SortField,
} from '../types/creditLine';
import {
  COLOR,
  RISK_COLOR,
  STATUS_COLOR,
  btn,
  fmt,
  fmtDateTime,
  getUtilizationLevel,
  utilizationPct,
} from '../utils/tokens';

const FILTERS: Array<CreditLineStatus | 'All'> = [
  'All',
  'Active',
  'Suspended',
  'Defaulted',
  'Closed',
];

export function CreditLines() {
  const [statusFilter, setStatusFilter] = useState<CreditLineStatus | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [repayTarget, setRepayTarget] = useState<CreditLine | null>(null);
  const [walletBalance, setWalletBalance] = useState(250000);

  const filteredLines = useMemo(() => {
    const visibleLines =
      statusFilter === 'All'
        ? MOCK_CREDIT_LINES
        : MOCK_CREDIT_LINES.filter((line) => line.status === statusFilter);

    const sortedLines = [...visibleLines].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        case 'limit':
          return (a.limit - b.limit) * direction;
        case 'utilization':
          return (utilizationPct(a.utilized, a.limit) - utilizationPct(b.utilized, b.limit)) * direction;
        case 'apr':
          return (a.apr - b.apr) * direction;
        case 'riskScore':
          return (a.riskScore - b.riskScore) * direction;
        case 'updatedAt':
        default:
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
      }
    });

    return sortedLines;
  }, [sortDirection, sortField, statusFilter]);

  const totalLimit = filteredLines.reduce((sum, line) => sum + line.limit, 0);
  const totalUtilized = filteredLines.reduce((sum, line) => sum + line.utilized, 0);
  const totalAvailable = totalLimit - totalUtilized;

  const handleRepaySuccess = (amount: number) => {
    setWalletBalance((current) => Math.max(current - amount, 0));
    setRepayTarget(null);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.5rem', fontWeight: 700, color: COLOR.text }}>
            Credit Lines
          </h1>
          <p style={{ margin: 0, color: COLOR.muted }}>
            Review active facilities, track utilization, and launch draw or repay actions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/draw-credit" style={{ ...btn.draw, textDecoration: 'none' }}>
            Draw Credit
          </Link>
          <Link to="/open-credit" style={{ ...btn.primary, textDecoration: 'none' }}>
            Open Credit Line
          </Link>
        </div>
      </div>

      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <p style={{ marginBottom: '0.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Limit
          </p>
          <p style={{ margin: 0, color: COLOR.text, fontSize: '1.4rem', fontWeight: 700 }}>{fmt(totalLimit)}</p>
        </div>
        <div>
          <p style={{ marginBottom: '0.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Utilized
          </p>
          <p style={{ margin: 0, color: COLOR.warning, fontSize: '1.4rem', fontWeight: 700 }}>{fmt(totalUtilized)}</p>
        </div>
        <div>
          <p style={{ marginBottom: '0.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available
          </p>
          <p style={{ margin: 0, color: COLOR.success, fontSize: '1.4rem', fontWeight: 700 }}>{fmt(totalAvailable)}</p>
        </div>
        <div>
          <p style={{ marginBottom: '0.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Wallet Balance
          </p>
          <p style={{ margin: 0, color: COLOR.text, fontSize: '1.4rem', fontWeight: 700 }}>{fmt(walletBalance)}</p>
        </div>
      </div>

      <div
        className="card"
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'end',
          flexWrap: 'wrap',
        }}
      >
        <label className="form-field" style={{ minWidth: 180 }}>
          <span className="form-field__hint">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CreditLineStatus | 'All')}
            style={{
              background: COLOR.bg,
              border: `1px solid ${COLOR.border}`,
              color: COLOR.text,
              borderRadius: 8,
              padding: '0.65rem 0.75rem',
            }}
          >
            {FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field" style={{ minWidth: 180 }}>
          <span className="form-field__hint">Sort By</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            style={{
              background: COLOR.bg,
              border: `1px solid ${COLOR.border}`,
              color: COLOR.text,
              borderRadius: 8,
              padding: '0.65rem 0.75rem',
            }}
          >
            <option value="updatedAt">Last Updated</option>
            <option value="limit">Limit</option>
            <option value="utilization">Utilization</option>
            <option value="apr">APR</option>
            <option value="riskScore">Risk Score</option>
            <option value="status">Status</option>
          </select>
        </label>

        <button
          onClick={() =>
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
          }
          style={{ ...btn.secondary, minWidth: 140 }}
        >
          {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredLines.map((line) => {
          const statusTone = STATUS_COLOR[line.status];
          const utilization = utilizationPct(line.utilized, line.limit);
          const utilizationLevel = getUtilizationLevel(line.utilized, line.limit);

          return (
            <div key={line.id} className="card" style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, color: COLOR.text }}>{line.name}</h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 999,
                        background: statusTone.bg,
                        color: statusTone.color,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: statusTone.color,
                        }}
                      />
                      {line.status}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', color: COLOR.muted }}>
                    {line.id} · Updated {fmtDateTime(line.updatedAt)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to="/draw-credit" style={{ ...btn.draw, textDecoration: 'none' }}>
                    Draw
                  </Link>
                  <button
                    onClick={() => setRepayTarget(line)}
                    disabled={line.utilized <= 0}
                    style={{
                      ...btn.repay,
                      opacity: line.utilized <= 0 ? 0.5 : 1,
                      cursor: line.utilized <= 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Repay
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <Metric label="Limit" value={fmt(line.limit)} tone={COLOR.accent} />
                <Metric label="Utilized" value={fmt(line.utilized)} tone={COLOR.warning} />
                <Metric label="APR" value={`${line.apr.toFixed(2)}%`} tone={COLOR.text} />
                <Metric label="Risk Score" value={String(line.riskScore)} tone={RISK_COLOR(line.riskScore)} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ color: COLOR.muted, fontSize: '0.85rem' }}>Utilization</span>
                  <span style={{ color: COLOR.text, fontSize: '0.85rem', fontWeight: 600 }}>
                    {utilization}%
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: COLOR.border, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${utilization}%`,
                      height: '100%',
                      background:
                        utilizationLevel === 'low'
                          ? COLOR.success
                          : utilizationLevel === 'medium'
                            ? COLOR.warning
                            : COLOR.danger,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  color: COLOR.muted,
                  fontSize: '0.85rem',
                }}
              >
                <span>Opened: {fmtDateTime(line.openedAt)}</span>
                <span>Collateral: {line.collateral ?? 'Unsecured'}</span>
                <span>
                  Next Payment:{' '}
                  {line.nextPaymentDate && line.nextPaymentAmount
                    ? `${fmt(line.nextPaymentAmount)} on ${fmtDateTime(line.nextPaymentDate)}`
                    : 'No upcoming payment'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {repayTarget ? (
        <RepayModal
          creditLine={repayTarget}
          walletBalance={walletBalance}
          onClose={() => setRepayTarget(null)}
          onSuccess={handleRepaySuccess}
        />
      ) : null}
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      style={{
        padding: '0.9rem 1rem',
        background: COLOR.bg,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 10,
      }}
    >
      <p
        style={{
          margin: '0 0 0.35rem',
          color: COLOR.muted,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, color: tone, fontSize: '1.1rem', fontWeight: 700 }}>{value}</p>
    </div>
  );
}
