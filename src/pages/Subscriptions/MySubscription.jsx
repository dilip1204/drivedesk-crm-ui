import React from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { useSubscription } from "../../hooks/useSubscription";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import "./SubscriptionManagement.css";

const LABELS = { TRIAL: "Trial", ACTIVE: "Active", GRACE: "Grace Period", LIMITED: "Limited Mode", SUSPENDED: "Suspended" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function MySubscription() {
  const { subscription, status, loading, refresh } = useSubscription();
  const rows = subscription ? [
    ["Organisation", subscription.org_name], ["Tenant ID", subscription.tenant_id],
    ["Current Subscription Status", <span className={`subscription-status is-${status.toLowerCase()}`}>{LABELS[status] || status}</span>],
    ["Trial Start Date", formatDateDDMMYYYY(subscription.trial_start_date)], ["Trial End Date", formatDateDDMMYYYY(subscription.trial_end_date)],
    ["Subscription Start Date", formatDateDDMMYYYY(subscription.subscription_start_date)], ["Subscription End Date", formatDateDDMMYYYY(subscription.subscription_end_date)],
    ["Grace End Date", formatDateDDMMYYYY(subscription.grace_end_date)], ["Limited Mode Start Date", formatDateDDMMYYYY(subscription.limited_mode_start_date)],
    ["Suspended Date", formatDateDDMMYYYY(subscription.suspended_date)], ["Subscription Amount", money(subscription.subscription_amount)],
    ["Last Payment Date", formatDateDDMMYYYY(subscription.last_payment_date)], ["Last Payment Remarks", subscription.last_payment_remarks || "—"],
  ] : [];

  return <div className="header-fixed sidebar-fixed sidebar-dark header-light subscription-page" id="body"><div className="wrapper"><Sidebar /><div className="page-wrapper"><Header /><main className="content-wrapper"><div className="content subscription-content"><div className="subscription-heading"><div><p>ACCOUNT</p><h1>My Subscription</h1><span>View your DriveDesk subscription status and important dates.</span></div><button className="btn btn-outline-primary" onClick={refresh}>Refresh</button></div>{loading ? <LoadingState label="Loading subscription" /> : !subscription ? <EmptyState title="Subscription information unavailable" description="Please try again or contact DriveDesk." /> : <div className="subscription-settings"><div className="subscription-detail-grid">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}</div></div>}</div></main><Footer /></div></div></div>;
}
