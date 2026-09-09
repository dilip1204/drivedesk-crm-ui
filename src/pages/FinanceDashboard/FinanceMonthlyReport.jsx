import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import {
  getFinanceMonthlyReport,
  getFinanceYearlyReport,
} from "../../store/financeDashboard/actions";

const now = new Date();
const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const formatCurrency = (value) =>
  `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const readNumber = (sources, keys) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      const value = Number(source[key]);
      if (Number.isFinite(value)) return value;
    }
  }
  return 0;
};

const normalizeBreakdown = (source, labelKeys, valueKeys) => {
  if (Array.isArray(source)) {
    return source.map((item, index) => ({
      label:
        labelKeys.map((key) => item?.[key]).find(Boolean) || `Item ${index + 1}`,
      value: readNumber([item], valueKeys),
    }));
  }

  if (source && typeof source === "object") {
    return Object.entries(source).map(([label, value]) => ({
      label,
      value: typeof value === "object" ? readNumber([value], valueKeys) : Number(value) || 0,
    }));
  }

  return [];
};

const FinanceMonthlyReport = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const {
    monthlyReportData,
    monthlyReportLoading,
    monthlyReportError,
    yearlyReportData,
    yearlyReportLoading,
    yearlyReportError,
  } = useSelector((state) => state.financeDashboardInfo);
  const [reportType, setReportType] = useState("monthly");
  const [period, setPeriod] = useState(defaultPeriod);
  const [appliedPeriod, setAppliedPeriod] = useState(defaultPeriod);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [appliedYear, setAppliedYear] = useState(String(now.getFullYear()));

  const loadReport = useCallback(
    (type, selectedValue) => {
      if (type === "yearly") {
        dispatch(getFinanceYearlyReport({ year: Number(selectedValue) }));
        return;
      }
      const [selectedYear, month] = selectedValue.split("-").map(Number);
      dispatch(getFinanceMonthlyReport({ year: selectedYear, month }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!show) return;
    loadReport(reportType, reportType === "yearly" ? appliedYear : appliedPeriod);
  }, [appliedPeriod, appliedYear, loadReport, reportType, show]);

  const selectedData = reportType === "yearly" ? yearlyReportData : monthlyReportData;
  const reportLoading = reportType === "yearly" ? yearlyReportLoading : monthlyReportLoading;
  const reportError = reportType === "yearly" ? yearlyReportError : monthlyReportError;

  const report = useMemo(() => {
    const response = selectedData?.response ?? selectedData ?? {};
    return response?.yearly_report || response?.yearlyReport || response?.monthly_report || response?.monthlyReport || response?.report || response;
  }, [selectedData]);

  const summary = report?.summary || report?.totals || report || {};
  const sources = [summary, report];
  const metrics = [
    {
      label: "Total Income",
      value: readNumber(sources, ["total_income", "revenue", "total_revenue", "income"]),
      icon: "bi-graph-up-arrow",
      tone: "income",
    },
    {
      label: "Total Expenses",
      value: readNumber(sources, ["total_business_expenses", "business_expenses", "total_expenses", "expenses"]),
      icon: "bi-receipt",
      tone: "expense",
    },
    {
      label: "Operating Balance",
      value: readNumber(sources, ["operating_balance", "profit", "net_income"]),
      icon: "bi-bar-chart-line",
      tone: "profit",
    },
    {
      label: "Partner Settlements",
      value: readNumber(sources, ["partner_settlements", "total_partner_settlements"]),
      icon: "bi-arrow-left-right",
      tone: "partner",
    },
    {
      label: "Partner Withdrawals",
      value: readNumber(sources, ["partner_withdrawals", "total_partner_withdrawals"]),
      icon: "bi-cash-stack",
      tone: "withdrawal",
    },
  ];

  const incomeBreakdown = normalizeBreakdown(
    report?.income_breakdown,
    ["tenant_id", "tenant_name", "org_name", "category", "name"],
    ["amount", "total", "value"]
  );
  const expenseBreakdown = normalizeBreakdown(
    report?.expense_breakdown,
    ["category", "tenant_id", "tenant_name", "org_name", "name"],
    ["amount", "total", "value"]
  );
  const categories = normalizeBreakdown(
    report?.by_category || report?.category_breakdown || report?.categories,
    ["category", "name", "label", "type"],
    ["amount", "total", "value", "balance"]
  );
  const partners = normalizeBreakdown(
    report?.partner_balances || report?.partners,
    ["partner", "partner_name", "name"],
    ["outstanding", "balance", "amount", "total"]
  );
  const partnerDetails = Array.isArray(report?.partner_balances)
    ? report.partner_balances.map((partner, index) => ({
        name: partner?.partner || partner?.partner_name || partner?.name || `Partner ${index + 1}`,
        funded: readNumber([partner], ["funded", "funded_amount"]),
        settled: readNumber([partner], ["settled", "settled_amount"]),
        outstanding: readNumber([partner], ["outstanding", "balance", "amount"]),
      }))
    : [];
  const yearlyMonths = Array.isArray(report?.months)
    ? report.months.map((item, index) => {
        const monthNumber = Number(item?.month) || index + 1;
        return {
          month: monthNumber,
          label: new Date(2000, Math.min(12, Math.max(1, monthNumber)) - 1, 1).toLocaleString("en-IN", { month: "long" }),
          income: readNumber([item], ["income", "total_income", "revenue"]),
          expenses: readNumber([item], ["expenses", "total_expenses", "business_expenses"]),
          operatingBalance: readNumber([item], ["operating_balance", "profit", "net_income"]),
        };
      })
    : [];
  const months = normalizeBreakdown(
    report?.by_month || report?.monthly_breakdown,
    ["month_name", "month", "period", "label", "name"],
    ["operating_balance", "profit", "net_income", "amount", "total", "value"]
  );

  const [appliedPeriodYear, appliedPeriodMonth] = appliedPeriod.split("-").map(Number);
  const responseYear = Number(report?.year) || (reportType === "yearly" ? Number(appliedYear) : appliedPeriodYear);
  const responseMonth = Number(report?.month) || appliedPeriodMonth;
  const reportTitle = reportType === "yearly"
    ? `Financial Year ${responseYear}`
    : new Date(responseYear, responseMonth - 1, 1).toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      });
  const reportPeriod = reportType === "yearly"
    ? String(responseYear)
    : `${responseYear}-${String(responseMonth).padStart(2, "0")}`;
  const hasError = Boolean(reportError || selectedData?.isError);

  const submitPeriod = (event) => {
    event.preventDefault();
    const selectedValue = reportType === "yearly" ? year : period;
    const appliedValue = reportType === "yearly" ? appliedYear : appliedPeriod;
    if (!selectedValue) return;
    if (selectedValue === appliedValue) loadReport(reportType, selectedValue);
    else if (reportType === "yearly") setAppliedYear(selectedValue);
    else setAppliedPeriod(selectedValue);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="finance-monthly-report-modal"
    >
      <Modal.Header closeButton>
        <div className="finance-modal-title">
          <span aria-hidden="true"><i className="bi bi-calendar2-week" /></span>
          <div>
            <Modal.Title>Finance Reports</Modal.Title>
            <small>Review consolidated monthly or yearly finance activity.</small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="finance-report-tabs" role="tablist" aria-label="Finance report type">
          <button
            type="button"
            role="tab"
            aria-selected={reportType === "monthly"}
            className={reportType === "monthly" ? "is-active" : ""}
            onClick={() => setReportType("monthly")}
          >
            <i className="bi bi-calendar2" aria-hidden="true" /> Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reportType === "yearly"}
            className={reportType === "yearly" ? "is-active" : ""}
            onClick={() => setReportType("yearly")}
          >
            <i className="bi bi-calendar3" aria-hidden="true" /> Yearly
          </button>
        </div>

        <form className="finance-report-period" onSubmit={submitPeriod}>
          <div>
            <label htmlFor="finance-report-period">{reportType === "yearly" ? "Report Year" : "Report Month"}</label>
            {reportType === "yearly" ? (
              <input
                id="finance-report-period"
                type="number"
                min="2000"
                max="2100"
                inputMode="numeric"
                className="form-control"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
              />
            ) : (
              <input
                id="finance-report-period"
                type="month"
                min="2000-01"
                max="2100-12"
                className="form-control"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                required
              />
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={reportLoading}>
            <i className="bi bi-arrow-repeat" aria-hidden="true" />
            <span>{reportLoading ? "Generating" : "Generate Report"}</span>
          </button>
        </form>

        {reportLoading ? (
          <LoadingState label={`Generating ${reportType} report`} description="Loading finance totals and breakdowns." />
        ) : hasError ? (
          <EmptyState
            icon="bi bi-exclamation-circle"
            title={`Unable to load ${reportType} report`}
            description={`The ${reportType} finance report could not be loaded. Please try again.`}
            variant="error"
            actionLabel="Try again"
            onAction={() => loadReport(reportType, reportPeriod)}
          />
        ) : (
          <div className="finance-report-content">
            <div className="finance-report-title-row">
              <div>
                <span>FINANCE REPORT</span>
                <h3>{reportTitle}</h3>
              </div>
              <span className="finance-report-period-badge">{reportPeriod}</span>
            </div>

            <div className="finance-report-metrics">
              {metrics.map((metric) => (
                <article className={`finance-report-metric tone-${metric.tone}`} key={metric.label}>
                  <span><i className={`bi ${metric.icon}`} aria-hidden="true" /></span>
                  <div>
                    <small>{metric.label}</small>
                    <strong>{formatCurrency(metric.value)}</strong>
                  </div>
                </article>
              ))}
            </div>

            {(reportType === "monthly" || incomeBreakdown.length > 0 || expenseBreakdown.length > 0 || categories.length > 0 || partners.length > 0 || months.length > 0 || yearlyMonths.length > 0) && (
              <div className="finance-report-breakdowns">
                {reportType === "yearly" && yearlyMonths.length > 0 && (
                  <section className="finance-yearly-months-section">
                    <h4>Monthly Performance</h4>
                    <div className="finance-yearly-months-table-wrap">
                      <table className="finance-yearly-months-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Income</th>
                            <th>Expenses</th>
                            <th>Operating Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearlyMonths.map((item) => (
                            <tr key={item.month}>
                              <td>{item.label}</td>
                              <td>{formatCurrency(item.income)}</td>
                              <td>{formatCurrency(item.expenses)}</td>
                              <td className={item.operatingBalance < 0 ? "is-negative" : item.operatingBalance > 0 ? "is-positive" : ""}>
                                {formatCurrency(item.operatingBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {reportType === "yearly" && months.length > 0 && (
                  <section>
                    <h4>Monthly Breakdown</h4>
                    {months.map((item) => (
                      <div className="finance-report-breakdown-row" key={item.label}>
                        <span>{String(item.label).replace(/_/g, " ")}</span>
                        <strong>{formatCurrency(item.value)}</strong>
                      </div>
                    ))}
                  </section>
                )}
                {(reportType === "monthly" || incomeBreakdown.length > 0) && (
                  <section>
                    <h4>Income Breakdown</h4>
                    {incomeBreakdown.length > 0 ? (
                      incomeBreakdown.map((item, index) => (
                        <div className="finance-report-breakdown-row" key={`${item.label}-${index}`}>
                          <span>{String(item.label).replace(/_/g, " ")}</span>
                          <strong>{formatCurrency(item.value)}</strong>
                        </div>
                      ))
                    ) : (
                      <div className="finance-report-empty-breakdown">No income recorded for this month.</div>
                    )}
                  </section>
                )}
                {(reportType === "monthly" || expenseBreakdown.length > 0) && (
                  <section>
                    <h4>Expense Breakdown</h4>
                    {expenseBreakdown.length > 0 ? (
                      expenseBreakdown.map((item, index) => (
                        <div className="finance-report-breakdown-row" key={`${item.label}-${index}`}>
                          <span>{String(item.label).replace(/_/g, " ")}</span>
                          <strong>{formatCurrency(item.value)}</strong>
                        </div>
                      ))
                    ) : (
                      <div className="finance-report-empty-breakdown">No expenses recorded for this month.</div>
                    )}
                  </section>
                )}
                {categories.length > 0 && (
                  <section>
                    <h4>Category Breakdown</h4>
                    {categories.map((item) => (
                      <div className="finance-report-breakdown-row" key={item.label}>
                        <span>{String(item.label).replace(/_/g, " ")}</span>
                        <strong>{formatCurrency(item.value)}</strong>
                      </div>
                    ))}
                  </section>
                )}
                {(reportType === "monthly" || partners.length > 0) && (
                  <section>
                    <h4>Partner Balances</h4>
                    {partnerDetails.length > 0
                      ? partnerDetails.map((partner) => (
                          <div className="finance-report-partner-row" key={partner.name}>
                            <div>
                              <span>{partner.name}</span>
                              <small>Funded {formatCurrency(partner.funded)} | Settled {formatCurrency(partner.settled)}</small>
                            </div>
                            <strong>{formatCurrency(partner.outstanding)}</strong>
                          </div>
                        ))
                      : partners.length > 0 ? partners.map((item, index) => (
                          <div className="finance-report-breakdown-row" key={`${item.label}-${index}`}>
                            <span>{item.label}</span>
                            <strong>{formatCurrency(item.value)}</strong>
                          </div>
                        )) : (
                          <div className="finance-report-empty-breakdown">No partner balances available.</div>
                        )}
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinanceMonthlyReport;
