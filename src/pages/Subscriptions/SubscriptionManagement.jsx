import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import {
  getSubscriptionSettings,
  initializeSubscription,
  processSubscriptions,
  renewSubscription,
  updateSubscriptionSettings,
} from "../../store/subscription/actions";
import { getSuperAdminList } from "../../store/superAdmin/actions";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import "./SubscriptionManagement.css";

const STATUSES = ["TRIAL", "ACTIVE", "GRACE", "LIMITED", "SUSPENDED"];
const STATUS_LABELS = { TRIAL: "Trial", ACTIVE: "Active", GRACE: "Grace Period", LIMITED: "Limited Mode", SUSPENDED: "Suspended" };
const DEFAULT_SETTINGS = {
  trial_period_days: 60,
  subscription_validity_years: 1,
  subscription_amount: 16000,
  renewal_reminder_start_days: 30,
  renewal_reminder_frequency_days: 10,
  grace_period_days: 30,
  limited_mode_days: 30,
  whatsapp_enabled: true,
  trial_reminder_days: [15, 7],
  grace_reminder_frequency_days: 10,
};

const unwrap = (result) => result?.data?.response ?? result?.response ?? result;
const errorMessage = (error, fallback) =>
  error?.response?.data?.response || error?.data?.response || error?.response || error?.message || fallback;
const dateInput = () => new Date().toISOString().slice(0, 10);
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const logo = (tenant) => tenant?.logo_url || tenant?.logoUrl || tenant?.logo || "";

const isRenewalDue = (tenant) => {
  if (["GRACE", "LIMITED"].includes(tenant.subscription_status)) return true;
  if (!tenant.subscription_end_date || tenant.subscription_status !== "ACTIVE") return false;
  const end = new Date(`${tenant.subscription_end_date.slice(0, 10)}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end.getTime() - Date.now() <= 30 * 86400000;
};

const StatusBadge = ({ status }) => (
  <span className={`subscription-status is-${String(status || "").toLowerCase()}`}>
    {STATUS_LABELS[status] || status || "Not initialized"}
  </span>
);

const PageShell = ({ title, description, children, actions }) => (
  <div className="header-fixed sidebar-fixed sidebar-dark header-light subscription-page" id="body">
    <div className="wrapper"><Sidebar /><div className="page-wrapper"><Header />
      <main className="content-wrapper"><div className="content subscription-content">
        <div className="subscription-heading"><div><p>SUBSCRIPTION MANAGEMENT</p><h1>{title}</h1><span>{description}</span></div>{actions}</div>
        <nav className="subscription-tabs" aria-label="Subscription pages">
          <Link to="/superadmin/subscriptions">Dashboard</Link>
          <Link to="/superadmin/subscriptions/tenants">Tenant Subscriptions</Link>
          <Link to="/superadmin/subscriptions/settings">Settings</Link>
        </nav>
        {children}
      </div></main><Footer /></div></div>
  </div>
);

export default function SubscriptionManagement() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isSettings = location.pathname.endsWith("/settings");
  const isTenants = location.pathname.endsWith("/tenants");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(!isSettings);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ organisation: "", tenantId: "", status: "", renewalDue: "" });
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [actionForm, setActionForm] = useState({ subscription_start_date: dateInput(), payment_date: dateInput(), remarks: "" });
  const [saving, setSaving] = useState(false);
  const processResult = useSelector((state) => state.subscriptionInfo?.processResult);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(isSettings);
  const [settingsMessage, setSettingsMessage] = useState("");

  const dispatchRequest = useCallback((createAction) => new Promise((resolve, reject) => {
    dispatch(createAction((response) => {
      if (response?.status >= 400 || response?.data?.isError || response?.isError) reject(response);
      else resolve(response);
    }));
  }), [dispatch]);

  const fetchTenants = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = unwrap(await dispatchRequest((done) => getSuperAdminList({ page: 1, limit: 1000 }, done)));
      setTenants(Array.isArray(result?.tenants) ? result.tenants : Array.isArray(result) ? result : []);
    } catch (err) { setError(String(errorMessage(err, "Unable to load tenant subscriptions."))); }
    finally { setLoading(false); }
  }, [dispatchRequest]);

  useEffect(() => { if (!isSettings) fetchTenants(); }, [fetchTenants, isSettings]);

  useEffect(() => {
    if (!isTenants) return;
    const query = new URLSearchParams(location.search);
    const requestedStatus = query.get("status");
    setFilters((current) => ({
      ...current,
      status: STATUSES.includes(requestedStatus) ? requestedStatus : "",
      renewalDue: query.get("renewal") === "due" ? "yes" : "",
    }));
  }, [isTenants, location.search]);

  useEffect(() => {
    if (!isSettings) return;
    setSettingsLoading(true);
    dispatchRequest((done) => getSubscriptionSettings(done)).then((response) => setSettings({ ...DEFAULT_SETTINGS, ...(unwrap(response) || {}) }))
      .catch((err) => setSettingsMessage(String(errorMessage(err, "Unable to load subscription settings."))))
      .finally(() => setSettingsLoading(false));
  }, [dispatchRequest, isSettings]);

  const filtered = useMemo(() => tenants.filter((tenant) => {
    const org = String(tenant.org_name || "").toLowerCase();
    const id = String(tenant.tenant_id || "").toLowerCase();
    return (!filters.organisation || org.includes(filters.organisation.toLowerCase())) &&
      (!filters.tenantId || id.includes(filters.tenantId.toLowerCase())) &&
      (!filters.status || tenant.subscription_status === filters.status) &&
      (!filters.renewalDue || (filters.renewalDue === "yes") === isRenewalDue(tenant));
  }), [filters, tenants]);

  const summary = useMemo(() => ({
    TRIAL: tenants.filter((t) => t.subscription_status === "TRIAL").length,
    ACTIVE: tenants.filter((t) => t.subscription_status === "ACTIVE").length,
    GRACE: tenants.filter((t) => t.subscription_status === "GRACE").length,
    LIMITED: tenants.filter((t) => t.subscription_status === "LIMITED").length,
    SUSPENDED: tenants.filter((t) => t.subscription_status === "SUSPENDED").length,
    DUE: tenants.filter(isRenewalDue).length,
  }), [tenants]);

  const openAction = (tenant, type) => {
    setSelected(tenant); setAction(type); setError("");
    setActionForm({ subscription_start_date: dateInput(), payment_date: dateInput(), remarks: "" });
  };

  const submitAction = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (action === "initialize") await dispatchRequest((done) => initializeSubscription({ tenantId: selected.tenant_id, payload: { subscription_start_date: actionForm.subscription_start_date } }, done));
      else await dispatchRequest((done) => renewSubscription({ tenantId: selected.tenant_id, payload: { payment_date: actionForm.payment_date, remarks: actionForm.remarks || null } }, done));
      setAction(""); setSelected(null); await fetchTenants();
    } catch (err) { setError(String(errorMessage(err, "Subscription update failed."))); }
    finally { setSaving(false); }
  };

  const runProcessor = async () => {
    if (!window.confirm("Run the subscription processor now?")) return;
    setSaving(true); setError("");
    try { await dispatchRequest((done) => processSubscriptions(done)); await fetchTenants(); }
    catch (err) { setError(String(errorMessage(err, "Unable to run subscription processor."))); }
    finally { setSaving(false); }
  };

  const saveSettings = async (event) => {
    event.preventDefault(); setSaving(true); setSettingsMessage("");
    const numeric = ["trial_period_days", "subscription_validity_years", "subscription_amount", "renewal_reminder_start_days", "renewal_reminder_frequency_days", "grace_period_days", "limited_mode_days", "grace_reminder_frequency_days"];
    const payload = {
      trial_period_days: settings.trial_period_days,
      subscription_validity_years: settings.subscription_validity_years,
      subscription_amount: settings.subscription_amount,
      renewal_reminder_start_days: settings.renewal_reminder_start_days,
      renewal_reminder_frequency_days: settings.renewal_reminder_frequency_days,
      grace_period_days: settings.grace_period_days,
      limited_mode_days: settings.limited_mode_days,
      whatsapp_enabled: Boolean(settings.whatsapp_enabled),
      trial_reminder_days: settings.trial_reminder_days,
      grace_reminder_frequency_days: settings.grace_reminder_frequency_days,
    };
    numeric.forEach((key) => { payload[key] = Number(payload[key]); });
    payload.trial_reminder_days = Array.isArray(payload.trial_reminder_days) ? payload.trial_reminder_days : String(payload.trial_reminder_days).split(",").map(Number).filter((n) => n > 0);
    if (payload.trial_period_days < 1 || payload.subscription_validity_years < 1 || payload.subscription_validity_years > 10 || payload.subscription_amount <= 0 || payload.renewal_reminder_frequency_days < 1 || payload.renewal_reminder_start_days < 1 || payload.grace_period_days < 0 || payload.limited_mode_days < 1 || payload.grace_reminder_frequency_days < 1 || !payload.trial_reminder_days.length) {
      setSettingsMessage("Please correct the settings values before saving."); setSaving(false); return;
    }
    try { setSettings({ ...settings, ...(unwrap(await dispatchRequest((done) => updateSubscriptionSettings(payload, done))) || payload) }); setSettingsMessage("Subscription settings updated successfully."); }
    catch (err) { setSettingsMessage(String(errorMessage(err, "Unable to update subscription settings."))); }
    finally { setSaving(false); }
  };

  if (isSettings) return <PageShell title="Settings" description="Configure trial, billing, reminders and access-transition periods.">{settingsLoading ? <LoadingState label="Loading subscription settings" /> : <form className="subscription-settings" onSubmit={saveSettings}><div className="subscription-settings-grid">
    {[
      ["trial_period_days", "Trial Period (days)"], ["subscription_validity_years", "Subscription Validity (years)"], ["subscription_amount", "Subscription Amount"], ["renewal_reminder_start_days", "Renewal Reminder Starts (days)"], ["renewal_reminder_frequency_days", "Renewal Reminder Frequency (days)"], ["grace_period_days", "Grace Period (days)"], ["limited_mode_days", "Limited Mode Period (days)"], ["grace_reminder_frequency_days", "Grace Reminder Frequency (days)"],
    ].map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min={key === "grace_period_days" ? 0 : 1} max={key === "subscription_validity_years" ? 10 : undefined} value={settings[key]} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} required /></label>)}
    <label><span>Trial Reminder Days</span><input value={Array.isArray(settings.trial_reminder_days) ? settings.trial_reminder_days.join(", ") : settings.trial_reminder_days} onChange={(e) => setSettings((s) => ({ ...s, trial_reminder_days: e.target.value }))} placeholder="15, 7" required /></label>
    <label className="subscription-checkbox"><input type="checkbox" checked={Boolean(settings.whatsapp_enabled)} onChange={(e) => setSettings((s) => ({ ...s, whatsapp_enabled: e.target.checked }))} /><span>WhatsApp notifications enabled</span></label>
  </div>{settingsMessage && <div className={`subscription-message ${settingsMessage.includes("successfully") ? "success" : "error"}`}>{settingsMessage}</div>}<div className="subscription-form-actions"><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button></div></form>}</PageShell>;

  const cards = [["TRIAL", "Trial Tenants"], ["ACTIVE", "Active Subscriptions"], ["GRACE", "Grace Period"], ["LIMITED", "Limited Mode"], ["SUSPENDED", "Suspended"], ["DUE", "Renewals Due"]];
  return <PageShell title={isTenants ? "Tenant Subscriptions" : "Subscription Dashboard"} description={isTenants ? "Review subscription dates, payments and tenant access states." : "Monitor trials, renewals and access transitions."} actions={<Button onClick={runProcessor} disabled={saving} variant="outline-primary"><i className="mdi mdi-play-circle-outline" /> Run Subscription Processor</Button>}>
    {error && <div className="subscription-message error">{error}</div>}
    {processResult && <div className="processor-summary"><strong>Processor completed</strong><span>Processed: {processResult.processed || 0}</span><span>Transitions: {processResult.transitions || 0}</span><span>Notifications: {processResult.notifications || 0}</span><span>Failures: {processResult.notification_failures || 0}</span></div>}
    {!isTenants && <div className="subscription-summary-grid">{cards.map(([key, label]) => <Link to={`/superadmin/subscriptions/tenants${key !== "DUE" ? `?status=${key}` : "?renewal=due"}`} className={`subscription-summary-card is-${key.toLowerCase()}`} key={key}><span>{label}</span><strong>{summary[key]}</strong><small>View tenants <i className="mdi mdi-arrow-right" /></small></Link>)}</div>}
    {isTenants && <div className="subscription-filters"><label><span>Organisation</span><input value={filters.organisation} onChange={(e) => setFilters((f) => ({ ...f, organisation: e.target.value }))} /></label><label><span>Tenant ID</span><input value={filters.tenantId} onChange={(e) => setFilters((f) => ({ ...f, tenantId: e.target.value }))} /></label><label><span>Subscription Status</span><select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}><option value="">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label><label><span>Renewal Due</span><select value={filters.renewalDue} onChange={(e) => setFilters((f) => ({ ...f, renewalDue: e.target.value }))}><option value="">All tenants</option><option value="yes">Due</option><option value="no">Not due</option></select></label></div>}
    {loading ? <LoadingState label="Loading tenant subscriptions" /> : !filtered.length ? <EmptyState title="No subscriptions found" description="No tenant subscriptions match the current filters." /> : <div className="table-responsive subscription-table-wrap"><table className="table subscription-table"><thead><tr><th>Organisation</th><th>Tenant ID</th><th>Primary Mobile</th><th>Subscription Status</th><th>Trial End Date</th><th>Subscription Start Date</th><th>Subscription End Date</th><th>Grace End Date</th><th>Limited Mode Start Date</th><th>Subscription Amount</th><th>Last Payment Date</th><th>Actions</th></tr></thead><tbody>{filtered.map((tenant) => <tr key={tenant.tenant_id}><td><div className="subscription-org">{logo(tenant) ? <img src={logo(tenant)} alt="" /> : <span>{String(tenant.org_name || "T").charAt(0)}</span>}<strong>{tenant.org_name || "—"}</strong></div></td><td>{tenant.tenant_id}</td><td>{tenant.mobile_number_primary || tenant.mobile_number || "—"}</td><td><StatusBadge status={tenant.subscription_status} /></td><td>{formatDateDDMMYYYY(tenant.trial_end_date)}</td><td>{formatDateDDMMYYYY(tenant.subscription_start_date)}</td><td>{formatDateDDMMYYYY(tenant.subscription_end_date)}</td><td>{formatDateDDMMYYYY(tenant.grace_end_date)}</td><td>{formatDateDDMMYYYY(tenant.limited_mode_start_date)}</td><td>{money(tenant.subscription_amount)}</td><td>{formatDateDDMMYYYY(tenant.last_payment_date)}</td><td><div className="subscription-actions"><button onClick={() => setSelected(tenant)} title="View"><i className="mdi mdi-eye-outline" /></button>{tenant.subscription_start_date == null && <button onClick={() => openAction(tenant, "initialize")} title="Initialize Subscription"><i className="mdi mdi-calendar-plus" /></button>}{tenant.subscription_start_date != null && (isRenewalDue(tenant) || ["SUSPENDED"].includes(tenant.subscription_status)) && <button onClick={() => openAction(tenant, "renew")} title="Renew Subscription"><i className="mdi mdi-autorenew" /></button>}</div></td></tr>)}</tbody></table></div>}
    <Modal show={Boolean(selected) && !action} onHide={() => setSelected(null)} centered size="lg"><Modal.Header closeButton><Modal.Title>Tenant Subscription</Modal.Title></Modal.Header><Modal.Body>{selected && <div className="subscription-detail-grid">{[["Organisation", selected.org_name], ["Tenant ID", selected.tenant_id], ["Current Subscription Status", <StatusBadge status={selected.subscription_status} />], ["Trial Start Date", formatDateDDMMYYYY(selected.trial_start_date)], ["Trial End Date", formatDateDDMMYYYY(selected.trial_end_date)], ["Subscription Start Date", formatDateDDMMYYYY(selected.subscription_start_date)], ["Subscription End Date", formatDateDDMMYYYY(selected.subscription_end_date)], ["Grace End Date", formatDateDDMMYYYY(selected.grace_end_date)], ["Limited Mode Start Date", formatDateDDMMYYYY(selected.limited_mode_start_date)], ["Suspended Date", formatDateDDMMYYYY(selected.suspended_date)], ["Subscription Amount", money(selected.subscription_amount)], ["Last Payment Date", formatDateDDMMYYYY(selected.last_payment_date)], ["Last Payment Remarks", selected.last_payment_remarks || "—"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}</Modal.Body></Modal>
    <Modal show={Boolean(action)} onHide={() => !saving && setAction("")} centered><form onSubmit={submitAction}><Modal.Header closeButton><Modal.Title>{action === "initialize" ? "Initialize Subscription" : "Renew Subscription"}</Modal.Title></Modal.Header><Modal.Body><p className="subscription-action-tenant">{selected?.org_name} <small>{selected?.tenant_id}</small></p>{action === "initialize" ? <label className="subscription-modal-field"><span>Subscription Start Date</span><input type="date" required value={actionForm.subscription_start_date} onChange={(e) => setActionForm((f) => ({ ...f, subscription_start_date: e.target.value }))} /></label> : <><label className="subscription-modal-field"><span>Payment Date</span><input type="date" required value={actionForm.payment_date} onChange={(e) => setActionForm((f) => ({ ...f, payment_date: e.target.value }))} /></label><label className="subscription-modal-field"><span>Remarks <small>(optional)</small></span><textarea value={actionForm.remarks} onChange={(e) => setActionForm((f) => ({ ...f, remarks: e.target.value }))} /></label></>}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setAction("")} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : action === "initialize" ? "Initialize" : "Renew"}</Button></Modal.Footer></form></Modal>
  </PageShell>;
}
