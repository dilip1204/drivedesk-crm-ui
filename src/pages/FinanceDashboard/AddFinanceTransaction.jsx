import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { Field, Form, Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";

import {
  createFinanceTransaction,
  updateFinanceTransaction,
} from "../../store/financeDashboard/actions";
import {
  FINANCE_EXPENSE_CATEGORIES,
  isFinanceExpenseCategory,
} from "./financeCategories";
import {
  FINANCE_TRANSACTION_TYPES,
  isFinanceTransactionType,
} from "./financeTransactionTypes";
import { getSuperAdminList } from "../../store/superAdmin/actions";

const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "Upi", label: "UPI" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
  { value: "Other", label: "Other" },
];

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getApiErrorMessage = (source, action = "save") => {
  const responseData = source?.response?.data || source?.data || source || {};
  const detail = responseData?.response ?? responseData?.detail ?? responseData?.message;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") return detail.message || `Unable to ${action} transaction.`;
  return `Unable to ${action} transaction. Please check the details and try again.`;
};

const validationSchema = Yup.object({
  transaction_date: Yup.string().required("Transaction date is required."),
  type: Yup.string()
    .oneOf(FINANCE_TRANSACTION_TYPES.map((type) => type.value), "Select a valid transaction type.")
    .required("Transaction type is required."),
  category: Yup.string()
    .oneOf(FINANCE_EXPENSE_CATEGORIES.map((category) => category.value), "Select a valid category.")
    .required("Category is required."),
  amount: Yup.number()
    .typeError("Enter a valid amount.")
    .moreThan(0, "Amount must be greater than zero.")
    .required("Amount is required."),
  paid_by: Yup.string().trim().required("Paid by is required."),
  tenant_id: Yup.string().trim().required("Tenant ID is required."),
});

const initialValues = {
  transaction_date: toDateInputValue(new Date()),
  type: "INCOME",
  category: "",
  amount: "",
  paid_by: "",
  tenant_id: "",
  description: "",
  payment_mode: "",
  reference: "",
};

const getTransactionValues = (transaction) => ({
  transaction_date:
    transaction?.transaction_date || transaction?.date || toDateInputValue(new Date()),
  type: isFinanceTransactionType(transaction?.type || transaction?.transaction_type)
    ? transaction?.type || transaction?.transaction_type
    : "INCOME",
  category: isFinanceExpenseCategory(transaction?.category) ? transaction.category : "",
  amount: transaction?.amount ?? "",
  paid_by: transaction?.paid_by || transaction?.paidBy || "",
  tenant_id: transaction?.tenant_id || "",
  description: transaction?.description || transaction?.remarks || transaction?.notes || "",
  payment_mode: transaction?.payment_mode || transaction?.paymentMode || "",
  reference: transaction?.reference || "",
});

const AddFinanceTransaction = ({
  show,
  onClose,
  onCreated,
  saving,
  isEdit = false,
  transaction = null,
}) => {
  const dispatch = useDispatch();
  const {
    superAdminList,
    superAdminListLoading,
    superAdminListError,
  } = useSelector((state) => state.superAdminInfo);
  const [submitError, setSubmitError] = useState("");
  const formInitialValues = useMemo(
    () => (isEdit ? getTransactionValues(transaction) : initialValues),
    [isEdit, transaction]
  );
  const tenants = useMemo(() => {
    const response = superAdminList?.response ?? superAdminList ?? {};
    const list = Array.isArray(response) ? response : response?.tenants || response?.items || [];
    const uniqueTenants = new Map();

    list.forEach((tenant) => {
      const tenantId = tenant?.tenant_id || tenant?.id;
      if (tenantId && !uniqueTenants.has(tenantId)) uniqueTenants.set(tenantId, tenant);
    });

    return Array.from(uniqueTenants.values());
  }, [superAdminList]);

  useEffect(() => {
    if (!show) return;
    dispatch(getSuperAdminList({ page: 1, limit: 100 }));
  }, [dispatch, show]);

  const submitTransaction = (values, { resetForm, setSubmitting }) => {
    setSubmitError("");
    const payload = {
      transaction_date: values.transaction_date,
      type: values.type,
      category: values.category.trim(),
      amount: Number(values.amount),
      paid_by: values.paid_by.trim(),
      tenant_id: values.tenant_id.trim(),
      description: values.description.trim(),
      payment_mode: values.payment_mode.trim(),
      reference: values.reference.trim(),
    };

    const transactionId =
      transaction?.transaction_id || transaction?.id || transaction?._id;
    const action = isEdit
      ? updateFinanceTransaction(transactionId, payload, handleResponse)
      : createFinanceTransaction(payload, handleResponse);

    function handleResponse(responseData, error) {
        setSubmitting(false);
        if (error || responseData?.isError) {
          setSubmitError(getApiErrorMessage(error || responseData, isEdit ? "update" : "create"));
          return;
        }

        if (!isEdit) {
          resetForm({ values: { ...initialValues, transaction_date: toDateInputValue(new Date()) } });
        }
        onCreated(responseData);
    }

    dispatch(action);
  };

  return (
    <Modal
      show={show}
      onHide={saving ? undefined : onClose}
      centered
      size="lg"
      className="finance-transaction-modal"
      backdrop={saving ? "static" : true}
      keyboard={!saving}
    >
      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={submitTransaction}
      >
        {({ isSubmitting, values }) => (
          <Form noValidate>
            <Modal.Header closeButton={!saving}>
              <div className="finance-modal-title">
                <span aria-hidden="true"><i className="bi bi-receipt-cutoff" /></span>
                <div>
                  <Modal.Title>{isEdit ? "Edit Finance Transaction" : "Add Finance Transaction"}</Modal.Title>
                  <small>{isEdit ? "Update the selected transaction details." : "Record tenant income, expense or partner activity."}</small>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body>
              {submitError && (
                <div className="finance-modal-alert" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="finance-modal-form-grid">
                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-date">Transaction Date <span>*</span></label>
                  <Field id="finance-transaction-date" name="transaction_date" type="date" className="form-control" />
                  <ErrorMessage name="transaction_date" component="small" className="finance-modal-error" />
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-type">Type <span>*</span></label>
                  <Field id="finance-transaction-type" name="type" as="select" className="form-select">
                    {FINANCE_TRANSACTION_TYPES.map((type) => (
                      <option value={type.value} key={type.value}>{type.label}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="type" component="small" className="finance-modal-error" />
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-category">Category <span>*</span></label>
                  <Field id="finance-transaction-category" name="category" as="select" className="form-select">
                    <option value="">Select category</option>
                    {FINANCE_EXPENSE_CATEGORIES.map((category) => (
                      <option value={category.value} key={category.value}>{category.label}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="small" className="finance-modal-error" />
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-amount">Amount <span>*</span></label>
                  <div className="finance-amount-input">
                    <span aria-hidden="true">{"\u20B9"}</span>
                    <Field id="finance-transaction-amount" name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" className="form-control" placeholder="0.00" />
                  </div>
                  <ErrorMessage name="amount" component="small" className="finance-modal-error" />
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-paid-by">Paid By <span>*</span></label>
                  <Field id="finance-transaction-paid-by" name="paid_by" className="form-control" placeholder="Person or account name" />
                  <ErrorMessage name="paid_by" component="small" className="finance-modal-error" />
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-tenant">Organisation / Tenant <span>*</span></label>
                  <Field
                    id="finance-transaction-tenant"
                    name="tenant_id"
                    as="select"
                    className="form-select"
                    disabled={superAdminListLoading && tenants.length === 0}
                  >
                    <option value="">
                      {superAdminListLoading ? "Loading organisations..." : "Select organisation"}
                    </option>
                    {values.tenant_id && !tenants.some((tenant) => (tenant?.tenant_id || tenant?.id) === values.tenant_id) && (
                      <option value={values.tenant_id}>{values.tenant_id} (Current)</option>
                    )}
                    {tenants.map((tenant) => {
                      const tenantId = tenant?.tenant_id || tenant?.id;
                      const tenantName = tenant?.org_name || tenant?.organisation_name || tenant?.name || tenantId;
                      return <option value={tenantId} key={tenantId}>{tenantName} ({tenantId})</option>;
                    })}
                  </Field>
                  <ErrorMessage name="tenant_id" component="small" className="finance-modal-error" />
                  {superAdminListError && (
                    <small className="finance-modal-error">Unable to load organisations. Close and reopen the form to retry.</small>
                  )}
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-payment-mode">Payment Mode</label>
                  <Field
                    id="finance-transaction-payment-mode"
                    name="payment_mode"
                    as="select"
                    className="form-select"
                  >
                    <option value="">Select payment mode</option>
                    {values.payment_mode && !PAYMENT_MODES.some((mode) => mode.value === values.payment_mode) && (
                      <option value={values.payment_mode}>{values.payment_mode} (Current)</option>
                    )}
                    {PAYMENT_MODES.map((mode) => (
                      <option value={mode.value} key={mode.value}>{mode.label}</option>
                    ))}
                  </Field>
                </div>

                <div className="finance-modal-field">
                  <label htmlFor="finance-transaction-reference">Reference</label>
                  <Field id="finance-transaction-reference" name="reference" className="form-control" placeholder="Receipt or transaction reference" />
                </div>

                <div className="finance-modal-field finance-modal-field--wide">
                  <label htmlFor="finance-transaction-description">Description</label>
                  <Field id="finance-transaction-description" name="description" as="textarea" className="form-control" rows="3" placeholder="Add transaction details" />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving || isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || isSubmitting}>
                {saving || isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Saving</>
                ) : (
                  <><i className="bi bi-check-lg" aria-hidden="true" /> {isEdit ? "Update Transaction" : "Save Transaction"}</>
                )}
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddFinanceTransaction;
