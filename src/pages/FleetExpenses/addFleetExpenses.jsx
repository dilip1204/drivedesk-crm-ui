import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { addExpenses, updateExpenses } from "../../store/expenses/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";

// Vehicle types (includes Stationery & Salary)
const VEHICLE_TYPES = ["Car", "Bus", "Truck", "Bike", "Rent", "Other", "Food & Snacks", "Stationery", "Salary", "Trailer", "RTO Payment"];
const VEHICLE_EXPENSE_TYPES = ["Car", "Bus", "Truck", "Bike", "Trailer"];
const VEHICLE_CATEGORIES = [
  "Fuel",
  "Service",
  "Repairs",
  "Insurance",
  "Tax",
  "Parking",
  "Wash",
  "Accessories",
  "Other",
];
const RTO_CATEGORIES = ["LLR", "Slot Booking", "FC Payment"];
const OTHER_CATEGORIES = [
  "Other",
  "Daily Wages",
  "Designing",
  "Flex Printing",
  "Cleaning",
  "One Time Purchase",
  "Track Maintenance",
  "Painting",
  "Flower",
];
const FOOD_AND_SNACK_CATEGORIES = [
  "Tea/Coffee and Snacks",
  "Lunch",
  "Dinner",
  "Breakfast",
  "Birthday Sponsor",
];
const CATEGORIES = [
  ...VEHICLE_CATEGORIES,
  "Stationaries",
  ...OTHER_CATEGORIES,
  ...FOOD_AND_SNACK_CATEGORIES,
  ...RTO_CATEGORIES,
];
const ODOMETER_CATEGORIES = ["Fuel", "Service", "Repairs"];

const getCategoryOptions = (expenseType) => {
  const normalizedType = (expenseType || "").toString().trim().toLowerCase();

  if (!normalizedType || normalizedType === "salary" || normalizedType === "rent") return [];
  if (normalizedType === "rto payment") return RTO_CATEGORIES;
  if (normalizedType === "stationery") return ["Stationaries"];
  if (normalizedType === "other") return OTHER_CATEGORIES;
  if (normalizedType === "food & snacks") return FOOD_AND_SNACK_CATEGORIES;
  return VEHICLE_CATEGORIES;
};

const isVehicleExpenseType = (expenseType) =>
  VEHICLE_EXPENSE_TYPES.some(
    (type) => type.toLowerCase() === (expenseType || "").toString().trim().toLowerCase()
  );

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function AddFleetExpenses({
  showModal,
  hideModal,
  expense = null,
  isEdit = false,
  viewOnly = false,
  onExpensesAdded = () => {},
  expensesData = () => {},
  // optional: pass list of instructors (array of strings or {id,name})
  //instructors = [],
}) {
  const dispatch = useDispatch();
  const [instructors, setInstructorsData] = useState([]);

  const vehicleTypes = useMemo(() => {
    const incoming =
      expense?.vehicleType ??
      expense?.vehicle_type ??
      expense?.vehicle_type_name ??
      expense?.type ??
      "";
    const base = [...VEHICLE_TYPES];
    if (incoming && !base.includes(incoming)) base.unshift(incoming);
    return base;
  }, [expense]);

  const initialValues = useMemo(() => {
    const odometerVal = expense?.odo_meter ?? expense?.odometer ?? "";
    const amountVal = expense?.amount ?? "";

    const vehicleTypeVal =
      expense?.vehicleType ?? expense?.vehicle_type ?? expense?.vehicle_type_name ?? expense?.type ?? "";

    return {
      id: expense?.id || uid(),
      date: toInputDate(expense?.date ?? expense?.created_at ?? ""),
      vehicle: expense?.vehicle ?? expense?.vehicle_id ?? "",
      vehicleType: vehicleTypeVal || "",
      odometer: odometerVal?.toString() || "",
      category: expense?.category || "",
      amount: amountVal?.toString() || "",
      notes: expense?.notes || "",
      vehicle_id: expense?.vehicle_id || expense?.vehicle || "",
      stationary: expense?.stationary || "",
      created_by: expense?.created_by || "",
      // instructor: support different shapes (id or name)
      instructor: expense?.instructor_id ?? expense?.instructor ?? "",
    };
  }, [expense]);

  const normalize = (v) => (v || "").toString().trim().toLowerCase();

  const validationSchema = Yup.object().shape({
    date: Yup.string().required("Date is required"),
    vehicle: Yup.string().when("vehicleType", (vehicleType, schema) => {
      if (!isVehicleExpenseType(vehicleType)) return schema.notRequired().nullable();
      return schema.required("Vehicle name/number is required");
}),
    vehicleType: Yup.string().required("Expense type is required").oneOf(vehicleTypes, "Invalid vehicle type"),
    // instructor required only if vehicleType is Salary
    instructor: Yup.string().when("vehicleType", {
      is: (v) => normalize(v) === "salary",
      then: (s) => s.required("Instructor is required for Salary expenses"),
      otherwise: (s) => s.nullable(),
    }),
    odometer: Yup.number().typeError("Odometer must be a number").min(0, "Odometer cannot be negative").nullable(),
    category: Yup.string().when("vehicleType", {
  is: (v) => {
    const vt = normalize(v);
    return vt !== "salary" && vt !== "rent";
  },
  then: (s) =>
    s.required("Expense category is required")
      .oneOf(CATEGORIES, "Invalid category"),
  otherwise: (s) => s.nullable(),
}),
    amount: Yup.number().typeError("Amount must be a number").min(0, "Amount cannot be negative").required("Amount is required"),
    notes: Yup.string().max(500, "Notes too long"),
    vehicle_id: Yup.string().nullable(),
    stationary: Yup.string().nullable().max(200, "Stationary too long"),
    created_by: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false,
    onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
      console.log("onSubmit called with values:", values);

      const payload = {
        id: values.id || uid(),
        type: "vehicle",
        category:
  normalize(values.vehicleType) === "rent"
    ? "Rent"
    : values.category || "",
        vehicle_id: values.vehicle_id || values.vehicle || "",
        vehicle: values.vehicle || values.vehicle_id || "",
        vehicleType: values.vehicleType || "",
        vehicle_type: values.vehicleType || "",
        amount: values.amount === "" ? 0 : Number(values.amount),
        date: values.date || new Date().toISOString().slice(0, 10),
        notes: values.notes || "",
        odo_meter: values.odometer || "",
        stationary: values.stationary || "",
        created_by: values.created_by || "system_user",
        created_at: new Date().toISOString(),
        // add instructor info to payload when present
        instructor: values.instructor || undefined,
        instructor_id: values.instructor || undefined,
        employee_name: values.instructor || "",
      };

      const handleResponse = (response) => {
        console.log("handleResponse got:", response);
        const errorList = response?.data?.detail || response?.detail || response;
        if (Array.isArray(errorList)) {
          errorList.forEach((err) => {
            const field = err?.loc?.[1] || err?.loc?.[0] || null;
            const msg = err?.msg || err?.message || "Invalid input";
            if (field && Object.prototype.hasOwnProperty.call(formik.values, field)) {
              setFieldError(field, msg);
            }
          });
          setSubmitting(false);
          return;
        }

        resetForm();
        if (typeof onExpensesAdded === "function") onExpensesAdded(payload);
        if (typeof expensesData === "function") expensesData(response, isEdit);

        setSubmitting(false);
        hideModal();
      };

      try {
        if (isEdit) {
          // support two possible action styles: callback-style or promise-style
          const result = dispatch(updateExpenses(payload, (resp) => handleResponse(resp)));
          if (result && typeof result.then === "function") {
            // action returned a promise
            result.then((resp) => handleResponse(resp)).catch((err) => {
              console.error("updateExpenses promise error:", err);
              setSubmitting(false);
            });
          }
        } else {
          const result = dispatch(addExpenses(payload, (resp) => handleResponse(resp)));
          if (result && typeof result.then === "function") {
            result.then((resp) => handleResponse(resp)).catch((err) => {
              console.error("addExpenses promise error:", err);
              setSubmitting(false);
            });
          }
        }
      } catch (err) {
        console.error("dispatch throw:", err);
        setSubmitting(false);
      }
    },
  });

  const getInstructorsList = useCallback(() => {
      dispatch(
        getInstructorsListInformation({}, (res) => {
          const instructorsList = res?.response || [];
          setInstructorsData(
            Array.isArray(instructorsList) ? instructorsList : []
          );
        })
      );
    }, [dispatch]);

  useEffect(() => {
      getInstructorsList();
  }, [dispatch]);
  

  // Clear irrelevant fields when type/category change
  useEffect(() => {
    const vt = normalize(formik.values.vehicleType);
    const category = formik.values.category;
    const availableCategories = getCategoryOptions(formik.values.vehicleType);
    const hideOdometer = vt === "other" || vt === "stationery" || !ODOMETER_CATEGORIES.includes(category);

    if (category && !availableCategories.includes(category)) {
      formik.setFieldValue("category", "");
    }

    if (hideOdometer) {
      if (formik.values.odometer !== "") formik.setFieldValue("odometer", "");
    }

    if (vt === "rent") {
  if (formik.values.vehicle !== "")
    formik.setFieldValue("vehicle", "");

  if (formik.values.vendor !== "")
    formik.setFieldValue("vendor", "");

  if (formik.values.category !== "")
    formik.setFieldValue("category", "");
}
    if (!isVehicleExpenseType(formik.values.vehicleType)) {
      if (formik.values.vehicle !== "") formik.setFieldValue("vehicle", "");
      if (formik.values.vehicle_id !== "") formik.setFieldValue("vehicle_id", "");
    }
    // When not Salary, clear instructor
    if (vt !== "salary" && formik.values.instructor !== "") {
      formik.setFieldValue("instructor", "");
    }

    // When Salary selected, clear vehicle/category/vendor and odometer fields
    if (vt === "salary") {
      if (formik.values.vehicle !== "") formik.setFieldValue("vehicle", "");
      if (formik.values.category !== "") formik.setFieldValue("category", "");
      if (formik.values.vendor !== "") formik.setFieldValue("vendor", "");
      if (formik.values.odometer !== "") formik.setFieldValue("odometer", "");
    }

    if ((vt === "stationery" || vt === "rto payment") && formik.values.vehicle !== "") {
      formik.setFieldValue("vehicle", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.vehicleType, formik.values.category]);

  useEffect(() => {
    if (showModal) formik.resetForm({ values: initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, initialValues]);

  const hideVehicleField = !isVehicleExpenseType(formik.values.vehicleType);

  // helper flag used in several places
  const isSalary = normalize(formik.values.vehicleType) === "salary";

  const showOdometer =
    normalize(formik.values.vehicleType) !== "other" &&
    normalize(formik.values.vehicleType) !== "stationery" &&
    ODOMETER_CATEGORIES.includes(formik.values.category);

  // Show instructor only when vehicleType is Salary
  const showInstructor = isSalary;

  const showInvalid = (name) => (formik.touched[name] && formik.errors[name] ? "is-invalid" : "");

  // EXPLICIT submit helper — call this from button click
  const explicitSubmit = () => {
    // Force validation before submit and then submit if no errors
    formik.validateForm().then((errs) => {
      if (Object.keys(errs).length > 0) {
        // mark all fields touched so user sees errors
        const touched = Object.keys(formik.values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        formik.setTouched(touched);
        console.warn("validation errors, not submitting:", errs);
        return;
      }
      // no errors -> submit
      formik.submitForm();
    });
  };

  return (
    <Modal
      show={!!showModal}
      onHide={() => {
        formik.resetForm();
        hideModal();
      }}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{viewOnly ? "View Expense" : isEdit ? "Update Expense" : "Add Expense"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {viewOnly ? (
          <div style={{ padding: "0" }}>
            <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#c9cfe8", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", fontSize: "24px", color: "#6c757d" }}>📋</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>{formik.values.vehicle || formik.values.vehicleType || "Expense"}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "32px", rowGap: "12px" }}>
              <div style={{ display: "flex" }}>
                <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "80px" }}>Date:</span>
                <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.date || "N/A"}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "100px" }}>Expense Type:</span>
                <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.vehicleType || "N/A"}</span>
              </div>

              <div style={{ display: "flex" }}>
                <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "80px" }}>Category:</span>
                <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.category || "N/A"}</span>
              </div>
              {!hideVehicleField && (
                <div style={{ display: "flex" }}>
                  <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "100px" }}>Vehicle:</span>
                  <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.vehicle || "N/A"}</span>
                </div>
              )}

              <div style={{ display: "flex" }}>
                <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "80px" }}>Amount:</span>
                <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>₹{Number(formik.values.amount || 0).toLocaleString("en-IN")}</span>
              </div>
              {showOdometer && (
                <div style={{ display: "flex" }}>
                  <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "100px" }}>Odometer (km):</span>
                  <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.odometer || "N/A"}</span>
                </div>
              )}

              {formik.values.notes && (
                <div style={{ gridColumn: "1 / -1", display: "flex" }}>
                  <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "80px" }}>Notes:</span>
                  <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.notes}</span>
                </div>
              )}

              {showInstructor && (
                <div style={{ gridColumn: "1 / -1", display: "flex" }}>
                  <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500", minWidth: "80px" }}>Instructor:</span>
                  <span style={{ fontSize: "13px", color: "#212529", fontWeight: "400" }}>{formik.values.instructor || "N/A"}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right", paddingTop: "16px", borderTop: "1px solid #e0e0e0" }}>
              <button type="button" onClick={() => { formik.resetForm(); hideModal(); }} style={{ backgroundColor: "#7a8a99", color: "white", border: "none", padding: "6px 16px", fontSize: "13px", borderRadius: "4px", cursor: "pointer", fontWeight: "500" }}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={(e) => { e.preventDefault(); explicitSubmit(); }}>
            {/* Primary expense fields wrap into available columns. */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Date <span style={{ color: "red" }}>*</span></label>
                <input type="date" name="date" className={`form-control ${showInvalid("date")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.date} />
                <div className="invalid-feedback">{formik.errors.date}</div>
              </div>

              <div className="col-md-6 mb-3">
                <label>Expense Type <span style={{ color: "red" }}>*</span></label>
                <select name="vehicleType" className={`form-control ${showInvalid("vehicleType")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.vehicleType}>
                  <option value="">Select expense type</option>
                  {vehicleTypes.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <div className="invalid-feedback">{formik.errors.vehicleType}</div>
              </div>

              {!isSalary && normalize(formik.values.vehicleType) !== "rent" && (
                <div className={`${hideVehicleField ? "col-md-12" : "col-md-6"} mb-3`}>
                  <label>Category <span style={{ color: "red" }}>*</span></label>
                  <select name="category" className={`form-control ${showInvalid("category")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.category}>
                    <option value="">Select category</option>
                    {getCategoryOptions(formik.values.vehicleType).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="invalid-feedback">{formik.errors.category}</div>
                </div>
              )}

              {!hideVehicleField && (
                <div className="col-md-6 mb-3">
                  <label>Vehicle <span style={{ color: "red" }}>*</span></label>
                  <input type="text" name="vehicle" className={`form-control ${showInvalid("vehicle")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.vehicle} placeholder="Enter vehicle name or number" />
                  <div className="invalid-feedback">{formik.errors.vehicle}</div>
                </div>
              )}
            </div>

          {/* Instructor (only for Salary) */}
          {showInstructor && (
            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Instructor <span style={{ color: "red" }}>*</span></label>
                <select
                  name="instructor"
                  className={`form-control ${showInvalid("instructor")}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.instructor}
                >
                  <option value="">Select Employee</option>
                  {instructors.map((inst, idx) => {
                    if (typeof inst === "string") return <option key={idx} value={inst}>{inst}</option>;
                    return <option key={inst.id ?? idx} value={inst.id ?? inst.name}>{inst.name ?? inst.id}</option>;
                  })}
                </select>
                <div className="invalid-feedback">{formik.errors.instructor}</div>
              </div>
            </div>
          )}

          {/* Odometer */}
          <div className="row">
            {showOdometer && (
              <div className="col-md-12 mb-3">
                <label>Odometer (km)</label>
                <input type="text" name="odometer" className={`form-control ${showInvalid("odometer")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.odometer} placeholder="Enter odometer reading" />
                <div className="invalid-feedback">{formik.errors.odometer}</div>
              </div>
            )}
          </div>

          {/* Amount + Notes */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Amount <span style={{ color: "red" }}>*</span></label>
              <input type="text" name="amount" className={`form-control ${showInvalid("amount")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.amount} placeholder="Enter amount" />
              <div className="invalid-feedback">{formik.errors.amount}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label>Notes</label>
              <input type="text" name="notes" className={`form-control ${showInvalid("notes")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.notes} placeholder="Additional notes or remarks" />
              <div className="invalid-feedback">{formik.errors.notes}</div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-secondary me-2" onClick={() => { formik.resetForm(); hideModal(); }}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={explicitSubmit} disabled={formik.isSubmitting}>
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
}
