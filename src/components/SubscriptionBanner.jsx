import React from "react";
import { formatDateDDMMYYYY } from "../utils/dateFormat";
import { SUBSCRIPTION_STATUSES, useSubscription } from "../hooks/useSubscription";
import "./SubscriptionBanner.css";

const daysRemaining = (dateValue) => {
  if (!dateValue) return null;
  const end = new Date(`${String(dateValue).slice(0, 10)}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
};

export default function SubscriptionBanner() {
  const { subscription, status } = useSubscription();
  if (!subscription || !["TRIAL", "GRACE", "LIMITED"].includes(status)) return null;

  const remaining = daysRemaining(subscription.trial_end_date);
  const content = status === SUBSCRIPTION_STATUSES.TRIAL
    ? <>Your free DriveDesk trial is active until <strong>{formatDateDDMMYYYY(subscription.trial_end_date)}</strong>{remaining !== null ? ` (${remaining} days remaining)` : ""}.</>
    : status === SUBSCRIPTION_STATUSES.GRACE
      ? <>Your subscription has expired. Please renew before <strong>{formatDateDDMMYYYY(subscription.grace_end_date)}</strong> to avoid Limited Mode.</>
      : <>Your subscription has expired. Please renew to continue using DriveDesk. The account is currently read-only.</>;

  return <div className={`subscription-banner is-${status.toLowerCase()}`} role={status === "TRIAL" ? "status" : "alert"}><i className="mdi mdi-alert-circle-outline" aria-hidden="true" /><span>{content}</span></div>;
}
