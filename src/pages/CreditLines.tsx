import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RepayModal } from '../components/RepayModal';

import type {
  CreditLine,
  CreditLineStatus,
  SortDirection,
  SortField,
} from '../types/creditLine';

import { MOCK_CREDIT_LINES } from '../data/mockData';

import {
  COLOR,
  STATUS_COLOR,
  RISK_COLOR,
  btn,
  fmt,
  fmtDate,
  fmtDateTime,
  getUtilizationLevel,
  utilizationPct,
} from '../utils/tokens';

const statusOrder: CreditLineStatus[] = ['Active', 'Suspended', 'Defaulted', 'Closed'];
const walletBalance = 250000;

function sortCreditLines(lines: CreditLine[], field: SortField, direction: SortDirection) {
  const sorted = [...lines].sort((a, b) => {
    switch (field) {
      case 'status':
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      case 'limit':
        return a.limit - b.limit;
      case 'utilization':
        return utilizationPct(a.utilized, a.limit) - utilizationPct(b.utilized, b.limit);
      case 'updatedAt':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case 'apr':
        return a.apr - b.apr;
      case 'riskScore':
        return a.riskScore - b.riskScore;
    }
  });

  return direction === 'asc' ? sorted : sorted.reverse();
}

export function CreditLines() {
  const [creditLines, setCreditLines] = useState(MOCK_CREDIT_LINES);
  const [statusFilter, setStatusFilter] = useState<CreditLineStatus | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedLine, setSelectedLine] = useState<CreditLine | null>(null);

  const filteredLines = useMemo(() => {
    const visibleLines = statusFilter === 'All'
      ? creditLines
      : creditLines.filter((line) => line.status === statusFilter);

    return sortCreditLines(visibleLines, sortField, sortDirection);
  }, [creditLines, sortDirection, sortField, statusFilter]);

  const activeExposure = useMemo(
    () => creditLines.filter((line) => line.status === 'Active').reduce((sum, line) => sum + line.utilized, 0),
    [creditLines]
  );

  const totalLimit = useMemo(
    () => creditLines.filter((line) => line.status !== 'Closed').reduce((sum, line) => sum + line.limit, 0),
    [creditLines]
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection(field === 'status' ? 'asc' : 'desc');
  };

  const handleRepaySuccess = (amount: number) => {
    if (!selectedLine) return;

    setCreditLines((current) =>
      current.map((line) =>
        line.id === selectedLine.id
          ? {
              ...line,
              utilized: Math.max(0, line.utilized - amount),
              updatedAt: new Date().toISOString(),
            }
          : line
      )
    );
    setSelectedLine(null);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.35rem', color: COLOR.text, fontSize: '1.6rem' }}>Credit Lines</h1>
          <p style={{ margin: 0, color: COLOR.muted, maxWidth: 640 }}>
            Monitor utilization, risk, and repayment activity across every line in one place.
          </p>
        </div>
        <Link to="/open-credit" style={{ ...btn.primary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Open Credit Line
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Open Lines', value: String(creditLines.filter((line) => line.status !== 'Closed').length), tone: COLOR.accent },
          { label: 'Total Limit', value: fmt(totalLimit), tone: COLOR.text },
          { label: 'Active Exposure', value: fmt(activeExposure), tone: COLOR.warning },
          { label: 'Available Wallet', value: fmt(walletBalance), tone: COLOR.success },
        ].map((metric) => (
          <div key={metric.label} className="card" style={{ marginBottom: 0 }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {metric.label}
            </p>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: metric.tone }}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: COLOR.text, fontWeight: 600 }}>Portfolio View</p>
            <p style={{ margin: 0, color: COLOR.muted, fontSize: '0.9rem' }}>
              Sorted by {sortField} ({sortDirection}).
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLOR.muted }}>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CreditLineStatus | 'All')}
              style={{ background: COLOR.surface, color: COLOR.text, border: `1px solid ${COLOR.border}`, borderRadius: 6, padding: '0.45rem 0.65rem' }}
            >
              <option value="All">All</option>
              {statusOrder.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {filteredLines.map((line) => {
          const utilization = utilizationPct(line.utilized, line.limit);
          const utilizationLevel = getUtilizationLevel(line.utilized, line.limit);
          const statusTone = STATUS_COLOR[line.status];

          return (
            <div key={line.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <h2 style={{ margin: 0, color: COLOR.text, fontSize: '1.1rem' }}>{line.name}</h2>
                    <span style={{ background: statusTone.bg, color: statusTone.color, padding: '0.2rem 0.55rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                      {line.status}
                    </span>
                    <span style={{ color: COLOR.muted, fontSize: '0.85rem' }}>{line.id}</span>
                  </div>
                  <p style={{ margin: 0, color: COLOR.muted, fontSize: '0.9rem' }}>
                    Opened {fmtDate(line.openedAt)}. Last activity {fmtDateTime(line.updatedAt)}.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => handleSort('updatedAt')} style={btn.ghost}>Sort by Activity</button>
                  <button type="button" onClick={() => handleSort('riskScore')} style={btn.ghost}>Sort by Risk</button>
                  <button type="button" onClick={() => setSelectedLine(line)} style={btn.repay}>
                    Repay
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.2rem', color: COLOR.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>Limit</p>
                  <p style={{ margin: 0, color: COLOR.text, fontWeight: 700 }}>{fmt(line.limit)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.2rem', color: COLOR.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>Utilized</p>
                  <p style={{ margin: 0, color: COLOR.text, fontWeight: 700 }}>{fmt(line.utilized)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.2rem', color: COLOR.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>APR</p>
                  <p style={{ margin: 0, color: COLOR.text, fontWeight: 700 }}>{line.apr.toFixed(2)}%</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.2rem', color: COLOR.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>Risk Score</p>
                  <p style={{ margin: 0, color: RISK_COLOR(line.riskScore), fontWeight: 700 }}>{line.riskScore}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: COLOR.muted, fontSize: '0.85rem' }}>
                  <span>Utilization</span>
                  <span style={{ color: utilizationLevel === 'low' ? COLOR.success : utilizationLevel === 'medium' ? COLOR.warning : COLOR.danger }}>
                    {utilization}%
                  </span>
                </div>
                <div style={{ height: 10, background: COLOR.border, borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(utilization, 100)}%`,
                      height: '100%',
                      background: utilizationLevel === 'low' ? COLOR.success : utilizationLevel === 'medium' ? COLOR.warning : COLOR.danger,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', color: COLOR.muted, fontSize: '0.85rem' }}>
                <span>Collateral: {line.collateral || 'Unsecured'}</span>
                <span>
                  {line.nextPaymentDate && line.nextPaymentAmount
                    ? `Next payment ${fmt(line.nextPaymentAmount)} on ${fmtDate(line.nextPaymentDate)}`
                    : 'No scheduled payment'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedLine && (
        <RepayModal
          creditLine={selectedLine}
          walletBalance={walletBalance}
          onClose={() => setSelectedLine(null)}
          onSuccess={handleRepaySuccess}
        />
      )}
    </>
  );
}
