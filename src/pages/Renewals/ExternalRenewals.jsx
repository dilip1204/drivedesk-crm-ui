import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import Pagination from "../Students/Pagenation";
import { useAuth } from "../../hooks/useAuth";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import {
  createRenewal,
  deleteRenewal,
  getRenewal,
  getRenewals,
  updateRenewal,
} from "../../services/functional/renewals/renewalService";
import "./Renewals.css";

const EMPTY_FILTERS = { renewal_type: "", expiry_from: "", expiry_to: "", expiry_status: "", search: "" };
const EMPTY_FORM = {
  renewal_type: "DL", name: "", mobile_number: "", document_number: "",
  license_classes: "", badge_number: "", issue_date: "", expiry_date: "",
  rto: "", enrollment_number: "", remarks: "",
};

const STATUS_LABELS = {
  EXPIRED: "Expired", EXPIRING_7_DAYS: "Expiring in 7 days",
  EXPIRING_30_DAYS: "Expiring in 30 days", EXPIRING_60_DAYS: "Expiring in 60 days", VALID: "Valid",
};

const unwrap = (result) => {
  const data = result?.data || result || {};
  if (data?.isError || Number(data?.statusCode) >= 400) {
    throw new Error(typeof data?.response === "string" ? data.response : "The request could not be completed.");
  }
  return data?.response ?? data;
};

const getRequestError = (error) => {
  const data = error?.response?.data;
  const message = data?.response ?? data?.detail ?? error?.message;
  return typeof message === "string" ? message : "The request could not be completed.";
};

const normalizeForm = (item = {}) => ({
  ...EMPTY_FORM,
  ...item,
  license_classes: Array.isArray(item.license_classes) ? item.license_classes.join(", ") : item.license_classes || "",
  badge_number: item.badge_number || "",
  remarks: item.remarks || "",
});

const toPayload = (form) => ({
  renewal_type: form.renewal_type,
  name: form.name.trim(),
  mobile_number: form.mobile_number.trim(),
  document_number: form.document_number.trim(),
  license_classes: form.renewal_type === "DL"
    ? form.license_classes.split(",").map((value) => value.trim().toUpperCase()).filter((value, index, values) => value && values.indexOf(value) === index)
    : [],
  badge_number: form.renewal_type === "CL" ? form.badge_number.trim() || null : null,
  issue_date: form.issue_date,
  expiry_date: form.expiry_date,
  rto: form.rto.trim(),
  enrollment_number: form.enrollment_number.trim(),
  remarks: form.remarks.trim() || null,
});

export default function ExternalRenewals() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedRecordOpened = useRef(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterError, setFilterError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadRenewals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = unwrap(await getRenewals({ page, limit, ...filters }));
      setItems(Array.isArray(payload?.items) ? payload.items : []);
      setTotal(Number(payload?.total) || 0);
    } catch (requestError) {
      setItems([]);
      setTotal(0);
      setError(getRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page]);

  useEffect(() => { loadRenewals(); }, [loadRenewals]);

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
    setPage(1);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setFilterError("");
    setPage(1);
  };

  const openCreate = () => {
    if (!isAdmin) return;
    setSelected(null); setForm(EMPTY_FORM); setFormError(""); setModalMode("edit");
  };

  const openRecord = async (item, mode) => {
    const allowedMode = mode === "edit" && !isAdmin ? "view" : mode;
    setSelected(item); setForm(normalizeForm(item)); setFormError(""); setModalMode(allowedMode); setDetailLoading(true);
    try {
      const detail = unwrap(await getRenewal(item.id));
      setSelected(detail); setForm(normalizeForm(detail));
    } catch (requestError) {
      setFormError(getRequestError(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const linkedId = searchParams.get("edit");
    if (!linkedId || linkedRecordOpened.current) return;
    linkedRecordOpened.current = true;
    openRecord({ id: linkedId }, searchParams.get("mode") === "view" ? "view" : "edit");
    setSearchParams({}, { replace: true });
  // openRecord intentionally runs once for the route-provided record ID.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  const closeModal = () => {
    if (saving) return;
    setModalMode(null); setSelected(null); setFormError("");
  };

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value })); setFormError("");
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.mobile_number.trim() || !form.document_number.trim() || !form.issue_date || !form.expiry_date) {
      return "Name, mobile number, document number, issue date and expiry date are required.";
    }
    if (!/^\d{10}$/.test(form.mobile_number.trim())) return "Mobile number must contain exactly 10 digits.";
    if (form.expiry_date < form.issue_date) return "Expiry date cannot be before issue date.";
    return "";
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!isAdmin) { setFormError("Admin permission is required to modify renewal records."); return; }
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    const payload = toPayload(form);
    setSaving(true); setFormError("");
    try {
      if (selected?.id) {
        const changed = {};
        const original = toPayload(normalizeForm(selected));
        Object.entries(payload).forEach(([key, value]) => {
          if (JSON.stringify(value) !== JSON.stringify(original[key])) changed[key] = value;
        });
        if (!Object.keys(changed).length) { setFormError("No changes to save."); return; }
        unwrap(await updateRenewal(selected.id, changed));
        toast.success("External renewal customer updated.");
      } else {
        unwrap(await createRenewal(payload));
        toast.success("External renewal customer created.");
      }
      setModalMode(null);
      setSelected(null);
      await loadRenewals();
    } catch (requestError) {
      setFormError(getRequestError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id) => {
    if (!isAdmin) return;
    try {
      unwrap(await deleteRenewal(id));
      toast.success("External renewal customer deleted.");
      setDeleteId(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else loadRenewals();
    } catch (requestError) {
      toast.error(getRequestError(requestError));
      setDeleteId(null);
    }
  };

  const activeFilters = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light renewals-page" id="body">
      <div className="wrapper"><Sidebar /><div className="page-wrapper"><Header />
        <div className="content-wrapper"><main className="content renewals-content">
          <header className="renewals-hero">
            <div><span className="renewals-eyebrow">Renewals</span><h1>External Customers</h1><p>Manage walk-in driving and conductor licence renewals.</p></div>
            {isAdmin && <Button variant="primary" onClick={openCreate}><i className="mdi mdi-plus" /> Add External Customer</Button>}
          </header>

          <section className="renewals-card renewals-filter-card">
            <form onSubmit={applyFilters}>
              <div className="renewals-filter-grid">
                <div className="renewals-field renewals-search"><label htmlFor="renewal-search">Search</label><input id="renewal-search" name="search" value={draftFilters.search} onChange={updateFilter} placeholder="Name, mobile or document number" /></div>
                <div className="renewals-field"><label htmlFor="renewal-type-filter">Type</label><select id="renewal-type-filter" name="renewal_type" value={draftFilters.renewal_type} onChange={updateFilter}><option value="">All types</option><option value="DL">Driving Licence</option><option value="CL">Conductor Licence</option></select></div>
                <div className="renewals-field"><label htmlFor="renewal-status-filter">Expiry status</label><select id="renewal-status-filter" name="expiry_status" value={draftFilters.expiry_status} onChange={updateFilter}><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
                <div className="renewals-field"><label htmlFor="expiry-from">Expiry from</label><input id="expiry-from" type="date" name="expiry_from" value={draftFilters.expiry_from} onChange={updateFilter} /></div>
                <div className="renewals-field"><label htmlFor="expiry-to">Expiry to</label><input id="expiry-to" type="date" name="expiry_to" value={draftFilters.expiry_to} onChange={updateFilter} /></div>
              </div>
              {filterError && <p className="renewals-error" role="alert">{filterError}</p>}
              <div className="renewals-filter-actions"><Button type="submit" size="sm" disabled={loading}>Apply Filters</Button><Button type="button" variant="light" size="sm" onClick={clearFilters} disabled={loading || (!activeFilters && !Object.values(draftFilters).some(Boolean))}>Clear</Button></div>
            </form>
          </section>

          <section className="renewals-card renewals-list-card" aria-busy={loading}>
            <div className="renewals-list-heading"><div><h2>Renewal records</h2><span>{total} external customer{total === 1 ? "" : "s"}</span></div><Button variant="outline-secondary" size="sm" onClick={loadRenewals} disabled={loading}><i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} /> Refresh</Button></div>
            {loading && !items.length ? <LoadingState label="Loading external renewals" /> : error ? <div className="renewals-load-error" role="alert"><strong>Unable to load renewals</strong><p>{error}</p><Button size="sm" variant="outline-primary" onClick={loadRenewals}>Try again</Button></div> : !items.length ? <EmptyState icon="mdi mdi-card-account-details-outline" title="No external renewal customers" description={isAdmin ? "Add a walk-in customer or adjust the selected filters." : "No external renewal customers match the selected filters."} actionLabel={activeFilters ? "Clear Filters" : isAdmin ? "Add External Customer" : undefined} onAction={activeFilters ? clearFilters : isAdmin ? openCreate : undefined} /> : <>
              <div className={`table-responsive renewals-table-wrap ${loading ? "is-loading" : ""}`}><table className="table renewals-table"><thead><tr><th>Customer</th><th>Type</th><th>Document</th><th>Classes / Badge</th><th>Expiry</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td data-label="Customer"><strong>{item.name}</strong><small>{item.mobile_number || "—"}</small></td><td data-label="Type"><span className="renewals-type">{item.renewal_type}</span></td><td data-label="Document">{item.document_number || "—"}</td><td data-label="Classes / Badge">{item.renewal_type === "CL" ? item.badge_number || "—" : Array.isArray(item.license_classes) ? item.license_classes.join(", ") : item.license_classes || "—"}</td><td data-label="Expiry">{formatDateDDMMYYYY(item.expiry_date)}</td><td data-label="Status"><span className={`renewals-status is-${String(item.expiry_status || "valid").toLowerCase().replace(/_/g, "-")}`}>{STATUS_LABELS[item.expiry_status] || item.expiry_status || "Valid"}</span></td><td data-label="Actions" className="text-end"><div className="renewals-row-actions"><button type="button" onClick={() => openRecord(item, "view")} aria-label={`View ${item.name}`} title="View"><i className="bi bi-eye" /></button>{isAdmin && <><button type="button" onClick={() => openRecord(item, "edit")} aria-label={`Edit ${item.name}`} title="Edit"><i className="bi bi-pencil-square" /></button><button type="button" className="is-delete" onClick={() => setDeleteId(item.id)} aria-label={`Delete ${item.name}`} title="Delete"><i className="bi bi-trash" /></button></>}</div></td></tr>)}</tbody></table></div>
              <Pagination currentPage={page} totalCount={total} pageSize={limit} pageSizeOptions={[10, 25, 50, 100]} disabled={loading} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
            </>}
          </section>
        </main></div><Footer /></div></div>

      <Modal show={Boolean(modalMode)} onHide={closeModal} centered size="lg" dialogClassName="renewals-modal">
        <Modal.Header closeButton><Modal.Title>{modalMode === "view" ? "Renewal Details" : selected ? "Edit External Customer" : "Add External Customer"}</Modal.Title></Modal.Header>
        {modalMode === "view" ? <Modal.Body>{detailLoading ? <LoadingState label="Loading renewal details" variant="compact" /> : <div className="renewals-detail-grid">{[["Customer", selected?.name], ["Mobile", selected?.mobile_number], ["Renewal type", selected?.renewal_type], ["Document number", selected?.document_number], ["Licence classes", Array.isArray(selected?.license_classes) ? selected.license_classes.join(", ") : selected?.license_classes], ["Badge number", selected?.badge_number], ["Issue date", formatDateDDMMYYYY(selected?.issue_date)], ["Expiry date", formatDateDDMMYYYY(selected?.expiry_date)], ["Expiry status", STATUS_LABELS[selected?.expiry_status] || selected?.expiry_status], ["RTO", selected?.rto], ["Enrollment number", selected?.enrollment_number], ["Remarks", selected?.remarks]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}</div>}{formError && <p className="renewals-error">{formError}</p>}</Modal.Body> : <form onSubmit={saveRecord}><Modal.Body>{detailLoading ? <LoadingState label="Loading renewal details" variant="compact" /> : <div className="renewals-form-grid">
          <div className="renewals-field"><label htmlFor="renewal_type">Renewal type *</label><select id="renewal_type" name="renewal_type" value={form.renewal_type} onChange={changeForm}><option value="DL">Driving Licence (DL)</option><option value="CL">Conductor Licence (CL)</option></select></div>
          {[["name", "Customer name *", "text"], ["mobile_number", "Mobile number *", "tel"], ["document_number", "Document / licence number *", "text"], ["issue_date", "Issue date *", "date"], ["expiry_date", "Expiry date *", "date"], ["rto", "RTO", "text"], ["enrollment_number", "Enrollment number", "text"]].map(([name, label, type]) => <div className="renewals-field" key={name}><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={form[name]} onChange={changeForm} maxLength={name === "mobile_number" ? 10 : undefined} /></div>)}
          {form.renewal_type === "DL" ? <div className="renewals-field renewals-field-wide"><label htmlFor="license_classes">Licence classes</label><input id="license_classes" name="license_classes" value={form.license_classes} onChange={changeForm} placeholder="MCWG, LMV" /><small>Separate multiple classes with commas.</small></div> : <div className="renewals-field renewals-field-wide"><label htmlFor="badge_number">Badge number</label><input id="badge_number" name="badge_number" value={form.badge_number} onChange={changeForm} /></div>}
          <div className="renewals-field renewals-field-wide"><label htmlFor="remarks">Remarks</label><textarea id="remarks" name="remarks" rows="3" value={form.remarks} onChange={changeForm} /></div>
        </div>}{formError && <p className="renewals-error" role="alert">{formError}</p>}</Modal.Body><Modal.Footer><Button type="button" variant="light" onClick={closeModal} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving || detailLoading}>{saving ? "Saving..." : selected ? "Save Changes" : "Create Customer"}</Button></Modal.Footer></form>}
        {modalMode === "view" && <Modal.Footer><Button variant="secondary" onClick={closeModal}>Close</Button></Modal.Footer>}
      </Modal>
      <DeleteConfirmation showDeleteModal={Boolean(deleteId)} hideDeleteModal={() => setDeleteId(null)} confirmModal={confirmDelete} id={deleteId} message="Are you sure you want to delete this external renewal customer?" />
      <ToastContainer position="top-right" autoClose={4000} closeButton={false} />
    </div>
  );
}
