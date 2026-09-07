import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMySubscription } from "../store/subscription/actions";

export const SUBSCRIPTION_STATUSES = Object.freeze({
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  GRACE: "GRACE",
  LIMITED: "LIMITED",
  SUSPENDED: "SUSPENDED",
});

const STORAGE_KEY = "tenantSubscription";

const readStoredSubscription = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored) return stored;
    const tenant = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return tenant?.subscription_status ? tenant : null;
  } catch (error) {
    return null;
  }
};

export const useSubscription = () => {
  const dispatch = useDispatch();
  const reduxSubscription = useSelector((state) => state.subscriptionInfo?.mySubscription);
  const loading = useSelector((state) => Boolean(state.subscriptionInfo?.mySubscriptionLoading));
  const loadError = useSelector((state) => state.subscriptionInfo?.mySubscriptionError);
  const subscription = useMemo(
    () => reduxSubscription || readStoredSubscription(),
    [reduxSubscription]
  );

  useEffect(() => {
    let role = "";
    try {
      role = String(JSON.parse(localStorage.getItem("userRoleInfo") || "{}").role || "").toLowerCase();
    } catch (error) {
      role = "";
    }
    if (role === "super_admin" || reduxSubscription || loading || loadError) return;
    dispatch(getMySubscription());
  }, [dispatch, loadError, loading, reduxSubscription]);

  useEffect(() => {
    if (reduxSubscription) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reduxSubscription));
    }
  }, [reduxSubscription]);

  const refresh = useCallback(() => new Promise((resolve, reject) => {
    dispatch(getMySubscription((response) => {
      if (response?.status >= 400 || response?.data?.isError) reject(response);
      else resolve(response?.response ?? response);
    }));
  }), [dispatch]);

  const status = subscription?.subscription_status || "";
  return {
    subscription,
    status,
    isLimited: status === SUBSCRIPTION_STATUSES.LIMITED,
    loading,
    refresh,
  };
};
