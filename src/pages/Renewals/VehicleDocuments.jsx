import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
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
  createVehicle, deleteVehicle, getVehicle, getVehicles, updateVehicle,
} from "../../services/functional/renewals/renewalService";
import "./Renewals.css";

const DOCUMENT_TYPES = ["FC", "INSURANCE", "TAX", "PERMIT", "POLLUTION", "OTHER"];
const EMPTY_DOCUMENT = { type: "FC", document_number: "", issue_date: "", expiry_date: "" };
const EMPTY_FORM = { vehicle_number: "", vehicle_type: "", owner_name: "", mobile_number: "", documents: [{ ...EMPTY_DOCUMENT }] };

const unwrap = (result) => {
  const data = result?.data || result || {};
  if (data?.isError || Number(data?.statusCode) >= 400) {
    throw new Error(typeof data?.response === "string" ? data.response : "The request could not be completed.");
  }
  return data?.response ?? data;
};

const requestError = (error) => {
  const data = error?.response?.data || error || {};
  const message = data?.response ?? data?.detail ?? data?.message;
  if (Number(error?.response?.status || data?.statusCode) === 409) {
    return typeof message === "string" ? message : "A vehicle with this number already exists.";
  }
  return typeof message === "string" ? message : "The request could not be completed.";
};

const normalize = (vehicle = {}) => ({
  ...EMPTY_FORM,
  ...vehicle,
  documents: Array.isArray(vehicle.documents) && vehicle.documents.length
    ? vehicle.documents.map((document) => ({ ...EMPTY_DOCUMENT, ...document }))
    : [{ ...EMPTY_DOCUMENT }],
});

const payloadFrom = (form) => ({
  vehicle_number: form.vehicle_number.trim().toUpperCase(),
  vehicle_type: form.vehicle_type.trim().toUpperCase(),
  owner_name: form.owner_name.trim(),
  mobile_number: form.mobile_number.trim(),
  documents: form.documents.map(({ type, document_number, issue_date, expiry_date }) => ({
    type, document_number: document_number.trim(), issue_date, expiry_date,
  })),
});

const getVehicleId = (vehicle) => vehicle?.id || vehicle?.vehicle_id || vehicle?._id;

export default function VehicleDocuments() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const payload = unwrap(await getVehicles({ page, limit, search }));
      setItems(Array.isArray(payload?.items) ? payload.items : []);
      setTotal(Number(payload?.total) || 0);
    } catch (errorValue) {
      setItems([]); setTotal(0); setError(requestError(errorValue));
    } finally { setLoading(false); }
  }, [limit, page, search]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const applySearch = (event) => { event.preventDefault(); setPage(1); setSearch(draftSearch.trim()); };
  const clearSearch = () => { setDraftSearch(""); setSearch(""); setPage(1); };
  const openCreate = () => { if (isAdmin) { setSelected(null); setForm(normalize()); setFormError(""); setMode("edit"); } };

  const openVehicle = async (item, nextMode) => {
    const allowedMode = nextMode === "edit" && !isAdmin ? "view" : nextMode;
    setSelected(item); setForm(normalize(item)); setFormError(""); setMode(allowedMode); setDetailLoading(true);
    try {
      const detail = unwrap(await getVehicle(getVehicleId(item)));
      setSelected(detail); setForm(normalize(detail));
    } catch (errorValue) { setFormError(requestError(errorValue)); }
    finally { setDetailLoading(false); }
  };

  const closeModal = () => { if (!saving) { setMode(null); setSelected(null); setFormError(""); } };
  const changeField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value })); setFormError("");
  };
  const changeDocument = (index, event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, documents: current.documents.map((document, row) => row === index ? { ...document, [name]: value } : document) }));
    setFormError("");
  };
  const addDocument = () => setForm((current) => ({ ...current, documents: [...current.documents, { ...EMPTY_DOCUMENT }] }));
  const removeDocument = (index) => setForm((current) => ({ ...current, documents: current.documents.filter((_, row) => row !== index) }));

  const validate = () => {
    if (!form.vehicle_number.trim() || !form.vehicle_type.trim() || !form.owner_name.trim() || !form.mobile_number.trim()) return "Vehicle number, vehicle type, owner name and mobile number are required.";
    if (!/^\d{10}$/.test(form.mobile_number.trim())) return "Mobile number must contain exactly 10 digits.";
    if (!form.documents.length) return "Add at least one vehicle document.";
    for (let index = 0; index < form.documents.length; index += 1) {
      const document = form.documents[index];
      if (!document.type || !document.document_number.trim() || !document.issue_date || !document.expiry_date) return `Complete all fields in document ${index + 1}.`;
      if (document.expiry_date < document.issue_date) return `Document ${index + 1} expiry date cannot be before its issue date.`;
    }
    return "";
  };

  const saveVehicle = async (event) => {
    event.preventDefault();
    if (!isAdmin) { setFormError("Admin permission is required to modify vehicle records."); return; }
    const validationError = validate();
    if (validationError) { setFormError(validationError); return; }
    const payload = payloadFrom(form);
    setSaving(true); setFormError("");
    try {
      const selectedId = getVehicleId(selected);
      if (selectedId) {
        const original = payloadFrom(normalize(selected));
        const changed = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (JSON.stringify(value) !== JSON.stringify(original[key])) changed[key] = value;
        });
        if (!Object.keys(changed).length) { setFormError("No changes to save."); return; }
        // A changed documents value is the complete current array, never a partial row patch.
        unwrap(await updateVehicle(selectedId, changed));
        toast.success("Vehicle documents updated.");
      } else {
        unwrap(await createVehicle(payload));
        toast.success("Vehicle and documents created.");
      }
      setMode(null); setSelected(null); await loadVehicles();
    } catch (errorValue) { setFormError(requestError(errorValue)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id) => {
    if (!isAdmin) return;
    try {
      unwrap(await deleteVehicle(id)); toast.success("Vehicle deleted."); setDeleteId(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1); else loadVehicles();
    } catch (errorValue) { toast.error(requestError(errorValue)); setDeleteId(null); }
  };

  return <div className="header-fixed sidebar-fixed sidebar-dark header-light renewals-page" id="body">
    <div className="wrapper"><Sidebar /><div className="page-wrapper"><Header /><div className="content-wrapper"><main className="content renewals-content">
      <header className="renewals-hero"><div><span className="renewals-eyebrow">Renewals</span><h1>Vehicle Documents</h1><p>Track every document attached to a vehicle.</p></div>{isAdmin && <Button onClick={openCreate}><i className="mdi mdi-plus" /> Add Vehicle</Button>}</header>
      <section className="renewals-card renewals-filter-card"><form className="vehicle-search-form" onSubmit={applySearch}><div className="renewals-field"><label htmlFor="vehicle-search">Search vehicles</label><input id="vehicle-search" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Vehicle number, owner or mobile" /></div><Button type="submit" size="sm" disabled={loading}>Search</Button><Button type="button" size="sm" variant="light" onClick={clearSearch} disabled={loading || (!search && !draftSearch)}>Clear</Button></form></section>
      <section className="renewals-card renewals-list-card" aria-busy={loading}><div className="renewals-list-heading"><div><h2>Registered vehicles</h2><span>{total} vehicle{total === 1 ? "" : "s"}</span></div><Button size="sm" variant="outline-secondary" onClick={loadVehicles} disabled={loading}><i className={`mdi ${loading ? "mdi-loading mdi-spin" : "mdi-refresh"}`} /> Refresh</Button></div>
        {loading && !items.length ? <LoadingState label="Loading vehicles" /> : error ? <div className="renewals-load-error" role="alert"><strong>Unable to load vehicles</strong><p>{error}</p><Button size="sm" variant="outline-primary" onClick={loadVehicles}>Try again</Button></div> : !items.length ? <EmptyState icon="mdi mdi-car-info" title="No vehicles found" description={isAdmin ? "Add a vehicle or change your search." : "No vehicles match your search."} actionLabel={search ? "Clear Search" : isAdmin ? "Add Vehicle" : undefined} onAction={search ? clearSearch : isAdmin ? openCreate : undefined} /> : <><div className={`table-responsive renewals-table-wrap ${loading ? "is-loading" : ""}`}><table className="table renewals-table vehicle-table"><thead><tr><th>Vehicle</th><th>Type</th><th>Owner</th><th>Mobile</th><th>Documents</th><th>Next expiry</th><th className="text-end">Actions</th></tr></thead><tbody>{items.map((item) => {
          const documents = Array.isArray(item.documents) ? item.documents : [];
          const expiries = documents.map((document) => document.expiry_date).filter(Boolean).sort();
          return <tr key={getVehicleId(item) || item.vehicle_number}><td data-label="Vehicle"><strong>{item.vehicle_number || "—"}</strong></td><td data-label="Type">{item.vehicle_type || "—"}</td><td data-label="Owner">{item.owner_name || "—"}</td><td data-label="Mobile">{item.mobile_number || "—"}</td><td data-label="Documents"><div className="vehicle-document-tags">{documents.length ? documents.map((document, index) => <span key={`${document.type}-${index}`}>{document.type}</span>) : <span>None</span>}</div></td><td data-label="Next expiry">{formatDateDDMMYYYY(item.next_expiry_date || expiries[0])}</td><td data-label="Actions" className="text-end"><div className="renewals-row-actions"><button type="button" title="View" onClick={() => openVehicle(item, "view")}><i className="bi bi-eye" /></button>{isAdmin && <><button type="button" title="Edit" onClick={() => openVehicle(item, "edit")}><i className="bi bi-pencil-square" /></button><button type="button" className="is-delete" title="Delete" onClick={() => setDeleteId(getVehicleId(item))}><i className="bi bi-trash" /></button></>}</div></td></tr>;
        })}</tbody></table></div><Pagination currentPage={page} totalCount={total} pageSize={limit} pageSizeOptions={[10,25,50,100]} disabled={loading} onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }} /></>}
      </section>
    </main></div><Footer /></div></div>

    <Modal show={Boolean(mode)} onHide={closeModal} size="lg" centered dialogClassName="renewals-modal vehicle-modal"><Modal.Header closeButton><Modal.Title>{mode === "view" ? "Vehicle Details" : selected ? "Edit Vehicle Documents" : "Add Vehicle Documents"}</Modal.Title></Modal.Header>
      {mode === "view" ? <><Modal.Body>{detailLoading ? <LoadingState label="Loading vehicle" variant="compact" /> : <><div className="renewals-detail-grid">{[["Vehicle number", selected?.vehicle_number], ["Vehicle type", selected?.vehicle_type], ["Owner", selected?.owner_name], ["Mobile", selected?.mobile_number]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}</div><div className="vehicle-view-documents"><h6>Documents</h6>{(selected?.documents || []).map((document, index) => <article key={`${document.type}-${index}`}><strong>{document.type}</strong><span>{document.document_number}</span><small>{formatDateDDMMYYYY(document.issue_date)} – {formatDateDDMMYYYY(document.expiry_date)}</small></article>)}</div></>}{formError && <p className="renewals-error">{formError}</p>}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={closeModal}>Close</Button></Modal.Footer></> : <form onSubmit={saveVehicle}><Modal.Body>{detailLoading ? <LoadingState label="Loading vehicle" variant="compact" /> : <><div className="renewals-form-grid">{[["vehicle_number", "Vehicle number *", "text"], ["vehicle_type", "Vehicle type *", "text"], ["owner_name", "Owner name *", "text"], ["mobile_number", "Mobile number *", "tel"]].map(([name, label, type]) => <div className="renewals-field" key={name}><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={form[name]} onChange={changeField} maxLength={name === "mobile_number" ? 10 : undefined} /></div>)}</div><div className="vehicle-document-editor"><div className="vehicle-document-editor-heading"><div><h6>Documents</h6><small>Add all documents belonging to this vehicle.</small></div><Button type="button" size="sm" variant="outline-primary" onClick={addDocument}><i className="mdi mdi-plus" /> Add Document</Button></div>{form.documents.map((document, index) => <fieldset className="vehicle-document-row" key={index}><legend>Document {index + 1}</legend><div className="renewals-field"><label>Type *</label><select name="type" value={document.type} onChange={(event) => changeDocument(index, event)}>{DOCUMENT_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}</select></div><div className="renewals-field"><label>Document number *</label><input name="document_number" value={document.document_number} onChange={(event) => changeDocument(index, event)} /></div><div className="renewals-field"><label>Issue date *</label><input type="date" name="issue_date" value={document.issue_date} onChange={(event) => changeDocument(index, event)} /></div><div className="renewals-field"><label>Expiry date *</label><input type="date" name="expiry_date" value={document.expiry_date} onChange={(event) => changeDocument(index, event)} /></div><button type="button" className="vehicle-remove-document" onClick={() => removeDocument(index)} disabled={form.documents.length === 1} aria-label={`Remove document ${index + 1}`}><i className="bi bi-trash" /></button></fieldset>)}</div></>}{formError && <p className="renewals-error" role="alert">{formError}</p>}</Modal.Body><Modal.Footer><Button type="button" variant="light" onClick={closeModal} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving || detailLoading}>{saving ? "Saving..." : selected ? "Save Changes" : "Create Vehicle"}</Button></Modal.Footer></form>}
    </Modal>
    <DeleteConfirmation showDeleteModal={Boolean(deleteId)} hideDeleteModal={() => setDeleteId(null)} confirmModal={confirmDelete} id={deleteId} message="Are you sure you want to delete this vehicle and all its document records?" />
    <ToastContainer position="top-right" autoClose={4000} closeButton={false} />
  </div>;
}
