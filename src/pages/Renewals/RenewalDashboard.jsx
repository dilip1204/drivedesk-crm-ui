import React, { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import { getRenewalDashboard } from "../../services/functional/renewals/renewalService";
import "./Renewals.css";

const STATUS_CARDS = [
  { key: "expired", query: "EXPIRED", label: "Expired", icon: "mdi-alert-circle-outline", tone: "danger" },
  { key: "expiring_7_days", query: "EXPIRING_7_DAYS", label: "Within 7 days", icon: "mdi-clock-alert-outline", tone: "urgent" },
  { key: "expiring_30_days", query: "EXPIRING_30_DAYS", label: "Within 30 days", icon: "mdi-calendar-alert", tone: "warning" },
  { key: "expiring_60_days", query: "EXPIRING_60_DAYS", label: "Within 60 days", icon: "mdi-calendar-clock", tone: "notice" },
];

const SECTIONS = [
  { key: "licence", label: "Driving Licences", description: "Passed students and external DL customers", icon: "mdi-card-account-details-outline", documentType: "DL", report: "/renewals/licence-expiries" },
  { key: "conductor_licence", label: "Conductor Licences", description: "External conductor licence customers", icon: "mdi-badge-account-outline", documentType: "CL", report: "/renewals/licence-expiries" },
  { key: "vehicle_documents", label: "Vehicle Documents", description: "FC, insurance, tax, permits and other records", icon: "mdi-car-info", report: "/renewals/vehicle-document-expiries" },
];

const getErrorMessage = (error) => {
  const data = error?.response?.data || error || {};
  const message = data?.response ?? data?.detail ?? data?.message;
  return typeof message === "string" ? message : "Unable to load the renewal dashboard.";
};

export default function RenewalDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await getRenewalDashboard();
      const wrapper = result?.data || {};
      if (wrapper.isError || Number(wrapper.statusCode) >= 400) {
        throw new Error(typeof wrapper.response === "string" ? wrapper.response : "Unable to load the renewal dashboard.");
      }
      setDashboard(wrapper.response || {});
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const openReport = (section, status) => {
    const query = new URLSearchParams({ expiry_status: status.query });
    if (section.documentType) query.set("document_type", section.documentType);
    navigate(`${section.report}?${query.toString()}`);
  };

  const expiredTotal = SECTIONS.reduce(
    (total, section) => total + (Number(dashboard?.[section.key]?.expired) || 0),
    0
  );

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light renewals-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <main className="content renewals-content">
              <header className="renewals-hero renewal-dashboard-hero">
                <div><span className="renewals-eyebrow">Renewals</span><h1>Renewal Dashboard</h1><p>Licence and vehicle-document expiries requiring attention.</p></div>
                <Button variant="outline-secondary" onClick={loadDashboard} disabled={loading}><i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} /> {loading ? "Refreshing" : "Refresh"}</Button>
              </header>

              {loading && !dashboard ? (
                <section className="renewals-card renewal-dashboard-state"><LoadingState label="Loading renewal dashboard" /></section>
              ) : error && !dashboard ? (
                <section className="renewals-card renewal-dashboard-state renewal-dashboard-error" role="alert"><i className="mdi mdi-alert-circle-outline" /><strong>Unable to load renewal dashboard</strong><p>{error}</p><Button size="sm" variant="outline-primary" onClick={loadDashboard}>Try again</Button></section>
              ) : (
                <>
                  <section className="renewal-dashboard-summary">
                    <div><span>Expired records</span><strong>{expiredTotal.toLocaleString("en-IN")}</strong><small>Across driving licences, conductor licences and vehicle documents</small></div>
                    <i className="mdi mdi-calendar-multiple-check" aria-hidden="true" />
                  </section>
                  {error && <div className="renewal-dashboard-inline-error" role="alert">{error}</div>}
                  <div className="renewal-dashboard-sections">
                    {SECTIONS.map((section) => (
                      <section className="renewals-card renewal-dashboard-section" key={section.key}>
                        <header><span className="renewal-section-icon"><i className={`mdi ${section.icon}`} /></span><div><h2>{section.label}</h2><p>{section.description}</p></div></header>
                        <div className="renewal-count-grid">
                          {STATUS_CARDS.map((status) => {
                            const count = Number(dashboard?.[section.key]?.[status.key]) || 0;
                            return <button type="button" className={`renewal-count-card is-${status.tone}`} onClick={() => openReport(section, status)} key={status.key} aria-label={`View ${section.label} ${status.label}: ${count}`}><span className="renewal-count-icon"><i className={`mdi ${status.icon}`} /></span><span><strong>{count.toLocaleString("en-IN")}</strong><small>{status.label}</small></span><i className="mdi mdi-chevron-right renewal-count-arrow" /></button>;
                          })}
                        </div>
                      </section>
                    ))}
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
}
