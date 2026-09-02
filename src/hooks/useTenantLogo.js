import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getTenantLogo } from "../store/login/actions";

const tenantLogoCache = new Map();
const tenantLogoRequests = new Map();

const readStoredJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch (error) {
    return {};
  }
};

export const getAuthenticatedTenantId = () => {
  const tenantInfo = readStoredJson("userInfo");
  const roleInfo = readStoredJson("userRoleInfo");

  return (
    tenantInfo?.tenant_id ||
    tenantInfo?.tenantId ||
    roleInfo?.tenant_id ||
    roleInfo?.tenantId ||
    ""
  );
};

export const getCachedTenantLogo = (tenantId = getAuthenticatedTenantId()) =>
  tenantId ? tenantLogoCache.get(tenantId) || "" : "";

const getLogoDataUrl = (logoBlob) => new Promise((resolve) => {
  if (typeof FileReader === "undefined") {
    resolve(URL.createObjectURL(logoBlob));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
  reader.onerror = () => resolve("");
  reader.readAsDataURL(logoBlob);
});

const loadTenantLogo = (tenantId, dispatch) => {
  if (tenantLogoCache.has(tenantId)) return Promise.resolve(tenantLogoCache.get(tenantId));
  if (tenantLogoRequests.has(tenantId)) return tenantLogoRequests.get(tenantId);

  const logoRequest = new Promise((resolve) => {
    dispatch(
      getTenantLogo(tenantId, async (logoBlob, error) => {
        if (error || !(logoBlob instanceof Blob) || logoBlob.size === 0) {
          resolve("");
          return;
        }

        const logoUrl = await getLogoDataUrl(logoBlob);
        if (!logoUrl) {
          resolve("");
          return;
        }
        tenantLogoCache.set(tenantId, logoUrl);
        resolve(logoUrl);
      })
    );
  }).finally(() => tenantLogoRequests.delete(tenantId));

  tenantLogoRequests.set(tenantId, logoRequest);
  return logoRequest;
};

export const ensureTenantLogo = (dispatch, tenantId = getAuthenticatedTenantId()) => {
  if (!tenantId || typeof dispatch !== "function") return Promise.resolve("");
  return loadTenantLogo(tenantId, dispatch);
};

export const useTenantLogo = (fallbackLogo) => {
  const dispatch = useDispatch();
  const tenantId = useMemo(getAuthenticatedTenantId, []);
  const cachedLogo = tenantId ? tenantLogoCache.get(tenantId) : "";
  const [tenantLogo, setTenantLogo] = useState(cachedLogo || "");

  useEffect(() => {
    let isActive = true;

    if (!tenantId) {
      setTenantLogo("");
      return undefined;
    }

    ensureTenantLogo(dispatch, tenantId).then((logoUrl) => {
      if (isActive) setTenantLogo(logoUrl);
    });

    return () => {
      isActive = false;
    };
  }, [dispatch, tenantId]);

  return {
    logoSrc: tenantLogo || fallbackLogo,
    hasTenantLogo: Boolean(tenantLogo),
  };
};
