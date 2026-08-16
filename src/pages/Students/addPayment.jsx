import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { getStudentReceiptInfo } from "../../store/students/actions";
import { ToastContainer, toast } from "react-toastify";
import { addAdminPrintLogo } from "../../utils/printBranding";
import "./studentPayments.css";

const getLocalDateTimeInputValue = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AddPayment({
  show,
  onClose,
  onSubmit,
  payReceiptData,
  student,
}) {
  const dispatch = useDispatch();
  // const studentList = useSelector((state) => state.studentsListInfo.studentsList);

  //const [receiptData, setReceiptData] = useState(payReceiptData);
  //const [htmlContent, setHtmlContent] = useState("");
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const initialValues = {
    amount: "",
    date: getLocalDateTimeInputValue(),
    payment_method: "",
    payment_status: "",
    remarks: "",
  };

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required("Amount is required")
      .typeError("Must be a number"),
    date: Yup.date().required("Date is required"),
    payment_method: Yup.string().required("Payment method is required"),
    payment_status: Yup.string().required("Payment status is required"),
    remarks: Yup.string(),
  });

  const onCloseFun = () => {
    setIsPrintEnabled(false);
    onClose();
  } 

  const handleFormSubmit = (values, { resetForm }) => {
    const enteredAmount = Number(values.amount);
    const balance = Number(student?.balance || 0);

    if (balance <= 0) {
      toast.error("❌ Student has no pending balance. Payment not required.");
      return;
    }

    if (enteredAmount > balance) {
      toast.error(
        `❌ Entered amount exceeds balance. Maximum allowed: ₹${balance}`
      );
      return;
    }

    const payload = {
      amount: enteredAmount,
      date: new Date(values.date).toISOString(),
      payment_method: values.payment_method,
      payment_status: values.payment_status,
      remarks: values.remarks,
    };

    if (typeof onSubmit === "function") {
      onSubmit(payload);
    }

    resetForm();
    setIsPrintEnabled(true);
  };

  const handlePrint = () => {
    setIsPrintEnabled(false)
    // Close the modal after print window is opened
    onClose();
    const receiptNo = payReceiptData?.response?.receipt_no;
    if (!receiptNo) {
       setTimeout(() => {
          toast.error("Receipt number not found.");
        }, 100); // delay to allow modal to remain mounted
     
    }

    dispatch(
      getStudentReceiptInfo({ receipt_no: receiptNo }, (response) => {
        if (response) {
          //setHtmlContent(response);
          const printWindow = window.open("", "_blank");
          printWindow.document.write(addAdminPrintLogo(response));
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        } else {
          alert("Failed to fetch receipt info.");
        }
      })
    );
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered dialogClassName="student-payment-dialog">
      <Modal.Header closeButton className="student-payment-header">
        <div className="student-payment-title-icon" aria-hidden="true">
          <i className="bi bi-cash-coin" />
        </div>
        <Modal.Title>Add Payment</Modal.Title>
      </Modal.Header>
      <Formik
        key={`payment-${show ? "open" : "closed"}-${student?.mobile_number || "student"}`}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {() => (
          <Form className="student-payment-form">
            <Modal.Body className="student-payment-body">
              {student?.balance !== undefined && (
                <div className="student-payment-balance">
                  <span>Current balance</span>
                  <strong>₹{Number(student.balance || 0).toLocaleString("en-IN")}</strong>
                </div>
              )}
              <div className="form-group student-payment-field">
                <label>
                  Amount <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  type="text"
                  inputMode="decimal"
                  name="amount"
                  className="form-control"
                  placeholder="Enter amount"
                />
                <ErrorMessage
                  name="amount"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group student-payment-field">
                <label>
                  Date <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  type="datetime-local"
                  step="60"
                  name="date"
                  className="form-control"
                />
                <ErrorMessage
                  name="date"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group student-payment-field">
                <label>
                  Payment Method <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  as="select"
                  name="payment_method"
                  className="form-control"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Upi">UPI</option>
                </Field>
                <ErrorMessage
                  name="payment_method"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group student-payment-field">
                <label>
                  Payment Status <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  as="select"
                  name="payment_status"
                  className="form-control"
                >
                  <option value="">Select status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </Field>
                <ErrorMessage
                  name="payment_status"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group student-payment-field">
                <label>Remarks</label>
                <Field
                  as="textarea"
                  name="remarks"
                  className="form-control"
                  rows={2}
                />
                <ErrorMessage
                  name="remarks"
                  component="div"
                  className="text-danger"
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="student-payment-footer">
              {!isPrintEnabled ? (
                <>
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    <i className="bi bi-check-lg" aria-hidden="true" /> Submit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-primary"
                    onClick={handlePrint}
                    disabled={!isPrintEnabled}
                  >
                    <i className="bi bi-printer" aria-hidden="true" /> Print
                  </Button>
                  <Button variant="secondary" onClick={onCloseFun}>
                    Close
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Form>
        )}
      </Formik>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeButton={false}
        closeOnClick
        pauseOnHover
      />
    </Modal>
  );
}
