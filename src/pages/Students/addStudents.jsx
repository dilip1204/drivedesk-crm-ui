import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addStudent, updateStudent } from "../../store/addStudent/actions";
import { IoClose } from "react-icons/io5";
import { getStudentReceiptInfo } from "../../store/students/actions";
import { getInstructorAvailInformation } from "../../store/instructors/actions";
import { addAdminPrintLogo } from "../../utils/printBranding";
import "./addStudents.css";

export default function AddStudents({
  showModal,
  hideModal,
  id,
  isEdit,
  onStudentAdded,
  studentData,
  plans = [],
  instructors = [],
}) {
  const dispatch = useDispatch();
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityDay, setAvailabilityDay] = useState(null);
  const previousInstructorNameRef = useRef("");
  const getLocalISODate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayISO = getLocalISODate();

  const normalizeDateForInput = (value) => {
    if (!value) return "";

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, "0");
      const d = String(value.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    const str = String(value).trim();

    // Already yyyy-mm-dd or yyyy-mm-ddTHH:mm:ss
    const isoLike = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
    if (isoLike) {
      return `${isoLike[1]}-${isoLike[2]}-${isoLike[3]}`;
    }

    // dd-mm-yyyy -> yyyy-mm-dd
    const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
    if (dmy) {
      return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }

    // yyyy/mm/dd -> yyyy-mm-dd
    const ymdSlash = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(str);
    if (ymdSlash) {
      return `${ymdSlash[1]}-${ymdSlash[2]}-${ymdSlash[3]}`;
    }

    return "";
  };

  // --- helpers for time normalization ---
  // Accepts "HH:MM", "H:MM AM/PM", or "HH:MM AM/PM" -> returns "HH:MM" (24h)
  const to24h = (input) => {
    if (!input || typeof input !== "string") return "";
    const trimmed = input.trim();

    // Already 24h "HH:MM"?
    const m24 = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
    if (m24) return `${m24[1]}:${m24[2]}`;

    // 12h "H:MM AM/PM"
    const m12 = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(trimmed);
    if (m12) {
      let h = parseInt(m12[1], 10);
      const mm = m12[2];
      const mer = m12[3].toUpperCase();
      if (mer === "AM") {
        if (h === 12) h = 0;
      } else {
        if (h !== 12) h += 12;
      }
      const hh = String(h).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    // Fallback: try to parse via Date if string like "HH:MM:SS"
    const asDate = new Date(`1970-01-01T${trimmed}`);
    if (!Number.isNaN(asDate.getTime())) {
      const hh = String(asDate.getHours()).padStart(2, "0");
      const mm = String(asDate.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    return "";
  };

  const initialValues = {
    name: id?.name || "",
    dob: normalizeDateForInput(id?.dob),
    mobile_number: id?.mobile_number || "",
    application_number: id?.application_number || "",
    email: id?.email || null,
    aadhar_number: id?.aadhar_number || "",
    plan: id?.plan || "",
    payment_method: id?.payment_method || "",
    paid_amount: id?.paid_amount || 0,
    total_amount: id?.total_amount || 0,
    balance: id?.balance || 0,
    full_payment_status: id?.full_payment_status || "Pending",
    instructor_name: id?.instructor_name || "",
    instructor_id: id?.instructor_id || "",
    instructor_mobile: id?.instructor_mobile || "",
    test_date: normalizeDateForInput(id?.test_date),
    discount: id?.discount || 0,
    training_days: id?.training_days || "",
    training_start_date: normalizeDateForInput(id?.training_start_date),
    // normalize incoming training_time to "HH:MM" so the time input shows it
    training_time: to24h(id?.training_time) || "",
    attended_days: id?.attended_days || 0,
  };

  const trainingStartMinDate = isEdit ? undefined : todayISO;

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    dob: Yup.date()
      .required("Date of birth is required")
      .max(new Date(), "DOB cannot be in future")
      .test("age", "Student must be at least 18 years old", function (value) {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        const d = today.getDate() - birthDate.getDate();
        if (m < 0 || (m === 0 && d < 0)) age -= 1;
        return age >= 18;
      }),
    mobile_number: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    application_number: Yup.string().required("Application Number is required"),
    email: "", // optional
    aadhar_number: Yup.string().required("Aadhar number is required"),
    plan: Yup.string().required("Plan is required"),
    payment_method: Yup.string().required("Payment method is required"),
    paid_amount: Yup.number()
      .required("Paid amount is required")
      .typeError("Must be a number"),
    total_amount: Yup.number()
      .required("Total amount is required")
      .typeError("Must be a number"),
    balance: Yup.number().required("Balance is required").typeError("Must be a number"),
    full_payment_status: Yup.string().required("Full payment status is required"),
    instructor_name: Yup.string().required("Instructor name is required"),
    instructor_mobile: Yup.string().required("Instructor mobile is required"),
    training_start_date: Yup.date()
      .required("Training Start Date is required")
      .typeError("Invalid date format")
      .test("training-start-date-min", "Training Start Date cannot be in the past", function (value) {
        if (!value) return false;
        if (isEdit) return true;

        const selected = normalizeDateForInput(value);
        if (!selected) return false;
        return selected >= todayISO;
      }),
    training_days: Yup.number()
      .nullable()
      .typeError("Training days must be a number")
      .min(0, "Cannot be negative"),
    // keep 24h HH:MM format for storage
    training_time: Yup.string()
      .nullable()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
      .required("Training time is required"),
    test_date: Yup.date()
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .typeError("Invalid date format"),
    ...(isEdit && {
      discount: Yup.number()
        .typeError("Discount must be a number")
        .min(0, "Discount cannot be negative")
        .test(
          "discount-not-exceed-balance",
          "Discount cannot exceed remaining balance",
          function (value) {
            const { total_amount, paid_amount } = this.parent;
            const total = parseFloat(total_amount);
            const paid = parseFloat(paid_amount);
            const discount = parseFloat(value);
            const remaining = total - paid;
            if (isNaN(discount) || isNaN(remaining)) return true;
            return discount <= remaining;
          }
        ),
    }),
  }).test(
    "paid-vs-total",
    "Paid amount cannot be greater than total amount",
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
      const normalizedValues = {
        ...values,
        test_date: values.test_date ? values.test_date : null,
      };

      let updatedValues = {};

      if (isEdit) {
        Object.keys(normalizedValues).forEach((key) => {
          if (normalizedValues[key] !== id[key]) {
            updatedValues[key] = normalizedValues[key];
          }
        });

        updatedValues.status = "Process Started";

        const payload = {
          application_number: id?.application_number,
          studentData: updatedValues,
          mobile_number: id?.mobile_number,
        };

        dispatch(
          updateStudent(payload, (response) => {
            handleResponse(response);
          })
        );
      } else {
        updatedValues = {
          ...normalizedValues,
          status: "Process Started",
        };

        // Add instructor_id by looking up selected instructor
        const selectedInstructor = instructors.find(
          (ins) => ins.name === values.instructor_name
        );
        if (selectedInstructor) {
          updatedValues.instructor_id = selectedInstructor.id;
        }

        dispatch(
          addStudent({ studentData: updatedValues }, (response) => {
            handleResponse(response);
          })
        );
      }

      function handleResponse(response) {
        const responseData = response?.data || response || {};
        const errorList = responseData?.detail || response?.detail;

        if (Array.isArray(errorList)) {
          errorList.forEach((err) => {
            const field = err?.loc?.[1];
            const msg = err?.msg || err?.message || "Invalid input";
            if (field && Object.prototype.hasOwnProperty.call(formik.values, field)) {
              formik.setFieldError(field, msg);
            }
          });
          return;
        }

        const hasError =
          responseData?.isError === true ||
          Number(responseData?.statusCode) >= 400 ||
          Number(response?.status) >= 400;

        if (hasError) {
          if (typeof studentData === "function") {
            studentData(responseData, isEdit);
          }
          return;
        }

        // PATCH success: clear stale field errors (e.g., training_time conflict) and proceed.
        formik.setErrors({});
        formik.setTouched({});
        setAvailabilityError("");
        setAvailabilityDay(null);

        formik.resetForm();
        if (typeof onStudentAdded === "function") {
          onStudentAdded();
        }
        if (typeof studentData === "function") {
          studentData(responseData, isEdit);
        }
        setReceiptData(responseData?.response || responseData);

        // Auto-close modal after successful save for both Add and Edit flows.
        setIsPrintEnabled(false);
        hideModal();
      }
    },
  });

  //const selectedTrainingDate = formik.values.training_start_date || formik.values.test_date || "";
  const selectedTrainingTime = to24h(formik.values.training_time || "");
  const selectedTrainingDate = formik.values.training_start_date || formik.values.test_date || "";
  const originalTrainingDate = normalizeDateForInput(id?.training_start_date || id?.test_date);
  const originalTrainingTime = to24h(id?.training_time || "");
  const isSameStudentOriginalSlot = Boolean(
    isEdit &&
      selectedTrainingDate &&
      selectedTrainingTime &&
      selectedTrainingDate === originalTrainingDate &&
      selectedTrainingTime === originalTrainingTime
  );

  const bookedTimesForDay = Array.isArray(availabilityDay?.booked_slots)
    ? availabilityDay.booked_slots
        .map((slot) => to24h(slot?.time || slot?.slot_time || slot?.start_time || ""))
        .filter(Boolean)
    : [];
  const availableTimesForDay = Array.isArray(availabilityDay?.available_slots)
    ? availabilityDay.available_slots.map((slot) => to24h(slot)).filter(Boolean)
    : [];
  const combinedTimesForDay = Array.from(
    new Set([...bookedTimesForDay, ...availableTimesForDay])
  ).sort();
  const isSelectedTimeBooked = Boolean(
    selectedTrainingTime && bookedTimesForDay.includes(selectedTrainingTime)
  );
  const isSelectedTimeUnavailable = Boolean(
    selectedTrainingTime &&
      availableTimesForDay.length > 0 &&
      !availableTimesForDay.includes(selectedTrainingTime)
  );
  const hasTimeConflict =
    (isSelectedTimeBooked && !isSameStudentOriginalSlot) ||
    isSelectedTimeUnavailable;

  useEffect(() => {
    const paid = parseFloat(formik.values.paid_amount);
    const discount = parseFloat(formik.values.discount) || 0;
    const total = parseFloat(formik.values.total_amount);

    if (!isNaN(paid) && !isNaN(total)) {
      const finalBalance = total - discount - paid;
      formik.setFieldValue("balance", finalBalance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.paid_amount, formik.values.total_amount, formik.values.discount]);

  useEffect(() => {
    const selectedPlan = plans.find((p) => p.plan_name === formik.values.plan);
    if (selectedPlan) {
      formik.setFieldValue("total_amount", selectedPlan.amount || 0);
      formik.setFieldValue("training_days", selectedPlan.training_days || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.plan, plans]);

  useEffect(() => {
    const selectedInstructor = instructors.find(
      (i) => i.name === formik.values.instructor_name
    );

    const currentInstructorName = formik.values.instructor_name || "";
    const previousInstructorName = previousInstructorNameRef.current;

    if (
      showModal &&
      previousInstructorName &&
      previousInstructorName !== currentInstructorName
    ) {
      formik.setFieldValue("training_time", "", false);
      formik.setFieldError("training_time", undefined);
      setAvailabilityDay(null);
      setAvailabilityError("");
    }

    previousInstructorNameRef.current = currentInstructorName;

    if (selectedInstructor) {
      formik.setFieldValue("instructor_mobile", selectedInstructor.mobile_number || "");
      formik.setFieldValue("instructor_id", selectedInstructor.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.instructor_name, instructors]);

  useEffect(() => {
    const selectedInstructor = instructors.find(
      (i) => i.name === formik.values.instructor_name
    );

    const selectedDate = formik.values.training_start_date || formik.values.test_date;

    if (!showModal || !selectedInstructor || !selectedDate) {
      setAvailabilityDay(null);
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    const month = selectedDate.slice(0, 7);
    const instructorKey =
      selectedInstructor.mobile_number ||
      selectedInstructor.id ||
      formik.values.instructor_mobile;

    if (!instructorKey || !month) {
      setAvailabilityDay(null);
      setAvailabilityError("Select valid instructor and date to view availability.");
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");

    dispatch(
      getInstructorAvailInformation(
        { mobile_number: instructorKey, month },
        (res, err) => {
          if (err) {
            setAvailabilityDay(null);
            setAvailabilityError("Failed to load instructor availability.");
            setAvailabilityLoading(false);
            return;
          }

          const payload = res?.response ?? res;
          const days = Array.isArray(payload?.days) ? payload.days : [];
          const dayInfo = days.find((d) => (d?.date || "").startsWith(selectedDate));

          setAvailabilityDay(dayInfo || null);
          setAvailabilityLoading(false);
        }
      )
    );
  }, [
    dispatch,
    formik.values.instructor_name,
    formik.values.instructor_mobile,
    formik.values.training_start_date,
    formik.values.test_date,
    instructors,
    showModal,
  ]);

  useEffect(() => {
    if (showModal) {
      setIsPrintEnabled(false);
      // normalize training_time once when opening
      if (formik.values.training_time) {
        const normalized = to24h(formik.values.training_time);
        if (normalized && normalized !== formik.values.training_time) {
          formik.setFieldValue("training_time", normalized);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    if (!formik.values.training_time) return;

    if (hasTimeConflict) {
      formik.setFieldError(
        "training_time",
        isSelectedTimeBooked
          ? "The selected training time is already booked for this instructor. Please choose another slot."
          : "Selected time is not available for this instructor on the chosen date."
      );
      return;
    }

    if (formik.errors.training_time &&
      typeof formik.errors.training_time === "string" &&
      (formik.errors.training_time.includes("already booked") ||
        formik.errors.training_time.includes("not available"))) {
      formik.setFieldError("training_time", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTimeConflict, selectedTrainingTime, selectedTrainingDate, availabilityDay, isSelectedTimeBooked]);

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    formik.setFieldValue(name, numericValue);
  };

  const showBalanceWarning = parseFloat(formik.values.balance) < 0;

  const hasTrainingFieldChanged =
    formik.values.training_time !== initialValues.training_time ||
    formik.values.training_start_date !== initialValues.training_start_date ||
    formik.values.instructor_name !== initialValues.instructor_name ||
    formik.values.instructor_mobile !== initialValues.instructor_mobile;

  const shouldDisableSubmit = !isEdit
    ? hasTimeConflict
    : hasTimeConflict && hasTrainingFieldChanged;

  const fields = [
    "name",
    "dob",
    "mobile_number",
    "application_number",
    "aadhar_number",
    "plan",
    "payment_method",
    "paid_amount",
    "discount",
    "total_amount",
    "balance",
    "full_payment_status",
    "instructor_name",
    "instructor_mobile",
    "training_days",
    "training_start_date",
    "training_time",
  ];

  const fieldPairs = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  const handlePrint = () => {
    hideModal();

    const receipt_no =
      receiptData?.payments?.[0]?.receipt_no ||
      receiptData?.response?.payments?.[0]?.receipt_no;

    if (!receipt_no) {
      alert("Receipt number not available to print.");
      return;
    }

    dispatch(
      getStudentReceiptInfo({ receipt_no }, (response) => {
        if (response) {
          setHtmlContent(response);
          setTimeout(() => {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(addAdminPrintLogo(response));
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }, 100);
        } else {
          alert("Failed to fetch receipt info.");
        }
      })
    );
  };

  return (
    <Modal show={showModal} onHide={hideModal} backdrop="static" keyboard={false} size="lg" centered dialogClassName="student-form-dialog">
      <Modal.Header className="student-form-header">
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
      <Modal.Body className="student-form-body">
        <form onSubmit={formik.handleSubmit} className="student-form">
          {showBalanceWarning && (
            <Alert variant="warning">
              Warning: Balance is negative. Please verify paid and total amounts.
            </Alert>
          )}

          {fieldPairs.map((pair, rowIndex) => (
            <div className="row student-form-row" key={rowIndex}>
              {pair.map((field) => (
                <div className="col-md-6" key={field}>
                  <div className="form-group student-form-group">
                    <label>
                      {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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
                        "training_days",
                        "training_start_date",
                        "training_time",
                      ].includes(field) && <span style={{ color: "red" }}>*</span>}
                    </label>

                    {["full_payment_status", "payment_method", "plan", "instructor_name"].includes(
                      field
                    ) ? (
                      <select
                        name={field}
                        className={`form-control${
                          formik.touched[field] && formik.errors[field] ? " is-invalid" : ""
                        }`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field]}
                      >
                        <option value="">Select {field.replace(/_/g, " ")}</option>
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
                    ) : field === "training_time" ? (
                      // --- Native time picker (stores 24h "HH:MM") ---
                      <input
                        type="time"
                        name="training_time"
                        step="60"
                        className={`form-control${
                          formik.touched.training_time && formik.errors.training_time
                            ? " is-invalid"
                            : ""
                        }`}
                        value={formik.values.training_time || ""}
                        readOnly
                        onChange={(e) => {
                          // e.target.value is already "HH:MM"
                          const value24 = to24h(e.target.value);
                          formik.setFieldValue("training_time", value24);
                        }}
                        onBlur={formik.handleBlur}
                      />
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
                          formik.touched[field] && formik.errors[field] ? " is-invalid" : ""
                        }${showBalanceWarning && field === "balance" ? " is-invalid" : ""}`}
                        onChange={
                          ["mobile_number", "aadhar_number", "discount", "training_days"].includes(
                            field
                          )
                            ? handleNumericInput
                            : formik.handleChange
                        }
                        onBlur={formik.handleBlur}
                        value={formik.values?.[field] || ""}
                        min={field === "training_start_date" ? trainingStartMinDate : undefined}
                        readOnly={["balance", "total_amount", "instructor_mobile"].includes(field)}
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

          <div className="row student-form-row">
            <div className="col-md-6">
              <div className="form-group student-form-group">
                <label>
                  Test Date
                </label>
                <input
                  type="date"
                  name="test_date"
                  className={`form-control${
                    formik.touched.test_date && formik.errors.test_date ? " is-invalid" : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.test_date || ""}
                />
                {formik.touched.test_date && formik.errors.test_date && (
                  <div className="text-danger">{formik.errors.test_date}</div>
                )}
              </div>
            </div>
          </div>

          {(formik.values.instructor_name &&
            (formik.values.training_start_date || formik.values.test_date)) && (
            <div className="row student-form-row">
              <div className="col-12">
                <div
                  className="p-3 mb-3 student-availability-panel"
                  style={{ border: "1px solid #e9ecef", borderRadius: 8 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 student-availability-header">
                    <h6 className="mb-0">Instructor Availability</h6>
                    <a
                      href={`/instructors/${formik.values.instructor_mobile || formik.values.instructor_id}/availability`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Open Full Schedule
                    </a>
                  </div>

                  <div className="small text-muted mb-2">
                    Date: {formik.values.training_start_date || formik.values.test_date}
                  </div>

                  {availabilityLoading && (
                    <div className="text-secondary small">Loading availability...</div>
                  )}

                  {!availabilityLoading && availabilityError && (
                    <div className="text-danger small">{availabilityError}</div>
                  )}

                  {!availabilityLoading && !availabilityError && availabilityDay && (
                    <>
                      <div className="d-flex flex-wrap gap-3 mb-2 small">
                        <span>
                          Available: <strong>{availabilityDay.available_slots?.length || 0}</strong>
                        </span>
                        <span>
                          Booked: <strong>{availabilityDay.booked_slots?.length || 0}</strong>
                        </span>
                        {availabilityDay.is_sunday && (
                          <span className="text-warning"><strong>Sunday (off day)</strong></span>
                        )}
                      </div>

                      {hasTimeConflict && (
                        <Alert variant="danger" className="py-2 mb-2">
                          {isSelectedTimeBooked
                            ? "The selected training time is already booked for this instructor. Please choose another slot."
                            : "Selected training time is not available for this instructor on the chosen date."
                          }
                        </Alert>
                      )}

                      <div className="d-flex flex-wrap gap-2">
                        {combinedTimesForDay.length > 0 ? (
                          combinedTimesForDay.map((slot) => {
                            const isBooked = bookedTimesForDay.includes(slot);
                            const isSelected = formik.values.training_time === slot;

                            if (isBooked) {
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  disabled
                                  title="Already booked"
                                >
                                  {slot}
                                </button>
                              );
                            }

                            return (
                              <button
                                key={slot}
                                type="button"
                                className={`btn btn-sm ${
                                  isSelected ? "btn-primary" : "btn-outline-success"
                                }`}
                                onClick={() => {
                                  formik.setFieldValue("training_time", slot);
                                }}
                                title="Select this slot as training time"
                              >
                                {slot}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-muted small">No available slots for selected date.</span>
                        )}
                      </div>

                    </>
                  )}

                  {!availabilityLoading && !availabilityError && !availabilityDay && (
                    <div className="text-muted small">
                      No availability data found for the selected date.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Modal.Footer className="student-form-footer">
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
                <Button type="submit" variant="primary" disabled={shouldDisableSubmit}>
                  {isEdit ? "Update" : "Add"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline-primary" onClick={handlePrint} disabled={!isPrintEnabled}>
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
