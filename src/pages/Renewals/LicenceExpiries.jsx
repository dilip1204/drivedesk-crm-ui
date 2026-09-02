import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../Students/Pagenation";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import { getLicenceExpiries } from "../../services/functional/renewals/renewalService";
import { useAuth } from "../../hooks/useAuth";
import "./Renewals.css";

const EMPTY_FILTERS = { document_type: "", expiry_from: "", expiry_to: "", expiry_status: "", search: "" };
const filtersFromSearchParams = (params) => ({
  ...EMPTY_FILTERS,
  document_type: ["DL", "CL"].includes(params.get("document_type")) ? params.get("document_type") : "",
  expiry_status: Object.prototype.hasOwnProperty.call(STATUS_LABELS, params.get("expiry_status")) ? params.get("expiry_status") : "",
});
const STATUS_LABELS = {
  EXPIRED: "Expired", EXPIRING_7_DAYS: "Expiring in 7 days",
  EXPIRING_30_DAYS: "Expiring in 30 days", EXPIRING_60_DAYS: "Expiring in 60 days", VALID: "Valid",
};

const getErrorMessage = (error) => {
  const data = error?.response?.data || error || {};
  const message = data?.response ?? data?.detail ?? data?.message;
  return typeof message === "string" ? message : "Unable to load licence expiries.";
};

export default function LicenceExpiries() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);

  const loadExpiries = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await getLicenceExpiries({ page, limit, ...filters });
      const wrapper = result?.data || {};
      if (wrapper.isError || Number(wrapper.statusCode) >= 400) {
        throw new Error(typeof wrapper.response === "string" ? wrapper.response : "Unable to load licence expiries.");
      }
      const payload = wrapper.response || {};
      setItems(Array.isArray(payload.items) ? payload.items : []);
      setTotal(Number(payload.total) || 0);
    } catch (requestError) {
      setItems([]); setTotal(0); setError(getErrorMessage(requestError));
    } finally { setLoading(false); }
  }, [filters, limit, page]);

  useEffect(() => { loadExpiries(); }, [loadExpiries]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value })); setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    if (draftFilters.expiry_from && draftFilters.expiry_to && draftFilters.expiry_from > draftFilters.expiry_to) {
      setFilterError("Expiry from date cannot be later than expiry to date."); return;
    }
    setFilters({ ...draftFilters, search: draftFilters.search.trim() }); setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setFilterError(""); setPage(1);
  };

  const openRecord = (item, mode) => {
    const allowedMode = mode === "edit" && !isAdmin ? "view" : mode;
    if (item.source === "STUDENT") {
      const query = new URLSearchParams({ mobile_number: item.mobile_number || "", mode: allowedMode });
      navigate(`/students?${query.toString()}`);
      return;
    }
    const query = new URLSearchParams({ edit: item.source_id, mode: allowedMode });
    navigate(`/renewals/external-customers?${query.toString()}`);
  };

  const activeFilters = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light renewals-page" id="body">
      <div className="wrapper"><Sidebar /><div className="page-wrapper"><Header />
        <div className="content-wrapper"><main className="content renewals-content">
          <header className="renewals-hero"><div><span className="renewals-eyebrow">Renewals</span><h1>Licence Expiries</h1><p>Passed students and external DL/CL customers in one report.</p></div></header>
          <section className="renewals-card renewals-filter-card"><form onSubmit={applyFilters}>
            <div className="renewals-filter-grid">
              <div className="renewals-field renewals-search"><label htmlFor="licence-search">Search</label><input id="licence-search" name="search" value={draftFilters.search} onChange={updateFilter} placeholder="Name, mobile or document number" /></div>
              <div className="renewals-field"><label htmlFor="document-type">Document type</label><select id="document-type" name="document_type" value={draftFilters.document_type} onChange={updateFilter}><option value="">All types</option><option value="DL">Driving Licence</option><option value="CL">Conductor Licence</option></select></div>
              <div className="renewals-field"><label htmlFor="licence-expiry-status">Expiry status</label><select id="licence-expiry-status" name="expiry_status" value={draftFilters.expiry_status} onChange={updateFilter}><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className="renewals-field"><label htmlFor="licence-expiry-from">Expiry from</label><input id="licence-expiry-from" type="date" name="expiry_from" value={draftFilters.expiry_from} onChange={updateFilter} /></div>
              <div className="renewals-field"><label htmlFor="licence-expiry-to">Expiry to</label><input id="licence-expiry-to" type="date" name="expiry_to" value={draftFilters.expiry_to} onChange={updateFilter} /></div>
            </div>
            {filterError && <p className="renewals-error" role="alert">{filterError}</p>}
            <div className="renewals-filter-actions"><Button type="submit" size="sm" disabled={loading}>Apply Filters</Button><Button type="button" size="sm" variant="light" onClick={clearFilters} disabled={loading || (!activeFilters && !Object.values(draftFilters).some(Boolean))}>Clear</Button></div>
          </form></section>
          <section className="renewals-card renewals-list-card" aria-busy={loading}>
            <div className="renewals-list-heading"><div><h2>Unified licence report</h2><span>{total} record{total === 1 ? "" : "s"}</span></div><Button size="sm" variant="outline-secondary" onClick={loadExpiries} disabled={loading}><i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} /> Refresh</Button></div>
            {loading && !items.length ? <LoadingState label="Loading licence expiries" /> : error ? <div className="renewals-load-error" role="alert"><strong>Unable to load licence expiries</strong><p>{error}</p><Button size="sm" variant="outline-primary" onClick={loadExpiries}>Try again</Button></div> : !items.length ? <EmptyState icon="mdi mdi-calendar-check-outline" title="No licence expiries found" description="No student or external licence records match the selected filters." actionLabel={activeFilters ? "Clear Filters" : undefined} onAction={activeFilters ? clearFilters : undefined} /> : <>
              <div className={`table-responsive renewals-table-wrap ${loading ? "is-loading" : ""}`}><table className="table renewals-table licence-expiry-table"><thead><tr><th>Source</th><th>Name</th><th>Mobile</th><th>Type</th><th>Document</th><th>Licence classes</th><th>Expiry date</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{items.map((item, index) => <tr key={`${item.source}-${item.source_id || index}`}><td data-label="Source"><span className={`renewals-source is-${String(item.source).toLowerCase()}`}>{item.source}</span></td><td data-label="Name"><strong>{item.name || "—"}</strong></td><td data-label="Mobile">{item.mobile_number || "—"}</td><td data-label="Type"><span className="renewals-type">{item.document_type}</span></td><td data-label="Document">{item.document_number || "—"}</td><td data-label="Licence classes">{Array.isArray(item.license_classes) ? item.license_classes.join(", ") || "—" : item.license_classes || "—"}</td><td data-label="Expiry date">{formatDateDDMMYYYY(item.expiry_date)}</td><td data-label="Status"><span className={`renewals-status is-${String(item.expiry_status || "valid").toLowerCase().replace(/_/g, "-")}`}>{STATUS_LABELS[item.expiry_status] || item.expiry_status || "Valid"}</span></td><td data-label="Actions" className="text-end"><div className="renewals-row-actions"><button type="button" title="View" aria-label={`View ${item.name}`} onClick={() => openRecord(item, "view")}><i className="bi bi-eye" /></button>{isAdmin && <button type="button" title="Edit" aria-label={`Edit ${item.name}`} onClick={() => openRecord(item, "edit")}><i className="bi bi-pencil-square" /></button>}</div></td></tr>)}</tbody></table></div>
              <Pagination currentPage={page} totalCount={total} pageSize={limit} pageSizeOptions={[10,25,50,100]} disabled={loading} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
            </>}
          </section>
        </main></div><Footer /></div></div>
    </div>
  );
}
