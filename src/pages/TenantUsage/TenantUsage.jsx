import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../Students/Students.css";
import "../SuperAdmin/SuperAdmin.css";
import "./TenantUsage.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Pagination from "../Students/Pagenation";
import { getSuperAdminList } from "../../store/superAdmin/actions";
import { getTenantUsageDashboard, getTenantUsageList } from "../../store/tenantUsage/actions";

const numberFormatter = new Intl.NumberFormat("en-IN");
const currentYear = new Date().getFullYear();
const usageYears = [
  ...Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index),
  ...Array.from({ length: 2100 - currentYear }, (_, index) => currentYear + index + 1),
];

const toNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const formatNumber = (value) => numberFormatter.format(toNumber(value));

const emptyFilters = {
  tenantId: "",
  dateMode: "period",
  fromDate: "",
  toDate: "",
  month: "",
  year: "",
};

const countActiveFilters = (filters) =>
  [filters.tenantId, filters.fromDate, filters.toDate, filters.month, filters.year].filter(Boolean).length;

const formatFilterDate = (value) => {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
};

const LocalTimestamp = ({ value }) => {
  if (!value) return <span className="tenant-usage-timestamp is-empty">Never</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className="tenant-usage-timestamp is-empty">Never</span>;
  }

  const localDate = date.toLocaleDateString("en-IN", { dateStyle: "medium" });
  const localTime = date.toLocaleTimeString("en-IN", { timeStyle: "short" });

  return (
    <span
      className="tenant-usage-timestamp"
      title={date.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "long" })}
    >
      <span>{localDate}</span>
      <small>{localTime}</small>
    </span>
  );
};

const getErrorStatus = (error, result) =>
  Number(
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.response?.data?.statusCode ||
    error?.data?.statusCode ||
    result?.statusCode ||
    0
  );

const getErrorMessage = (error, result) => {
  const source = error?.data || error?.response?.data || error || result || {};
  const detail = source?.response ?? source?.detail ?? source?.message;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && typeof detail.message === "string") return detail.message;
  return "Unable to load tenant usage. Please try again.";
};

const TenantUsage = () => {
  const dispatch = useDispatch();
  const {
    data: result,
    loading,
    error,
    listData: listResult,
    listLoading,
    listError,
  } = useSelector((state) => state.tenantUsageInfo);
  const {
    superAdminList,
    superAdminListLoading,
    superAdminListError,
  } = useSelector((state) => state.superAdminInfo);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [filterError, setFilterError] = useState("");
  const [copiedTenantKey, setCopiedTenantKey] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const copyResetTimer = useRef(null);

  const loadSummary = useCallback(() => {
    dispatch(getTenantUsageDashboard());
  }, [dispatch]);

  const loadList = useCallback(() => {
    dispatch(getTenantUsageList({ ...appliedFilters, page, limit }));
  }, [appliedFilters, dispatch, limit, page]);

  const loadTenants = useCallback(() => {
    dispatch(getSuperAdminList({ page: 1, limit: 100 }));
  }, [dispatch]);

  const refreshAll = () => {
    loadSummary();
    loadList();
    loadTenants();
  };

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  useEffect(() => () => {
    if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current);
  }, []);

  // The usage APIs use the standard wrapper; dashboard data is always read from result.response.
  const summary = result?.response || null;
  const statusCode = getErrorStatus(error, result);
  const isForbidden = statusCode === 403;
  const hasError = Boolean(error || result?.isError);
  const hasBlockingSummaryError = hasError && !result;
  const showInitialLoading = !result && !error;
  const listPayload = listResult?.response || null;
  const tenantRows = Array.isArray(listPayload?.tenants) ? listPayload.tenants : [];
  const tenantOptions = useMemo(() => {
    const response = superAdminList?.response ?? superAdminList ?? {};
    const tenants = Array.isArray(response)
      ? response
      : response?.tenants || response?.items || [];
    const uniqueTenants = new Map();

    tenants.forEach((tenant) => {
      const tenantId = tenant?.tenant_id || tenant?.id;
      if (tenantId && !uniqueTenants.has(tenantId)) {
        uniqueTenants.set(tenantId, tenant);
      }
    });

    return Array.from(uniqueTenants.values());
  }, [superAdminList]);
  const listTotal = toNumber(listPayload?.total);
  const listPage = Math.max(1, toNumber(listPayload?.page) || page);
  const listLimit = Math.max(1, toNumber(listPayload?.limit) || limit);
  const listStatusCode = getErrorStatus(listError, listResult);
  const listHasError = Boolean(listError || listResult?.isError);
  const hasBlockingListError = listHasError && !listResult;
  const listTotalPages = Math.max(1, Math.ceil(listTotal / listLimit));
  const listErrorMessage = listStatusCode === 500
    ? "Unable to load tenant usage. Please try again."
    : getErrorMessage(listError, listResult);
  const backendFilterError = listHasError && listStatusCode === 422
    ? getErrorMessage(listError, listResult)
    : "";
  const activeFilterCount = useMemo(
    () => countActiveFilters(appliedFilters),
    [appliedFilters]
  );
  const hasDraftFilters = countActiveFilters(draftFilters) > 0;

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFilterError("");
  };

  const updateDateMode = (dateMode) => {
    setDraftFilters((current) => (
      dateMode === "range"
        ? { ...current, dateMode, month: "", year: "" }
        : { ...current, dateMode, fromDate: "", toDate: "" }
    ));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    const hasPeriodFilter = Boolean(draftFilters.month || draftFilters.year);
    const hasDateRangeFilter = Boolean(draftFilters.fromDate || draftFilters.toDate);

    if (draftFilters.month && !draftFilters.year) {
      setFilterError("Select a year before selecting a month.");
      return;
    }
    if (draftFilters.fromDate && draftFilters.toDate && draftFilters.fromDate > draftFilters.toDate) {
      setFilterError("From date cannot be later than to date.");
      return;
    }
    if (hasPeriodFilter && hasDateRangeFilter) {
      setFilterError("Choose either month/year or a custom date range.");
      return;
    }

    const nextFilters = {
      ...emptyFilters,
      tenantId: draftFilters.tenantId.trim(),
      dateMode: draftFilters.dateMode,
      ...(draftFilters.dateMode === "range"
        ? { fromDate: draftFilters.fromDate, toDate: draftFilters.toDate }
        : { month: draftFilters.month, year: draftFilters.year }),
    };

    setFilterError("");
    setPage(1);
    setAppliedFilters(nextFilters);
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setFilterError("");
    setPage(1);
  };

  const copyTenantId = async (tenantId, rowKey) => {
    if (!tenantId) return;
    try {
      await navigator.clipboard.writeText(tenantId);
      setCopiedTenantKey(rowKey);
      if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => setCopiedTenantKey(""), 1600);
    } catch (copyError) {
      // The tenant ID remains selectable when clipboard permission is unavailable.
      setCopiedTenantKey("");
    }
  };

  const totalTenants = toNumber(summary?.total_tenants);
  const activeToday = toNumber(summary?.active_today);
  const inactiveToday = toNumber(summary?.inactive_today);
  const activeRate = totalTenants > 0 ? Math.min((activeToday / totalTenants) * 100, 100) : 0;

  const cards = [
    {
      label: "Total tenants",
      value: totalTenants,
      detail: "Registered organisations",
      icon: "mdi-domain",
      tone: "primary",
    },
    {
      label: "Active today",
      value: activeToday,
      detail: "At least one tracked activity",
      icon: "mdi-check-circle-outline",
      tone: "success",
    },
    {
      label: "Inactive today",
      value: inactiveToday,
      detail: "No tracked activity today",
      icon: "mdi-alert-circle-outline",
      tone: "warning",
    },
    {
      label: "Student registrations today",
      value: summary?.student_registrations_today,
      detail: "New student records",
      icon: "mdi-account-plus-outline",
      tone: "blue",
    },
    {
      label: "Payments recorded today",
      value: summary?.payments_today,
      detail: "Payment entries created",
      icon: "mdi-cash-check",
      tone: "purple",
    },
    {
      label: "Sessions completed today",
      value: summary?.sessions_today,
      detail: "Training sessions completed",
      icon: "mdi-school-outline",
      tone: "teal",
    },
    {
      label: "WhatsApp messages sent today",
      value: summary?.whatsapp_messages_today,
      detail: "Messages sent through DriveDesk",
      icon: "mdi-whatsapp",
      tone: "whatsapp",
    },
  ];

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light superadmin-page tenant-usage-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <main className="content superadmin-content tenant-usage-content" aria-busy={loading || listLoading}>
              <div className="superadmin-hero tenant-usage-hero">
                <div className="superadmin-hero__text">
                  <h1 className="superadmin-title">Tenant Usage</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0 mb-0 superadmin-breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/superadmin" className="tenant-usage-breadcrumb-home" aria-label="Super Admin home">
                          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                          </svg>
                        </Link>
                      </li>
                      <li className="breadcrumb-item"><Link to="/superadmin">Super Admin</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">Tenant Usage</li>
                    </ol>
                  </nav>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm tenant-usage-refresh"
                  onClick={refreshAll}
                  disabled={loading || listLoading}
                >
                  <i className={`mdi ${loading || listLoading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} aria-hidden="true" />
                  <span>{loading || listLoading ? "Refreshing" : "Refresh"}</span>
                </button>
              </div>

              {showInitialLoading ? (
                <>
                  <section className="superadmin-card tenant-usage-overview tenant-usage-skeleton-overview" aria-label="Loading dashboard summary">
                    <span className="tenant-usage-skeleton tenant-usage-skeleton--title" />
                    <span className="tenant-usage-skeleton tenant-usage-skeleton--summary" />
                  </section>
                  <section className="tenant-usage-grid" aria-label="Loading usage cards">
                    {Array.from({ length: 7 }, (_, index) => (
                      <article className="superadmin-card tenant-usage-card tenant-usage-card--skeleton" key={index}>
                        <span className="tenant-usage-skeleton tenant-usage-skeleton--icon" />
                        <div>
                          <span className="tenant-usage-skeleton tenant-usage-skeleton--label" />
                          <span className="tenant-usage-skeleton tenant-usage-skeleton--value" />
                          <span className="tenant-usage-skeleton tenant-usage-skeleton--detail" />
                        </div>
                      </article>
                    ))}
                  </section>
                </>
              ) : hasBlockingSummaryError ? (
                <section className="superadmin-card tenant-usage-state tenant-usage-error" role="alert">
                  <span className="mdi mdi-shield-alert-outline" aria-hidden="true" />
                  <strong>{isForbidden ? "Super Admin access required." : "Tenant usage could not be loaded"}</strong>
                  {!isForbidden && (
                    <p>{statusCode === 500 ? "Unable to load tenant usage. Please try again." : getErrorMessage(error, result)}</p>
                  )}
                  {!isForbidden && (
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadSummary}>Try again</button>
                  )}
                </section>
              ) : (
                <>
                  {hasError && (
                    <div className="tenant-usage-inline-error" role="alert">
                      <i className="mdi mdi-alert-circle-outline" aria-hidden="true" />
                      <span>
                        {statusCode === 403
                          ? "Super Admin access required."
                          : statusCode === 500
                            ? "Unable to load tenant usage. Please try again."
                            : getErrorMessage(error, result)}
                      </span>
                      {statusCode !== 403 && (
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadSummary}>Retry</button>
                      )}
                    </div>
                  )}
                  <section className="tenant-usage-overview superadmin-card" aria-label="Tenant adoption overview">
                    <div className="tenant-usage-overview__copy">
                      <span>Today’s adoption overview</span>
                      <strong>{formatNumber(activeToday)} of {formatNumber(totalTenants)} tenants active</strong>
                      <small>Activity includes any tracked product action recorded today.</small>
                    </div>
                    <div className="tenant-usage-health">
                      <div>
                        <span>Activity rate</span>
                        <strong>{activeRate.toLocaleString("en-IN", { maximumFractionDigits: 1 })}%</strong>
                      </div>
                      <div className="tenant-usage-progress" role="progressbar" aria-label="Active tenants today" aria-valuemin="0" aria-valuemax="100" aria-valuenow={activeRate}>
                        <span style={{ width: `${activeRate}%` }} />
                      </div>
                      <small className={inactiveToday > 0 ? "needs-attention" : "all-active"}>
                        <i className={`mdi ${inactiveToday > 0 ? "mdi-alert-outline" : "mdi-check-circle-outline"}`} aria-hidden="true" />
                        {inactiveToday > 0
                          ? `${formatNumber(inactiveToday)} inactive tenant${inactiveToday === 1 ? "" : "s"} today`
                          : "All tenants active today"}
                      </small>
                    </div>
                  </section>

                  <section className="tenant-usage-grid" aria-label="Tenant usage statistics">
                    {cards.map((card) => (
                      <article className={`superadmin-card tenant-usage-card is-${card.tone}`} key={card.label}>
                        <span className={`tenant-usage-card__icon mdi ${card.icon}`} aria-hidden="true" />
                        <div>
                          <span>{card.label}</span>
                          <strong>{formatNumber(card.value)}</strong>
                          <small>{card.detail}</small>
                        </div>
                      </article>
                    ))}
                  </section>

                  <section className="superadmin-card tenant-usage-list" aria-label="Tenant usage records">
                    <div className="tenant-usage-list__header">
                      <div>
                        <h2>Tenant activity</h2>
                        <p>Aggregate tracked activity by tenant and date.</p>
                      </div>
                      <span>{formatNumber(listTotal)} record{listTotal === 1 ? "" : "s"}</span>
                    </div>

                    <form className="tenant-usage-filters" onSubmit={applyFilters}>
                      <div className="tenant-usage-filter tenant-usage-filter--tenant">
                        <label htmlFor="usage-tenant-id">Tenant ID</label>
                        <select
                          id="usage-tenant-id"
                          className="form-select"
                          value={draftFilters.tenantId}
                          onChange={(event) => updateDraftFilter("tenantId", event.target.value)}
                          disabled={superAdminListLoading && tenantOptions.length === 0}
                        >
                          <option value="">
                            {superAdminListLoading && tenantOptions.length === 0
                              ? "Loading tenants..."
                              : superAdminListError && tenantOptions.length === 0
                                ? "Unable to load tenants"
                                : "All tenants"}
                          </option>
                          {draftFilters.tenantId && !tenantOptions.some(
                            (tenant) => (tenant?.tenant_id || tenant?.id) === draftFilters.tenantId
                          ) && (
                            <option value={draftFilters.tenantId}>{draftFilters.tenantId}</option>
                          )}
                          {tenantOptions.map((tenant) => {
                            const tenantId = tenant?.tenant_id || tenant?.id;
                            const tenantName = tenant?.org_name
                              || tenant?.organisation_name
                              || tenant?.name;
                            return (
                              <option value={tenantId} key={tenantId}>
                                {tenantName ? `${tenantName} (${tenantId})` : tenantId}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="tenant-usage-filter tenant-usage-filter--mode">
                        <label htmlFor="usage-date-mode">Date filter</label>
                        <select
                          id="usage-date-mode"
                          className="form-select"
                          value={draftFilters.dateMode}
                          onChange={(event) => updateDateMode(event.target.value)}
                        >
                          <option value="period">Monthly / yearly</option>
                          <option value="range">Custom date range</option>
                        </select>
                      </div>

                      {draftFilters.dateMode === "period" ? (
                        <>
                          <div className="tenant-usage-filter tenant-usage-filter--period">
                            <label htmlFor="usage-year">Year</label>
                            <select
                              id="usage-year"
                              className="form-select"
                              value={draftFilters.year}
                              onChange={(event) => updateDraftFilter("year", event.target.value)}
                            >
                              <option value="">All years</option>
                              {usageYears.map((year) => (
                                <option value={year} key={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                          <div className="tenant-usage-filter tenant-usage-filter--period">
                            <label htmlFor="usage-month">Month (optional)</label>
                            <select
                              id="usage-month"
                              className="form-select"
                              value={draftFilters.month}
                              onChange={(event) => updateDraftFilter("month", event.target.value)}
                            >
                              <option value="">All months</option>
                              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                                <option value={month} key={month}>
                                  {new Date(2000, month - 1, 1).toLocaleString("en", { month: "long" })}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="tenant-usage-filter">
                            <label htmlFor="usage-from-date">From date</label>
                            <input
                              id="usage-from-date"
                              type="date"
                              className="form-control"
                              value={draftFilters.fromDate}
                              onChange={(event) => updateDraftFilter("fromDate", event.target.value)}
                            />
                          </div>
                          <div className="tenant-usage-filter">
                            <label htmlFor="usage-to-date">To date</label>
                            <input
                              id="usage-to-date"
                              type="date"
                              className="form-control"
                              min={draftFilters.fromDate || undefined}
                              value={draftFilters.toDate}
                              onChange={(event) => updateDraftFilter("toDate", event.target.value)}
                            />
                          </div>
                        </>
                      )}
                      <div className="tenant-usage-filter-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={listLoading}>
                          <i className="mdi mdi-filter-outline" aria-hidden="true" /> Apply
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={clearFilters}
                          disabled={listLoading || (!activeFilterCount && !hasDraftFilters)}
                        >
                          Clear
                        </button>
                      </div>
                      {(filterError || backendFilterError) && (
                        <p className="tenant-usage-filter-error" role="alert">{filterError || backendFilterError}</p>
                      )}
                    </form>

                    {activeFilterCount > 0 && (
                      <div className="tenant-usage-applied-filters" aria-label="Applied filters">
                        <span>{activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}</span>
                        {appliedFilters.tenantId && <small>Tenant: {appliedFilters.tenantId}</small>}
                        {appliedFilters.fromDate && <small>From: {formatFilterDate(appliedFilters.fromDate)}</small>}
                        {appliedFilters.toDate && <small>To: {formatFilterDate(appliedFilters.toDate)}</small>}
                        {appliedFilters.month && <small>Month: {appliedFilters.month}</small>}
                        {appliedFilters.year && <small>Year: {appliedFilters.year}</small>}
                      </div>
                    )}

                    {listHasError && listResult && listStatusCode !== 422 && (
                      <div className="tenant-usage-inline-error tenant-usage-inline-error--list" role="alert">
                        <i className="mdi mdi-alert-circle-outline" aria-hidden="true" />
                        <span>{listStatusCode === 403 ? "Super Admin access required." : listErrorMessage}</span>
                        {listStatusCode !== 403 && (
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadList}>Retry</button>
                        )}
                      </div>
                    )}

                    {listLoading && !listResult ? (
                      <div className="tenant-usage-list-state">
                        <LoadingState label="Loading tenant activity" description="Retrieving aggregate usage records." />
                      </div>
                    ) : hasBlockingListError ? (
                      <div className="tenant-usage-list-state tenant-usage-list-error" role="alert">
                        <i className="mdi mdi-alert-circle-outline" aria-hidden="true" />
                        <strong>{listStatusCode === 403 ? "Super Admin access required." : "Tenant activity could not be loaded"}</strong>
                        {listStatusCode !== 403 && <p>{listErrorMessage}</p>}
                        {listStatusCode !== 403 && (
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadList}>Try again</button>
                        )}
                      </div>
                    ) : tenantRows.length === 0 ? (
                      <EmptyState
                        icon="mdi mdi-chart-timeline-variant"
                        title="No tenant usage found"
                        description="No tenant usage was found for the selected filters."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                        className="tenant-usage-empty"
                      />
                    ) : (
                      <>
                        <div className={`table-responsive tenant-usage-table-wrap ${listLoading ? "is-refreshing" : ""}`}>
                          <table className="table tenant-usage-table">
                            <thead>
                              <tr>
                                <th>Tenant ID</th>
                                <th>Date</th>
                                <th className="text-end">Login count</th>
                                <th className="text-end">Student registrations</th>
                                <th className="text-end">Payments recorded</th>
                                <th className="text-end">Sessions completed</th>
                                <th className="text-end">WhatsApp messages sent</th>
                                <th className="text-end">Instructors created</th>
                                <th>Last login</th>
                                <th>Last activity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tenantRows.map((tenant, index) => {
                                const rowKey = `${tenant.tenant_id || "tenant"}-${tenant.date || "date"}-${index}`;
                                return (
                                  <tr key={rowKey}>
                                    <td data-label="Tenant ID" className="tenant-usage-tenant-id">
                                      <div className="tenant-usage-tenant-id__content">
                                        <code>{tenant.tenant_id || "—"}</code>
                                        {tenant.tenant_id && (
                                          <button
                                            type="button"
                                            className="tenant-usage-copy"
                                            onClick={() => copyTenantId(tenant.tenant_id, rowKey)}
                                            title={copiedTenantKey === rowKey ? "Copied" : "Copy tenant ID"}
                                            aria-label={copiedTenantKey === rowKey ? "Tenant ID copied" : `Copy tenant ID ${tenant.tenant_id}`}
                                          >
                                            <i className={`mdi ${copiedTenantKey === rowKey ? "mdi-check" : "mdi-content-copy"}`} aria-hidden="true" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td data-label="Date">{tenant.date || "—"}</td>
                                    <td data-label="Login count" className="text-end">{formatNumber(tenant.login_count)}</td>
                                    <td data-label="Student registrations" className="text-end">{formatNumber(tenant.student_registrations)}</td>
                                    <td data-label="Payments recorded" className="text-end">{formatNumber(tenant.payments_recorded)}</td>
                                    <td data-label="Sessions completed" className="text-end">{formatNumber(tenant.sessions_completed)}</td>
                                    <td data-label="WhatsApp messages sent" className="text-end">{formatNumber(tenant.whatsapp_messages_sent)}</td>
                                    <td data-label="Instructors created" className="text-end">{formatNumber(tenant.instructors_created)}</td>
                                    <td data-label="Last login"><LocalTimestamp value={tenant.last_login_at} /></td>
                                    <td data-label="Last activity"><LocalTimestamp value={tenant.last_activity_at} /></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="tenant-usage-pagination">
                          <span className="tenant-usage-page-indicator">Page {listPage} of {listTotalPages}</span>
                          <Pagination
                            currentPage={listPage}
                            totalCount={listTotal}
                            pageSize={listLimit}
                            pageSizeOptions={[10, 25, 50, 100]}
                            disabled={listLoading}
                            onPageChange={setPage}
                            onPageSizeChange={(nextLimit) => {
                              setLimit(nextLimit);
                              setPage(1);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </section>

                  <div className="tenant-usage-privacy-note">
                    <i className="mdi mdi-shield-check-outline" aria-hidden="true" />
                    <span>Aggregate usage statistics only. No customer personal data, payment values, receipts, or WhatsApp content are displayed.</span>
                  </div>
                </>
              )}
            </main>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default TenantUsage;
