const readStoredJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch (error) {
    return {};
  }
};

const getStoredTenantLogo = () => {
  const tenant = readStoredJson("userInfo");
  return tenant?.logo_url || tenant?.logoUrl || tenant?.org_logo || tenant?.logo || "";
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

export const getCachedTenantLogo = () => getStoredTenantLogo();

// Preserve the existing asynchronous print interface without a network request.
export const ensureTenantLogo = () => Promise.resolve(getStoredTenantLogo());

export const useTenantLogo = (fallbackLogo) => {
  const tenantLogo = getStoredTenantLogo();
  return {
    logoSrc: tenantLogo || fallbackLogo,
    hasTenantLogo: Boolean(tenantLogo),
  };
};
