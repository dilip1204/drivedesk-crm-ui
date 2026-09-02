import React, { useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import { getFinanceTransaction } from "../../store/financeDashboard/actions";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";

const formatCurrency = (value) =>
  `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const displayValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "" ? value : "-";

const FinanceTransactionDetails = ({ show, transactionId, onClose }) => {
  const dispatch = useDispatch();
  const {
    transactionDetail,
    transactionDetailLoading,
    transactionDetailError,
  } = useSelector((state) => state.financeDashboardInfo);

  const loadDetails = () => {
    if (transactionId) dispatch(getFinanceTransaction(transactionId));
  };

  useEffect(() => {
    if (show && transactionId) loadDetails();
    // loadDetails intentionally runs only when the selected modal record changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, transactionId]);

  const transaction = useMemo(() => {
    const response = transactionDetail?.response ?? transactionDetail ?? {};
    return response?.transaction ?? response;
  }, [transactionDetail]);

  const hasError = Boolean(transactionDetailError || transactionDetail?.isError);
  const type = transaction?.type || transaction?.transaction_type || "-";
  const resolvedId =
    transaction?.transaction_id || transaction?.id || transaction?._id || transactionId;

  const fields = [
    { label: "Transaction ID", value: displayValue(resolvedId), wide: true },
    {
      label: "Transaction Date",
      value: formatDateDDMMYYYY(
        transaction?.transaction_date || transaction?.date || transaction?.created_at
      ),
    },
    { label: "Type", value: displayValue(String(type).replace(/_/g, " ")), typeBadge: true },
    { label: "Tenant", value: displayValue(transaction?.tenant_name || transaction?.org_name || transaction?.tenant_id) },
    { label: "Category", value: displayValue(transaction?.category) },
    { label: "Amount", value: formatCurrency(transaction?.amount), money: true },
    { label: "Paid By", value: displayValue(transaction?.paid_by || transaction?.paidBy) },
    { label: "Payment Mode", value: displayValue(transaction?.payment_mode || transaction?.paymentMode) },
    { label: "Reference", value: displayValue(transaction?.reference) },
    { label: "Description", value: displayValue(transaction?.description || transaction?.remarks || transaction?.notes), wide: true },
  ];

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="finance-transaction-detail-modal"
    >
      <Modal.Header closeButton>
        <div className="finance-modal-title">
          <span aria-hidden="true"><i className="bi bi-receipt" /></span>
          <div>
            <Modal.Title>Transaction Details</Modal.Title>
            <small>Complete information for the selected finance transaction.</small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {transactionDetailLoading ? (
          <LoadingState label="Loading transaction" description="Fetching transaction details." />
        ) : hasError ? (
          <EmptyState
            icon="bi bi-exclamation-circle"
            title="Unable to load transaction"
            description="The transaction details could not be loaded. Please try again."
            variant="error"
            actionLabel="Try again"
            onAction={loadDetails}
          />
        ) : (
          <div className="finance-detail-grid">
            {fields.map((field) => (
              <div className={`finance-detail-item${field.wide ? " is-wide" : ""}`} key={field.label}>
                <span>{field.label}</span>
                {field.typeBadge ? (
                  <strong>
                    <span className={`finance-type-badge type-${String(type).toLowerCase().replace(/_/g, "-")}`}>
                      {field.value}
                    </span>
                  </strong>
                ) : (
                  <strong className={field.money ? "is-money" : ""}>{field.value}</strong>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinanceTransactionDetails;
