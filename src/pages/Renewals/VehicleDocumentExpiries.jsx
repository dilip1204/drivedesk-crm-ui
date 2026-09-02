import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../Students/Pagenation";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import { getVehicleDocumentExpiries } from "../../services/functional/renewals/renewalService";
import "./Renewals.css";

const DOCUMENT_TYPES = ["FC", "INSURANCE", "TAX", "PERMIT", "POLLUTION", "OTHER"];
const STATUS_LABELS = {
  EXPIRED: "Expired",
  EXPIRING_7_DAYS: "Expiring in 7 days",
  EXPIRING_30_DAYS: "Expiring in 30 days",
  EXPIRING_60_DAYS: "Expiring in 60 days",
  VALID: "Valid",
};
const EMPTY_FILTERS = {
  document_type: "", expiry_from: "", expiry_to: "", expiry_status: "", search: "",
};
const filtersFromSearchParams = (params) => ({
  ...EMPTY_FILTERS,
  document_type: DOCUMENT_TYPES.includes(params.get("document_type")) ? params.get("document_type") : "",
  expiry_status: Object.prototype.hasOwnProperty.call(STATUS_LABELS, params.get("expiry_status")) ? params.get("expiry_status") : "",
});

const getErrorMessage = (error) => {
  const data = error?.response?.data || error || {};
  const message = data?.response ?? data?.detail ?? data?.message;
  return typeof message === "string" ? message : "Unable to load vehicle document expiries.";
};

export default function VehicleDocumentExpiries() {
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
    setLoading(true);
    setError("");
    try {
      const result = await getVehicleDocumentExpiries({ page, limit, ...filters });
      const wrapper = result?.data || {};
      if (wrapper.isError || Number(wrapper.statusCode) >= 400) {
        throw new Error(typeof wrapper.response === "string"
          ? wrapper.response
          : "Unable to load vehicle document expiries.");
      }
      const payload = wrapper.response || {};
      setItems(Array.isArray(payload.items) ? payload.items : []);
      setTotal(Number(payload.total) || 0);
    } catch (requestError) {
      setItems([]);
      setTotal(0);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page]);

  useEffect(() => { loadExpiries(); }, [loadExpiries]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    if (draftFilters.expiry_from && draftFilters.expiry_to && draftFilters.expiry_from > draftFilters.expiry_to) {
      setFilterError("Expiry from date cannot be later than expiry to date.");
      return;
    }
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setFilterError("");
    setPage(1);
  };

  const activeFilters = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light renewals-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <main className="content renewals-content">
              <header className="renewals-hero">
                <div>
                  <span className="renewals-eyebrow">Renewals</span>
                  <h1>Vehicle Document Expiries</h1>
                  <p>One expiry row for every document registered against a vehicle.</p>
                </div>
              </header>

              <section className="renewals-card renewals-filter-card">
                <form onSubmit={applyFilters}>
                  <div className="renewals-filter-grid">
                    <div className="renewals-field renewals-search">
                      <label htmlFor="vehicle-expiry-search">Search</label>
                      <input id="vehicle-expiry-search" name="search" value={draftFilters.search} onChange={updateFilter} placeholder="Vehicle number, owner or mobile" />
                    </div>
                    <div className="renewals-field">
                      <label htmlFor="vehicle-document-type">Document type</label>
                      <select id="vehicle-document-type" name="document_type" value={draftFilters.document_type} onChange={updateFilter}>
                        <option value="">All types</option>
                        {DOCUMENT_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="renewals-field">
                      <label htmlFor="vehicle-expiry-status">Expiry status</label>
                      <select id="vehicle-expiry-status" name="expiry_status" value={draftFilters.expiry_status} onChange={updateFilter}>
                        <option value="">All statuses</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                      </select>
                    </div>
                    <div className="renewals-field">
                      <label htmlFor="vehicle-expiry-from">Expiry from</label>
                      <input id="vehicle-expiry-from" type="date" name="expiry_from" value={draftFilters.expiry_from} onChange={updateFilter} />
                    </div>
                    <div className="renewals-field">
                      <label htmlFor="vehicle-expiry-to">Expiry to</label>
                      <input id="vehicle-expiry-to" type="date" name="expiry_to" value={draftFilters.expiry_to} onChange={updateFilter} />
                    </div>
                  </div>
                  {filterError && <p className="renewals-error" role="alert">{filterError}</p>}
                  <div className="renewals-filter-actions">
                    <Button type="submit" size="sm" disabled={loading}>Apply Filters</Button>
                    <Button type="button" size="sm" variant="light" onClick={clearFilters} disabled={loading || (!activeFilters && !Object.values(draftFilters).some(Boolean))}>Clear</Button>
                  </div>
                </form>
              </section>

              <section className="renewals-card renewals-list-card" aria-busy={loading}>
                <div className="renewals-list-heading">
                  <div><h2>Document expiry report</h2><span>{total} document{total === 1 ? "" : "s"}</span></div>
                  <Button size="sm" variant="outline-secondary" onClick={loadExpiries} disabled={loading}>
                    <i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} /> Refresh
                  </Button>
                </div>
                {loading && !items.length ? (
                  <LoadingState label="Loading vehicle document expiries" />
                ) : error ? (
                  <div className="renewals-load-error" role="alert">
                    <strong>Unable to load vehicle document expiries</strong><p>{error}</p>
                    <Button size="sm" variant="outline-primary" onClick={loadExpiries}>Try again</Button>
                  </div>
                ) : !items.length ? (
                  <EmptyState icon="mdi mdi-file-clock-outline" title="No document expiries found" description="No vehicle documents match the selected filters." actionLabel={activeFilters ? "Clear Filters" : undefined} onAction={activeFilters ? clearFilters : undefined} />
                ) : (
                  <>
                    <div className={`table-responsive renewals-table-wrap ${loading ? "is-loading" : ""}`}>
                      <table className="table renewals-table vehicle-expiry-table">
                        <thead><tr><th>Vehicle number</th><th>Vehicle type</th><th>Owner</th><th>Mobile</th><th>Document type</th><th>Document number</th><th>Issue date</th><th>Expiry date</th><th>Expiry status</th></tr></thead>
                        <tbody>{items.map((item, index) => (
                          <tr key={`${item.source_id}-${item.document_type}-${item.document_number || index}`}>
                            <td data-label="Vehicle number"><strong>{item.vehicle_number || "—"}</strong></td>
                            <td data-label="Vehicle type">{item.vehicle_type || "—"}</td>
                            <td data-label="Owner">{item.owner_name || "—"}</td>
                            <td data-label="Mobile">{item.mobile_number || "—"}</td>
                            <td data-label="Document type"><span className="renewals-type vehicle-document-type">{item.document_type || "—"}</span></td>
                            <td data-label="Document number">{item.document_number || "—"}</td>
                            <td data-label="Issue date">{formatDateDDMMYYYY(item.issue_date)}</td>
                            <td data-label="Expiry date">{formatDateDDMMYYYY(item.expiry_date)}</td>
                            <td data-label="Expiry status"><span className={`renewals-status is-${String(item.expiry_status || "valid").toLowerCase().replace(/_/g, "-")}`}>{STATUS_LABELS[item.expiry_status] || item.expiry_status || "Valid"}</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <Pagination currentPage={page} totalCount={total} pageSize={limit} pageSizeOptions={[10,25,50,100]} disabled={loading} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
                  </>
                )}
              </section>
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
