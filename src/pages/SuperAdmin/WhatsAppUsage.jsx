import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../Students/Students.css";
import "./SuperAdmin.css";
import "./WhatsAppUsage.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { getWhatsAppUsage } from "../../services/functional/superAdmin/superAdminService";

const numberFormatter = new Intl.NumberFormat("en-IN");

const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const toNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const formatNumber = (value) => numberFormatter.format(toNumber(value));

const formatPercent = (value) => {
  const percentage = toNumber(value);
  return `${percentage.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
};

const formatPeriod = (period) => {
  const [year, month] = String(period || "").split("-").map(Number);
  if (!year || !month) return period || "Selected month";
  return new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const getTemplateEntries = (templates) =>
  Object.entries(templates || {}).sort(([, firstCount], [, secondCount]) =>
    toNumber(secondCount) - toNumber(firstCount)
  );

const WhatsAppUsage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const apiResponse = await getWhatsAppUsage(selectedPeriod);
      const payload = apiResponse?.data || {};

      if (payload?.isError) {
        throw new Error(payload?.message || payload?.detail || "Unable to load WhatsApp usage.");
      }

      setUsage(payload?.response || payload || null);
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      const message =
        responseData?.message ||
        responseData?.detail ||
        requestError?.message ||
        "Unable to load WhatsApp usage. Please try again.";

      setUsage(null);
      setError(typeof message === "string" ? message : "Unable to load WhatsApp usage.");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const total = usage?.total || {};
  const tenants = Array.isArray(usage?.tenants) ? usage.tenants : [];
  const totalCalls = toNumber(total.total_calls);
  const successfulCalls = toNumber(total.successful_calls);
  const failedCalls = toNumber(total.failed_calls);
  const planLimit = toNumber(usage?.plan_limit);
  const remainingCalls = toNumber(usage?.remaining_calls);
  const usagePercent = toNumber(usage?.usage_percent);
  const progressPercent = Math.min(Math.max(usagePercent, 0), 100);
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
  const templateEntries = useMemo(() => getTemplateEntries(total.by_template), [total.by_template]);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light superadmin-page wati-usage-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <div className="content superadmin-content wati-usage-content">
              <div className="superadmin-hero wati-usage-hero">
                <div className="superadmin-hero__text">
                  <h1 className="superadmin-title">WhatsApp API Usage</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0 mb-0 superadmin-breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/superadmin" className="wati-usage-breadcrumb-home" aria-label="Super Admin home">
                          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                          </svg>
                        </Link>
                      </li>
                      <li className="breadcrumb-item">
                        <Link to="/superadmin">Super Admin</Link>
                      </li>
                      <li className="breadcrumb-item active" aria-current="page">WhatsApp Usage</li>
                    </ol>
                  </nav>
                </div>

                <div className="wati-usage-period-controls">
                  <label htmlFor="whatsapp-usage-period">Usage month</label>
                  <input
                    id="whatsapp-usage-period"
                    className="form-control"
                    type="month"
                    value={selectedPeriod}
                    onChange={(event) => setSelectedPeriod(event.target.value)}
                    max="9999-12"
                  />
                  <button
                    type="button"
                    className="btn btn-primary wati-usage-refresh-btn"
                    onClick={fetchUsage}
                    disabled={loading || !selectedPeriod}
                  >
                    <i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} aria-hidden="true" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="superadmin-card">
                  <LoadingState
                    label="Loading WhatsApp usage"
                    description={`Retrieving tenant activity for ${formatPeriod(selectedPeriod)}.`}
                  />
                </div>
              ) : error ? (
                <div className="superadmin-card wati-usage-state wati-usage-error" role="alert">
                  <span className="mdi mdi-alert-circle-outline" aria-hidden="true" />
                  <strong>Usage data could not be loaded</strong>
                  <span>{error}</span>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={fetchUsage}>Try again</button>
                </div>
              ) : (
                <>
                  <section className="wati-usage-summary" aria-label="WhatsApp usage summary">
                    <article className="superadmin-card wati-usage-kpi is-primary">
                      <span className="wati-usage-kpi__icon mdi mdi-message-text-outline" aria-hidden="true" />
                      <div>
                        <span>Total API calls</span>
                        <strong>{formatNumber(totalCalls)}</strong>
                        <small>{formatPeriod(usage?.period || selectedPeriod)}</small>
                      </div>
                    </article>
                    <article className="superadmin-card wati-usage-kpi is-success">
                      <span className="wati-usage-kpi__icon mdi mdi-check-circle-outline" aria-hidden="true" />
                      <div>
                        <span>Successful calls</span>
                        <strong>{formatNumber(successfulCalls)}</strong>
                        <small>{formatPercent(successRate)} success rate</small>
                      </div>
                    </article>
                    <article className="superadmin-card wati-usage-kpi is-danger">
                      <span className="wati-usage-kpi__icon mdi mdi-alert-circle-outline" aria-hidden="true" />
                      <div>
                        <span>Failed calls</span>
                        <strong>{formatNumber(failedCalls)}</strong>
                        <small>{totalCalls > 0 ? formatPercent((failedCalls / totalCalls) * 100) : "0%"} failure rate</small>
                      </div>
                    </article>
                    <article className="superadmin-card wati-usage-kpi is-muted">
                      <span className="wati-usage-kpi__icon mdi mdi-message-processing-outline" aria-hidden="true" />
                      <div>
                        <span>Remaining calls</span>
                        <strong>{formatNumber(remainingCalls)}</strong>
                        <small>of {formatNumber(planLimit)} plan limit</small>
                      </div>
                    </article>
                  </section>

                  <section className="wati-usage-overview">
                    <article className="superadmin-card wati-usage-plan-card">
                      <div className="wati-usage-section-heading">
                        <div>
                          <h2>Monthly plan usage</h2>
                          <p>{formatNumber(totalCalls)} of {formatNumber(planLimit)} calls used</p>
                        </div>
                        <strong>{formatPercent(usagePercent)}</strong>
                      </div>
                      <div
                        className="wati-usage-progress"
                        role="progressbar"
                        aria-label="Monthly WhatsApp plan usage"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={progressPercent}
                      >
                        <span style={{ width: `${progressPercent}%` }} />
                      </div>
                      <div className="wati-usage-plan-meta">
                        <span><i className="mdi mdi-calendar-month-outline" aria-hidden="true" /> {formatPeriod(usage?.period)}</span>
                        <span><i className="mdi mdi-message-reply-text-outline" aria-hidden="true" /> {formatNumber(remainingCalls)} available</span>
                      </div>
                    </article>

                    <article className="superadmin-card wati-usage-template-card">
                      <div className="wati-usage-section-heading">
                        <div>
                          <h2>Template activity</h2>
                          <p>Calls grouped by WATI template</p>
                        </div>
                        <span className="wati-usage-count-badge">{templateEntries.length} templates</span>
                      </div>
                      {templateEntries.length > 0 ? (
                        <div className="wati-usage-template-list">
                          {templateEntries.map(([template, count]) => (
                            <div className="wati-usage-template-row" key={template}>
                              <span title={template}>{template.replace(/_/g, " ")}</span>
                              <strong>{formatNumber(count)}</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="wati-usage-template-empty">No template calls in this period.</div>
                      )}
                    </article>
                  </section>

                  <section className="superadmin-card wati-usage-tenant-card">
                    <div className="wati-usage-table-heading">
                      <div>
                        <h2>Tenant usage</h2>
                        <p>WATI API calls grouped by tenant for {formatPeriod(usage?.period || selectedPeriod)}.</p>
                      </div>
                      <span className="wati-usage-count-badge">{tenants.length} tenants</span>
                    </div>

                    {tenants.length > 0 ? (
                      <div className="table-responsive wati-usage-table-wrap">
                        <table className="table custom-table align-middle wati-usage-table">
                          <thead>
                            <tr>
                              <th>Tenant</th>
                              <th>Period</th>
                              <th className="text-right">Total Calls</th>
                              <th className="text-right">Successful</th>
                              <th className="text-right">Failed</th>
                              <th>Success Rate</th>
                              <th>Templates</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenants.map((tenant, index) => {
                              const tenantTotal = toNumber(tenant?.total_calls);
                              const tenantSuccessful = toNumber(tenant?.successful_calls);
                              const tenantFailed = tenant?.failed_calls == null
                                ? Math.max(tenantTotal - tenantSuccessful, 0)
                                : toNumber(tenant.failed_calls);
                              const tenantSuccessRate = tenantTotal > 0
                                ? (tenantSuccessful / tenantTotal) * 100
                                : 0;
                              const tenantTemplates = getTemplateEntries(tenant?.by_template);

                              return (
                                <tr key={`${tenant?.tenant_id || "tenant"}-${tenant?.period || index}`}>
                                  <td data-label="Tenant">
                                    <div className="wati-usage-tenant-name">
                                      <span>{String(tenant?.tenant_id || "T").charAt(0).toUpperCase()}</span>
                                      <strong>{tenant?.tenant_id || "Unknown tenant"}</strong>
                                    </div>
                                  </td>
                                  <td data-label="Period">{formatPeriod(tenant?.period)}</td>
                                  <td data-label="Total Calls" className="text-right">{formatNumber(tenantTotal)}</td>
                                  <td data-label="Successful" className="text-right wati-usage-success-value">{formatNumber(tenantSuccessful)}</td>
                                  <td data-label="Failed" className="text-right wati-usage-failed-value">{formatNumber(tenantFailed)}</td>
                                  <td data-label="Success Rate">
                                    <span className="wati-usage-rate-badge">{formatPercent(tenantSuccessRate)}</span>
                                  </td>
                                  <td data-label="Templates">
                                    {tenantTemplates.length > 0 ? (
                                      <div className="wati-usage-template-tags">
                                        {tenantTemplates.map(([template, count]) => (
                                          <span key={template} title={`${template}: ${formatNumber(count)} calls`}>
                                            {template.replace(/_/g, " ")} <strong>{formatNumber(count)}</strong>
                                          </span>
                                        ))}
                                      </div>
                                    ) : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon="bi bi-chat-square-dots"
                        title="No tenant usage found"
                        description={`No WhatsApp API calls were recorded for ${formatPeriod(selectedPeriod)}.`}
                        variant="compact"
                      />
                    )}
                  </section>
                </>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppUsage;
