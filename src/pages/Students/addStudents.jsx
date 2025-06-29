import React, { useEffect, useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addStudent, updateStudent } from "../../store/addStudent/actions";
import { IoClose } from "react-icons/io5";
import {
  getStudentReceiptInfo,
} from "../../store/students/actions";

export default function AddStudents({
  showModal,
  hideModal,
  id,
  isEdit,
  onStudentAdded,
  studentData,
  plans = [],
  instructors = []
}) {
  const dispatch = useDispatch();
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");



  const initialValues = {
    name: id?.name || '',
    dob: id?.dob || '',
    mobile_number: id?.mobile_number || '',
    application_number: id?.application_number || '',
    email: id?.email || null,
    aadhar_number: id?.aadhar_number || '',
    plan: id?.plan || '',
    payment_method: id?.payment_method || '',
    paid_amount: id?.paid_amount || 0,
    total_amount: id?.total_amount || 0,
    balance: id?.balance || 0,
    full_payment_status: id?.full_payment_status || 'Pending',
    instructor_name: id?.instructor_name || '',
    instructor_mobile: id?.instructor_mobile || '',
    test_date: id?.test_date || null,
    discount: id?.discount || 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    dob: Yup.date()
  .required("Date of birth is required")
  .max(new Date(), "DOB cannot be in future")
  .test("age", "Student must be at least 18 years old", function (value) {
    if (!value) return false;
    const today = new Date();
    const birthDate = new Date(value);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return age > 18 || (age === 18 && m >= 0);
  }),
    mobile_number: Yup.string().matches(/^\d{10}$/, "Mobile number must be 10 digits").required("Mobile number is required"),
    application_number: Yup.string().required("Application number is required"),
    email: "", //Yup.string(), //.email("Invalid email format").required("Email is required"),
    aadhar_number: Yup.string().required("Aadhar number is required"),
    plan: Yup.string().required("Plan is required"),
    payment_method: Yup.string().required("Payment method is required"),
    paid_amount: Yup.number().required("Paid amount is required").typeError("Must be a number"),
    total_amount: Yup.number().required("Total amount is required").typeError("Must be a number"),
    balance: Yup.number().required("Balance is required").typeError("Must be a number"),
    full_payment_status: Yup.string().required("Full payment status is required"),
    instructor_name: Yup.string().required("Instructor name is required"),
    instructor_mobile: Yup.string().required("Instructor mobile is required"),
     ...(isEdit && {
    test_date: Yup.date().required("Test date is required"),
    discount: Yup.number()
  .typeError("Discount must be a number")
  .min(0, "Discount cannot be negative")
  .test("discount-not-exceed-balance", "Discount cannot exceed remaining balance", function (value) {
    const { total_amount, paid_amount } = this.parent;
    const total = parseFloat(total_amount);
    const paid = parseFloat(paid_amount);
    const discount = parseFloat(value);

    const remaining = total - paid;

    if (isNaN(discount) || isNaN(remaining)) return true;
    return discount <= remaining;
  }),

  })
  }).test(
    'paid-vs-total',
    'Paid amount cannot be greater than total amount',
    function (values) {
      const paid = parseFloat(values.paid_amount);
      const total = parseFloat(values.total_amount);
      return !isNaN(paid) && !isNaN(total) ? paid <= total : true;
    }
  );

  

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => {
  let updatedValues = {};

  if (isEdit) {
    Object.keys(values).forEach((key) => {
      if (values[key] !== id[key]) {
        updatedValues[key] = values[key];
      }
    });

    updatedValues.status = "Process Started";

    const payload = {
      application_number: id?.application_number,
      studentData: updatedValues,
    };

    dispatch(updateStudent(payload, (response) => {
      handleResponse(response);
    }));
  } else {
    updatedValues = {
      ...values,
      status: "Process Started",
    };

    dispatch(addStudent({ studentData: updatedValues }, (response) => {
      handleResponse(response);
    }));
  }

  function handleResponse(response) {
    const errorList = response?.data?.detail || response?.detail || response;

    if (Array.isArray(errorList)) {
      errorList.forEach((err) => {
        const field = err?.loc?.[1];
        const msg = err?.msg || err?.message || 'Invalid input';
        if (field && formik.values.hasOwnProperty(field)) {
          formik.setFieldError(field, msg);
        }
      });
      return;
    }

    formik.resetForm();
    if (typeof onStudentAdded === 'function') {
      onStudentAdded();
      studentData(response, isEdit);
      setReceiptData(response?.response || response);
    }
    setIsPrintEnabled(true);
  }
}

  });

  useEffect(() => {
  const paid = parseFloat(formik.values.paid_amount);
  const discount = parseFloat(formik.values.discount) || 0;
  const total = parseFloat(formik.values.total_amount);

  if (!isNaN(paid) && !isNaN(total)) {
    const finalBalance = total - discount - paid;
    formik.setFieldValue('balance', finalBalance);
  }
}, [formik.values.paid_amount, formik.values.total_amount, formik.values.discount]);


  useEffect(() => {
    const selectedPlan = plans.find((p) => p.plan_name === formik.values.plan);
    if (selectedPlan) {
      formik.setFieldValue('total_amount', selectedPlan.amount || 0);
    }
  }, [formik.values.plan, plans]);

  useEffect(() => {
    const selectedInstructor = instructors.find((i) => i.name === formik.values.instructor_name);
    if (selectedInstructor) {
      formik.setFieldValue('instructor_mobile', selectedInstructor.mobile_number || '');
    }
  }, [formik.values.instructor_name, instructors]);

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    formik.setFieldValue(name, numericValue);
  };

  const showBalanceWarning = parseFloat(formik.values.balance) < 0;

  const fields = [
    'name', 'dob',
    'mobile_number', 'application_number',
    'email', 'aadhar_number',
    'plan', 'payment_method',
    'paid_amount', 'discount','total_amount',
    'balance', 'full_payment_status',
    'instructor_name', 'instructor_mobile'
  ];

  const fieldPairs = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  useEffect(() => {
  if (showModal) {
    setIsPrintEnabled(false);
  }
}, [showModal]);


const handlePrint = () => {
  hideModal();

  const receipt_no = receiptData?.payments?.[0]?.receipt_no ||
                     receiptData?.response?.payments?.[0]?.receipt_no;

                     //console.info('receiptData.......', receiptData)

  if (!receipt_no) {
    alert("Receipt number not available to print.");
    return;
  }

  dispatch(getStudentReceiptInfo({ receipt_no }, (response) => {
    if (response) {
      setHtmlContent(response);
      setTimeout(() => {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(response);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }, 100);
    } else {
      alert("Failed to fetch receipt info.");
    }
  }));
};





  return (
    <Modal
      show={showModal}
      onHide={hideModal}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Update Student" : "Add Student"}</Modal.Title>
        <IoClose
          onClick={() => {
            formik.resetForm();
            hideModal();
          }}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            marginLeft: "auto",
            color: "#6c757d",
          }}
          title="Close"
        />
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          {showBalanceWarning && (
            <Alert variant="warning">
              Warning: Balance is negative. Please verify paid and total
              amounts.
            </Alert>
          )}
          {fieldPairs.map((pair, rowIndex) => (
            <div className="row" key={rowIndex}>
              {pair.map((field) => (
                <div className="col-md-6" key={field}>
                  <div className="form-group">
                    <label>
                      {field
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      {[
                        "name",
                        "dob",
                        "mobile_number",
                        "application_number",
                        "aadhar_number",
                        "plan",
                        "payment_method",
                        "paid_amount",
                        "total_amount",
                        "balance",
                        "full_payment_status",
                        "instructor_name",
                        "instructor_mobile",
                      ].includes(field) && (
                        <span style={{ color: "red" }}>*</span>
                      )}
                    </label>

                    {[
                      "full_payment_status",
                      "payment_method",
                      "plan",
                      "instructor_name",
                    ].includes(field) ? (
                      <select
                        name={field}
                        className={`form-control${
                          formik.touched[field] && formik.errors[field]
                            ? " is-invalid"
                            : ""
                        }`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field]}
                      >
                        <option value="">
                          Select {field.replace(/_/g, " ")}
                        </option>
                        {field === "full_payment_status" &&
                          ["Pending", "Completed", "Failed"].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        {field === "payment_method" &&
                          ["Cash", "Upi"].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        {field === "plan" &&
                          plans.map((plan) => (
                            <option key={plan.plan_name} value={plan.plan_name}>
                              {plan.plan_name}
                            </option>
                          ))}
                        {field === "instructor_name" &&
                          instructors.map((ins) => (
                            <option key={ins.name} value={ins.name}>
                              {ins.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type={
                          field === "dob" || field.includes("date")
                            ? "date"
                            : field === "email"
                            ? "email"
                            : "text"
                        }
                        name={field}
                        className={`form-control${
                          formik.touched[field] && formik.errors[field]
                            ? " is-invalid"
                            : ""
                        }${
                          showBalanceWarning && field === "balance"
                            ? " is-invalid"
                            : ""
                        }`}
                        onChange={
                          ["mobile_number", "aadhar_number", "discount"].includes(field)
                            ? handleNumericInput
                            : formik.handleChange
                        }
                        onBlur={formik.handleBlur}
                        value={formik.values[field]}
                        readOnly={[
                          "balance",
                          "total_amount",
                          "instructor_mobile",
                        ].includes(field)}
                        maxLength={
                          field === "mobile_number"
                            ? 10
                            : field === "aadhar_number"
                            ? 12
                            : undefined
                        }
                        style={
                          document.activeElement?.name === field
                            ? { backgroundColor: "#f0f8ff" }
                            : {}
                        }
                      />
                    )}
                    {formik.touched[field] && formik.errors[field] && (
                      <div className="text-danger">{formik.errors[field]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {isEdit && (
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>
                    Test Date <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="test_date"
                    className={`form-control${
                      formik.touched.test_date && formik.errors.test_date
                        ? " is-invalid"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.test_date}
                  />
                  {formik.touched.test_date && formik.errors.test_date && (
                    <div className="text-danger">{formik.errors.test_date}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Modal.Footer>
            {!isPrintEnabled ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    formik.resetForm();
                    hideModal();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEdit ? "Update" : "Add"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-primary"
                  onClick={handlePrint}
                  disabled={!isPrintEnabled}
                >
                  Print
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    formik.resetForm();
                    hideModal();
                  }}
                >
                  Close
                </Button>
              </>
            )}
          </Modal.Footer>
        </form>

        {htmlContent && (
          <div style={{ display: "none" }}>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
