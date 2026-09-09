import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../Students/Students.css";
import "./FinanceDashboard.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import Pagination from "../Students/Pagenation";
import AddFinanceTransaction from "./AddFinanceTransaction";
import FinanceTransactionDetails from "./FinanceTransactionDetails";
import FinanceMonthlyReport from "./FinanceMonthlyReport";
import { FINANCE_EXPENSE_CATEGORIES } from "./financeCategories";
import { FINANCE_TRANSACTION_TYPES } from "./financeTransactionTypes";
import {
  deleteFinanceTransaction,
  getFinanceDashboard,
  getFinanceTransactions,
} from "../../store/financeDashboard/actions";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";

const readNumber = (sources, keys, fallback = 0) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }
  return fallback;
};

const formatCurrency = (value) =>
  `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  return {
    fromDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    toDate: toDateInputValue(today),
  };
};

const normalizePartnerBalances = (payload) => {
  const balances =
    payload?.partner_balances ||
    payload?.partnerBalances ||
    payload?.partners ||
    [];

  if (Array.isArray(balances)) {
    return balances.map((partner, index) => ({
      id: partner?.id || partner?.partner_id || partner?.name || partner?.partner || index,
      name: partner?.name || partner?.partner_name || partner?.partner || `Partner ${index + 1}`,
      funded: readNumber([partner], ["funded", "funded_amount"]),
      settled: readNumber([partner], ["settled", "settled_amount"]),
      balance: readNumber([partner], ["outstanding", "balance", "amount", "partner_balance"]),
    }));
  }

  if (balances && typeof balances === "object") {
    return Object.entries(balances).map(([name, balance]) => ({
      id: name,
      name,
      funded: Number(balance?.funded ?? 0) || 0,
      settled: Number(balance?.settled ?? 0) || 0,
      balance: Number(balance?.outstanding ?? balance?.balance ?? balance?.amount ?? balance) || 0,
    }));
  }

  return [];
};

const FinanceDashboard = () => {
  const dispatch = useDispatch();
  const {
    data,
    loading,
    error,
    transactionsData,
    transactionsLoading,
    transactionsError,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useSelector((state) => state.financeDashboardInfo);
  const hasApiError = Boolean(error || data?.isError);
  const defaultDateRange = useMemo(getDefaultDateRange, []);
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
  const [appliedRange, setAppliedRange] = useState(defaultDateRange);
  const [rangeError, setRangeError] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [appliedTransactionFilters, setAppliedTransactionFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState("");
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  const loadDashboard = useCallback(() => {
    dispatch(getFinanceDashboard(appliedRange));
  }, [appliedRange, dispatch]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadTransactions = useCallback(() => {
    dispatch(
      getFinanceTransactions({
        ...appliedRange,
        ...appliedTransactionFilters,
        page: currentPage,
        pageSize,
      })
    );
  }, [appliedRange, appliedTransactionFilters, currentPage, dispatch, pageSize]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refreshAll = () => {
    loadDashboard();
    loadTransactions();
  };

  const applyDateRange = (event) => {
    event.preventDefault();
    if (!fromDate || !toDate) {
      setRangeError("Select both From Date and To Date.");
      return;
    }
    if (fromDate > toDate) {
      setRangeError("From Date cannot be later than To Date.");
      return;
    }

    setRangeError("");
    setCurrentPage(1);
    setAppliedRange({ fromDate, toDate });
  };

  const applyTransactionFilters = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedTransactionFilters({
      type: transactionType,
      category: transactionCategory.trim(),
      paidBy: paidBy.trim(),
      tenantId: tenantId.trim(),
    });
  };

  const clearTransactionFilters = () => {
    setTransactionType("");
    setTransactionCategory("");
    setPaidBy("");
    setTenantId("");
    setCurrentPage(1);
    setAppliedTransactionFilters({});
  };

  const handleTransactionSaved = () => {
    const wasEditing = Boolean(editingTransaction);
    setShowAddTransaction(false);
    setEditingTransaction(null);
    toast.success(
      wasEditing
        ? "Finance transaction updated successfully."
        : "Finance transaction created successfully."
    );
    refreshAll();
  };

  const handleDeleteTransaction = (transactionId) => {
    if (!transactionId || deleteLoading) return;

    dispatch(
      deleteFinanceTransaction(transactionId, (responseData, requestError) => {
        if (requestError || responseData?.isError) {
          const errorData = requestError?.response?.data || requestError?.data || responseData;
          const detail = errorData?.response || errorData?.detail || errorData?.message;
          const message =
            typeof detail === "string"
              ? detail
              : detail?.message || "Unable to delete the finance transaction.";
          toast.error(message);
          return;
        }

        setDeleteTransactionId("");
        toast.success("Finance transaction deleted successfully.");
        loadDashboard();
        if (transactions.length === 1 && currentPage > 1) {
          setCurrentPage((page) => page - 1);
        } else {
          loadTransactions();
        }
      })
    );
  };

  const finance = useMemo(() => {
    const response = data?.response ?? data ?? {};
    const payload = response?.finance_dashboard ?? response?.financeDashboard ?? response;
    const summary = payload?.summary || payload?.totals || {};
    const sources = [payload, summary];

    const revenue = readNumber(sources, ["revenue", "total_revenue", "total_income", "income"]);
    const businessExpenses = readNumber(sources, [
      "business_expenses",
      "businessExpenses",
      "total_business_expenses",
      "total_expenses",
      "total_expense",
      "expenses",
    ]);
    const profit = readNumber(
      sources,
      ["operating_balance", "profit", "net_profit", "netProfit", "net_income"],
      revenue - businessExpenses
    );
    const cashAvailable = readNumber(sources, [
      "cash_available",
      "cashAvailable",
      "available_cash",
      "cash_balance",
      "cash_movement_balance",
    ]);
    const partnerSettlements = readNumber(sources, ["total_partner_settlements"]);
    const partnerWithdrawals = readNumber(sources, ["total_partner_withdrawals"]);

    return {
      revenue,
      businessExpenses,
      profit,
      cashAvailable,
      partnerSettlements,
      partnerWithdrawals,
      partnerBalances: normalizePartnerBalances(payload),
    };
  }, [data]);

  const metrics = [
    {
      key: "revenue",
      label: "Revenue",
      value: finance.revenue,
      icon: "bi-graph-up-arrow",
      tone: "revenue",
      description: "Total business income",
      footerLabel: "Recorded revenue",
    },
    {
      key: "expenses",
      label: "Business expenses",
      value: finance.businessExpenses,
      icon: "bi-receipt",
      tone: "expense",
      description: "Operating costs recorded",
      footerLabel: "Recorded expenses",
    },
    {
      key: "profit",
      label: "Profit",
      value: finance.profit,
      icon: "bi-bar-chart-line",
      tone: finance.profit < 0 ? "negative" : "profit",
      description: "Revenue minus business expenses",
      footerLabel: finance.profit < 0 ? "Needs attention" : "Current result",
    },
  ];

  const transactionResponse = transactionsData?.response ?? transactionsData ?? {};
  const transactions = Array.isArray(transactionResponse?.transactions)
    ? transactionResponse.transactions
    : [];
  const transactionTotal = Number(transactionResponse?.total) || 0;
  const hasTransactionError = Boolean(transactionsError || transactionsData?.isError);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light finance-dashboard-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <main className="content" aria-busy={loading}>
              <div className="finance-heading">
                <div>
                  <h1>Finance Dashboard</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item">
                        <Link to="/superadmin" className="finance-breadcrumb-home" aria-label="Super Admin">
                          <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                          </svg>
                        </Link>
                      </li>
                      <li className="breadcrumb-item">Super Admin</li>
                      <li className="breadcrumb-item" aria-current="page">Finance</li>
                    </ol>
                  </nav>
                </div>
                <div className="finance-heading-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setShowAddTransaction(true)}>
                    <i className="bi bi-plus-lg" aria-hidden="true" /> Add Transaction
                  </button>
                  <button type="button" className="btn btn-outline-primary" onClick={() => setShowMonthlyReport(true)}>
                    <i className="bi bi-calendar2-week" aria-hidden="true" /> Finance Reports
                  </button>
                  <button type="button" className="btn btn-outline-primary finance-refresh" onClick={refreshAll} disabled={loading || transactionsLoading}>
                    <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                    {loading || transactionsLoading ? "Refreshing" : "Refresh"}
                  </button>
                </div>
              </div>

              <section className="finance-filter-card" aria-label="Finance dashboard filters">
                <div className="finance-filter-copy">
                  <strong>Summary period</strong>
                  <span>Choose a date range for the finance summary.</span>
                </div>
                <form className="finance-filter-form" onSubmit={applyDateRange}>
                  <label>
                    <span>From Date</span>
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      max={toDate}
                      onChange={(event) => {
                        setFromDate(event.target.value);
                        setRangeError("");
                      }}
                    />
                  </label>
                  <label>
                    <span>To Date</span>
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      min={fromDate}
                      onChange={(event) => {
                        setToDate(event.target.value);
                        setRangeError("");
                      }}
                    />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="bi bi-funnel" aria-hidden="true" /> Apply
                  </button>
                </form>
                {rangeError && <div className="finance-filter-error" role="alert">{rangeError}</div>}
              </section>

              {loading && !data ? (
                <LoadingState
                  label="Loading finance dashboard"
                  description="Preparing revenue, expenses and partner balances."
                />
              ) : hasApiError ? (
                <EmptyState
                  icon="bi bi-exclamation-circle"
                  title="Unable to load finance dashboard"
                  description="The finance information could not be loaded. Please try again."
                  variant="error"
                  actionLabel="Try again"
                  onAction={refreshAll}
                />
              ) : (
                <>
                  <section className="finance-snapshot" aria-labelledby="finance-snapshot-title">
                    <div>
                      <span className="finance-section-eyebrow">Financial overview</span>
                      <h2 id="finance-snapshot-title">Business performance</h2>
                      <p>Revenue, operating costs and balances from {appliedRange.fromDate} to {appliedRange.toDate}.</p>
                    </div>
                    <span className="finance-live-status">
                      <i className="bi bi-shield-check" aria-hidden="true" /> Live account summary
                    </span>
                  </section>

                  <section className="finance-metric-grid" aria-label="Finance summary">
                    {metrics.map((metric) => (
                      <article className={`finance-metric-card tone-${metric.tone}`} key={metric.key}>
                        <div className="finance-metric-topline">
                          <span>{metric.label}</span>
                          <span className="finance-metric-icon" aria-hidden="true">
                            <i className={`bi ${metric.icon}`} />
                          </span>
                        </div>
                        <strong>{formatCurrency(metric.value)}</strong>
                        <small>{metric.description}</small>
                        <div className="finance-metric-footer">
                          {metric.link ? (
                            <Link to={metric.link}>
                              {metric.linkLabel} <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Link>
                          ) : (
                            <span>{metric.footerLabel}</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </section>

                  <section className="finance-lower-grid">
                    <div className="finance-cash-stack">
                      <article className="finance-cash-card">
                        <div className="finance-cash-icon" aria-hidden="true">
                          <i className="bi bi-wallet2" />
                        </div>
                        <div>
                          <span>Cash available</span>
                          <strong>{formatCurrency(finance.cashAvailable)}</strong>
                          <small>Cash movement balance</small>
                        </div>
                      </article>
                      <article className="finance-movement-card">
                        <div>
                          <span>Partner settlements</span>
                          <strong>{formatCurrency(finance.partnerSettlements)}</strong>
                        </div>
                        <div>
                          <span>Partner withdrawals</span>
                          <strong>{formatCurrency(finance.partnerWithdrawals)}</strong>
                        </div>
                      </article>
                    </div>

                    <section className="finance-partner-card" aria-labelledby="partner-balances-title">
                      <div className="finance-card-header">
                        <div>
                          <span className="finance-section-eyebrow">Ownership summary</span>
                          <h2 id="partner-balances-title">Partner balances</h2>
                        </div>
                        <span>{finance.partnerBalances.length} partner{finance.partnerBalances.length === 1 ? "" : "s"}</span>
                      </div>

                      {finance.partnerBalances.length ? (
                        <div className="finance-partner-list">
                          {finance.partnerBalances.map((partner) => (
                            <div className="finance-partner-row" key={partner.id}>
                              <span className="finance-partner-avatar" aria-hidden="true">
                                {String(partner.name || "P").charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <strong>{partner.name}</strong>
                                <small>Funded {formatCurrency(partner.funded)} · Settled {formatCurrency(partner.settled)}</small>
                              </div>
                              <div className="finance-partner-outstanding">
                                <small>Outstanding</small>
                                <strong className={partner.balance < 0 ? "is-negative" : ""}>
                                  {formatCurrency(partner.balance)}
                                </strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="finance-partner-empty">
                          <i className="bi bi-people" aria-hidden="true" />
                          <div>
                            <strong>No partner balances</strong>
                            <span>Partner balance details will appear here when available.</span>
                          </div>
                        </div>
                      )}
                    </section>
                  </section>

                  <section className="finance-transactions-card" aria-labelledby="finance-transactions-title">
                    <div className="finance-transactions-header">
                      <div>
                        <span className="finance-section-eyebrow">Detailed activity</span>
                        <h2 id="finance-transactions-title">Transactions</h2>
                        <p>Review finance activity for the selected date range.</p>
                      </div>
                      <span>{transactionTotal} transaction{transactionTotal === 1 ? "" : "s"}</span>
                    </div>

                    <form className="finance-transaction-filters" onSubmit={applyTransactionFilters}>
                      <label>
                        <span>Type</span>
                        <select className="form-select" value={transactionType} onChange={(event) => setTransactionType(event.target.value)}>
                          <option value="">All types</option>
                          {FINANCE_TRANSACTION_TYPES.map((type) => (
                            <option value={type.value} key={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Category</span>
                        <select className="form-select" value={transactionCategory} onChange={(event) => setTransactionCategory(event.target.value)}>
                          <option value="">All categories</option>
                          {FINANCE_EXPENSE_CATEGORIES.map((category) => (
                            <option value={category.value} key={category.value}>{category.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Paid By</span>
                        <input className="form-control" value={paidBy} placeholder="Enter payer" onChange={(event) => setPaidBy(event.target.value)} />
                      </label>
                      <label>
                        <span>Tenant ID</span>
                        <input className="form-control" value={tenantId} placeholder="Enter tenant ID" onChange={(event) => setTenantId(event.target.value)} />
                      </label>
                      <div className="finance-transaction-filter-actions">
                        <button type="submit" className="btn btn-primary" disabled={transactionsLoading}>
                          <i className="bi bi-funnel" aria-hidden="true" /> Apply
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={clearTransactionFilters} disabled={transactionsLoading}>
                          Clear
                        </button>
                      </div>
                    </form>

                    {transactionsLoading ? (
                      <LoadingState label="Loading transactions" description="Fetching finance activity." variant="compact" />
                    ) : hasTransactionError ? (
                      <EmptyState
                        icon="bi bi-exclamation-circle"
                        title="Unable to load transactions"
                        description="Transaction details could not be loaded. Please try again."
                        variant="error"
                        actionLabel="Try again"
                        onAction={loadTransactions}
                      />
                    ) : transactions.length === 0 ? (
                      <EmptyState
                        icon="bi bi-receipt"
                        title="No transactions found"
                        description="No finance transactions match the selected date range and filters."
                      />
                    ) : (
                      <>
                        <div className="table-responsive finance-transactions-table-wrap">
                          <table className="table custom-table align-middle finance-transactions-table">
                            <thead>
                              <tr>
                                <th>S.NO</th>
                                <th>Date</th>
                                <th>Tenant</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th className="text-right">Amount</th>
                                <th>Paid By</th>
                                <th className="finance-actions-column">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((transaction, index) => {
                                const type = transaction?.type || transaction?.transaction_type || "-";
                                const transactionId =
                                  transaction?.transaction_id || transaction?.id || transaction?._id || "";
                                return (
                                  <tr key={transactionId || `${currentPage}-${index}`}>
                                    <td data-label="S.No">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td data-label="Date">{formatDateDDMMYYYY(transaction?.date || transaction?.transaction_date || transaction?.created_at)}</td>
                                    <td data-label="Tenant">{transaction?.tenant_name || transaction?.org_name || transaction?.tenant_id || "-"}</td>
                                    <td data-label="Type"><span className={`finance-type-badge type-${String(type).toLowerCase().replace(/_/g, "-")}`}>{String(type).replace(/_/g, " ")}</span></td>
                                    <td data-label="Category">{transaction?.category || "-"}</td>
                                    <td data-label="Amount" className="finance-transaction-amount">{formatCurrency(transaction?.amount)}</td>
                                    <td data-label="Paid By">{transaction?.paid_by || transaction?.paidBy || "-"}</td>
                                    <td data-label="Actions" className="finance-actions-column">
                                      <div className="finance-transaction-actions">
                                        <button
                                          type="button"
                                          className="btn btn-sm finance-transaction-action-btn is-view finance-view-transaction"
                                          disabled={!transactionId}
                                          onClick={() => setSelectedTransactionId(transactionId)}
                                          title={transactionId ? "View transaction" : "Transaction ID unavailable"}
                                        >
                                          <i className="mdi mdi-eye" aria-hidden="true" />
                                          <span>View</span>
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm finance-transaction-action-btn is-edit finance-edit-transaction"
                                          disabled={!transactionId}
                                          onClick={() => {
                                            setShowAddTransaction(false);
                                            setEditingTransaction(transaction);
                                          }}
                                          title={transactionId ? "Edit transaction" : "Transaction ID unavailable"}
                                        >
                                          <i className="mdi mdi-pencil" aria-hidden="true" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm finance-transaction-action-btn is-delete finance-delete-transaction"
                                          disabled={!transactionId || deleteLoading}
                                          onClick={() => setDeleteTransactionId(transactionId)}
                                          title={transactionId ? "Delete transaction" : "Transaction ID unavailable"}
                                        >
                                          <i className="mdi mdi-delete" aria-hidden="true" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="finance-transactions-pagination">
                          <Pagination
                            currentPage={currentPage}
                            totalCount={transactionTotal}
                            pageSize={pageSize}
                            pageSizeOptions={[10, 20, 50, 100]}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                              setPageSize(size);
                              setCurrentPage(1);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </section>
                </>
              )}
            </main>
          </div>
          <AddFinanceTransaction
            key={editingTransaction?.transaction_id || editingTransaction?.id || editingTransaction?._id || (showAddTransaction ? "finance-transaction-open" : "finance-transaction-closed")}
            show={showAddTransaction || Boolean(editingTransaction)}
            saving={editingTransaction ? updateLoading : createLoading}
            isEdit={Boolean(editingTransaction)}
            transaction={editingTransaction}
            onClose={() => {
              setShowAddTransaction(false);
              setEditingTransaction(null);
            }}
            onCreated={handleTransactionSaved}
          />
          <FinanceTransactionDetails
            show={Boolean(selectedTransactionId)}
            transactionId={selectedTransactionId}
            onClose={() => setSelectedTransactionId("")}
          />
          <DeleteConfirmation
            showDeleteModal={Boolean(deleteTransactionId)}
            hideDeleteModal={() => {
              if (!deleteLoading) setDeleteTransactionId("");
            }}
            confirmModal={handleDeleteTransaction}
            id={deleteTransactionId}
            message="Are you sure you want to delete this finance transaction?"
          />
          <FinanceMonthlyReport
            show={showMonthlyReport}
            onClose={() => setShowMonthlyReport(false)}
          />
          <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
