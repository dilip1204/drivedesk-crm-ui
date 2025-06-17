import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  getStudentReceiptInfo,
} from "../../store/students/actions";
import { ToastContainer, toast } from "react-toastify";


export default function AddPayment({ show, onClose, onSubmit, payReceiptData, student  }) {

    const dispatch = useDispatch();
      const studentList = useSelector((state) => state.studentsListInfo.studentsList);
      
      const [receiptData, setReceiptData] = useState(payReceiptData);
        const [htmlContent, setHtmlContent] = useState("");
        const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const initialValues = {
    amount: '',
    date: new Date().toISOString().slice(0, 16), // default now
    payment_method: '',
    payment_status: '',
    remarks: ''
  };

  const validationSchema = Yup.object({
    amount: Yup.number().required("Amount is required").typeError("Must be a number"),
    date: Yup.date().required("Date is required"),
    payment_method: Yup.string().required("Payment method is required"),
    payment_status: Yup.string().required("Payment status is required"),
    remarks: Yup.string()
  });

  const handleFormSubmit = (values, { resetForm }) => {
  const enteredAmount = Number(values.amount);
  const balance = Number(student?.balance || 0);

  if (balance <= 0) {
    toast.error("❌ Student has no pending balance. Payment not required.");
    return;
  }

  if (enteredAmount > balance) {
    toast.error(`❌ Entered amount exceeds balance. Maximum allowed: ₹${balance}`);
    return;
  }

  const payload = {
    amount: enteredAmount,
    date: new Date(values.date).toISOString(),
    payment_method: values.payment_method,
    payment_status: values.payment_status,
    remarks: values.remarks
  };

  if (typeof onSubmit === 'function') {
    onSubmit(payload);
  }

  resetForm();
  setIsPrintEnabled(true);
};


  const handlePrint = () => {
    // Close the modal after print window is opened
      onClose();
  const receiptNo = payReceiptData?.response?.receipt_no;
  if (!receiptNo) {
    alert("Receipt number not found.");
    return;
  }

  dispatch(getStudentReceiptInfo({ receipt_no: receiptNo }, (response) => {
    if (response) {
      setHtmlContent(response);
      const printWindow = window.open("", "_blank");
      printWindow.document.write(response);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      

    } else {
      alert("Failed to fetch receipt info.");
    }
  }));
};


  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Payment</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ handleChange, handleBlur, values }) => (
          <Form>
            <Modal.Body>
                {student?.balance !== undefined && (
  <div className="mb-3 alert alert-info p-2">
    Current Balance: ₹{student.balance}
  </div>
)}
              <div className="form-group">
                <label>Amount <span style={{ color: 'red' }}>*</span></label>
                <Field type="number" name="amount" className="form-control" />
                <ErrorMessage name="amount" component="div" className="text-danger" />
              </div>

              <div className="form-group">
                <label>Date <span style={{ color: 'red' }}>*</span></label>
                <Field type="datetime-local" name="date" className="form-control" />
                <ErrorMessage name="date" component="div" className="text-danger" />
              </div>

              <div className="form-group">
                <label>Payment Method <span style={{ color: 'red' }}>*</span></label>
                <Field as="select" name="payment_method" className="form-control">
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  
                </Field>
                <ErrorMessage name="payment_method" component="div" className="text-danger" />
              </div>

              <div className="form-group">
                <label>Payment Status <span style={{ color: 'red' }}>*</span></label>
                <Field as="select" name="payment_status" className="form-control">
                  <option value="">Select status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </Field>
                <ErrorMessage name="payment_status" component="div" className="text-danger" />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <Field as="textarea" name="remarks" className="form-control" rows={2} />
                <ErrorMessage name="remarks" component="div" className="text-danger" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Submit</Button>
              <Button
    variant="outline-primary"
    onClick={handlePrint}
    disabled={!isPrintEnabled}
  >
    Print
  </Button>
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
