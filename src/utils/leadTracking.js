const ATTRIBUTION_KEY = "drivedesk_lead_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export const captureLeadAttribution = () => {
  if (typeof window === "undefined") return {};

  try {
    const existing = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "{}");
    const query = new URLSearchParams(window.location.search);
    const campaign = Object.fromEntries(
      UTM_KEYS.map((key) => [key, query.get(key)]).filter(([, value]) => value)
    );
    const attribution = {
      landing_page: existing.landing_page || `${window.location.pathname}${window.location.search}`,
      referrer: existing.referrer || document.referrer || "direct",
      ...existing,
      ...campaign,
    };
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    return attribution;
  } catch (error) {
    return {};
  }
};

export const getLeadAttribution = () => captureLeadAttribution();

export const formatLeadAttribution = () => {
  const attribution = getLeadAttribution();
  const source = attribution.utm_source || (attribution.referrer === "direct" ? "Direct website visit" : attribution.referrer);
  const details = [
    `Lead source: ${source}`,
    attribution.utm_campaign ? `Campaign: ${attribution.utm_campaign}` : "",
    attribution.utm_medium ? `Medium: ${attribution.utm_medium}` : "",
    attribution.landing_page ? `Landing page: ${attribution.landing_page}` : "",
  ];
  return details.filter(Boolean);
};

export const trackLeadEvent = (eventName, details = {}) => {
  if (typeof window === "undefined") return;

  const payload = { event: eventName, ...details, ...getLeadAttribution() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("drivedesk:lead-event", { detail: payload }));
};
