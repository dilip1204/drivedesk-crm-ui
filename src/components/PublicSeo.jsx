import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://drivedesk.in";

const pageSeo = {
  "/": {
    title: "Driving School Management Software | DriveDesk",
    description: "Driving school management software for schools worldwide. Manage enquiries, students, instructors, sessions, fees, WhatsApp follow-ups, and reports in one workspace.",
  },
  "/about": {
    title: "About DriveDesk | Software Built for Driving Schools",
    description: "Learn how DriveDesk helps driving schools replace scattered registers and spreadsheets with a practical, connected management system.",
  },
  "/demo": {
    title: "DriveDesk Product Demo | Driving School CRM",
    description: "See DriveDesk in action: manage enquiries, coordinate training sessions, track outstanding fees, and understand driving school performance.",
  },
  "/contact": {
    title: "Book a Free DriveDesk Demo | Contact Us",
    description: "Book a free DriveDesk product demo for your driving school. Share your requirements and continue directly with our team on WhatsApp.",
  },
  "/privacy-policy": { title: "Privacy Policy | DriveDesk", description: "Read how DriveDesk collects, uses, stores, and protects information when providing its website and driving school management service." },
  "/terms": { title: "Terms & Conditions | DriveDesk", description: "Read the terms governing DriveDesk website access, free trials, subscriptions, accounts, and driving school management services." },
  "/cancellation-refund-policy": { title: "Cancellation & Refund Policy | DriveDesk", description: "Read the DriveDesk policy for free-trial cancellation, subscription cancellation, and refund requests." },
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export default function PublicSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = pageSeo[pathname] || pageSeo["/"];
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
    document.title = seo.title;

    setMeta('meta[name="description"]', { name: "description", content: seo.description });
    setMeta('meta[name="robots"]', { name: "robots", content: "index, follow, max-image-preview:large" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "DriveDesk" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let schema = document.head.querySelector('#drivedesk-structured-data');
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "drivedesk-structured-data";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "DriveDesk",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: pageSeo["/"].description,
      offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
      creator: { "@type": "Organization", name: "Asteriq Systech", url: "https://asteriqsystech.com/" },
    });
  }, [pathname]);

  return null;
}
