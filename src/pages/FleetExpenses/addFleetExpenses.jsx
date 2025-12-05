import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { addExpenses, updateExpenses } from "../../store/expenses/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";

// Vehicle types (includes Stationery & Salary)
const VEHICLE_TYPES = ["Car", "Bus", "Truck", "Bike", "Other", "Stationery", "Salary"];
const CATEGORIES = [
  "Fuel",
  "Service",
  "Repairs",

  "Insurance",
  "Tax",
  "Toll",
  "Parking",
  "Wash",
  "Accessories",
  "Other",
];
const ODOMETER_CATEGORIES = ["Fuel", "Service", "Repairs", "Wash", "Toll", "Parking"];

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
    const litersVal = expense?.liters ?? "";
    const pricePerLiterVal = expense?.pricePerLiter ?? "";
    const fullTankRaw = expense?.full_tank ?? expense?.fullTank ?? "";
    const fullTankBool = fullTankRaw === true || String(fullTankRaw).toLowerCase() === "yes";

    const vehicleTypeVal =
      expense?.vehicleType ?? expense?.vehicle_type ?? expense?.vehicle_type_name ?? expense?.type ?? "";

    return {
      id: expense?.id || uid(),
      date: toInputDate(expense?.date ?? expense?.created_at ?? ""),
      vehicle: expense?.vehicle ?? expense?.vehicle_id ?? "",
      vehicleType: vehicleTypeVal || "",
      odometer: odometerVal?.toString() || "",
      category: expense?.category || "",
      vendor: expense?.vendor || "",
      liters: litersVal?.toString() || "",
      pricePerLiter: pricePerLiterVal?.toString() || "",
      fullTank: !!fullTankBool,
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
      const vt = normalize(vehicleType);
      if (vt === "stationery" || vt === "salary") return schema.notRequired().nullable();
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
      is: (v) => normalize(v) !== "salary",
      then: (s) => s.required("Expense category is required").oneOf(CATEGORIES, "Invalid category"),
      otherwise: (s) => s.nullable(),
    }),
    vendor: Yup.string().when("vehicleType", {
      is: (v) => normalize(v) !== "salary",
      then: (s) => s.required("Vendor name is required").max(100, "Vendor name too long"),
      otherwise: (s) => s.nullable(),
    }),
    liters: Yup.number().typeError("Liters must be a number").min(0, "Liters cannot be negative").nullable(),
    pricePerLiter: Yup.number().typeError("Price per liter must be a number").min(0, "Price per liter cannot be negative").nullable(),
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
        category: values.category || "",
        vehicle_id: values.vehicle_id || values.vehicle || "",
        vehicle: values.vehicle || values.vehicle_id || "",
        vehicleType: values.vehicleType || "",
        vehicle_type: values.vehicleType || "",
        amount: values.amount === "" ? 0 : Number(values.amount),
        date: values.date || new Date().toISOString().slice(0, 10),
        notes: values.notes || "",
        odo_meter: values.odometer || "",
        stationary: values.stationary || "",
        full_tank: values.fullTank ? "Yes" : "No",
        vendor: values.vendor || "",
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
  

  // Auto-calc fuel amount
  useEffect(() => {
    if (formik.values.category !== "Fuel") return;
    const litersNum = parseFloat(formik.values.liters);
    const priceNum = parseFloat(formik.values.pricePerLiter);
    if (Number.isFinite(litersNum) && Number.isFinite(priceNum)) {
      const computed = +(litersNum * priceNum).toFixed(2);
      const current = parseFloat(formik.values.amount);
      if (isNaN(current) || Math.abs(current - computed) > 0.0001) {
        formik.setFieldValue("amount", String(computed), false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.liters, formik.values.pricePerLiter, formik.values.category]);

  // Clear irrelevant fields when type/category change
  useEffect(() => {
    const vt = normalize(formik.values.vehicleType);
    const category = formik.values.category;
    const hideFuelFields = vt === "other" || vt === "stationery" || category !== "Fuel";
    const hideOdometer = vt === "other" || vt === "stationery" || !ODOMETER_CATEGORIES.includes(category);

    if (hideFuelFields) {
      if (formik.values.liters !== "") formik.setFieldValue("liters", "");
      if (formik.values.pricePerLiter !== "") formik.setFieldValue("pricePerLiter", "");
      if (formik.values.fullTank) formik.setFieldValue("fullTank", false);
    }
    if (hideOdometer) {
      if (formik.values.odometer !== "") formik.setFieldValue("odometer", "");
    }

    // When not Salary, clear instructor
    if (vt !== "salary" && formik.values.instructor !== "") {
      formik.setFieldValue("instructor", "");
    }

    // When Salary selected, clear vehicle/category/vendor and fuel/odo fields
    if (vt === "salary") {
      if (formik.values.vehicle !== "") formik.setFieldValue("vehicle", "");
      if (formik.values.category !== "") formik.setFieldValue("category", "");
      if (formik.values.vendor !== "") formik.setFieldValue("vendor", "");
      if (formik.values.liters !== "") formik.setFieldValue("liters", "");
      if (formik.values.pricePerLiter !== "") formik.setFieldValue("pricePerLiter", "");
      if (formik.values.fullTank) formik.setFieldValue("fullTank", false);
      if (formik.values.odometer !== "") formik.setFieldValue("odometer", "");
    }

    if (vt === "stationery" && formik.values.vehicle !== "") formik.setFieldValue("vehicle", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.vehicleType, formik.values.category]);

  useEffect(() => {
    if (showModal) formik.resetForm({ values: initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, initialValues]);

  // hide vehicle for Stationery AND for Salary
  const hideVehicleField =
    normalize(formik.values.vehicleType) === "stationery" ||
    normalize(formik.values.vehicleType) === "salary";

  // helper flag used in several places
  const isSalary = normalize(formik.values.vehicleType) === "salary";

  const showFuelFields =
    normalize(formik.values.vehicleType) !== "other" &&
    normalize(formik.values.vehicleType) !== "stationery" &&
    formik.values.category === "Fuel";
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
        <Modal.Title>{isEdit ? "Update Expense" : "Add Expense"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form noValidate onSubmit={(e) => { e.preventDefault(); explicitSubmit(); }}>
          {/* Date + VehicleType */}
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
          </div>

          {/* Instructor (only for Salary) */}
          {showInstructor && (
            <div className="row">
              <div className="col-md-6 mb-3">
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

              <div className="col-md-6 mb-3">
                {/* optional extra column (keeps your layout consistent) */}
              </div>
            </div>
          )}

          {!hideVehicleField && (
            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Vehicle {normalize(formik.values.vehicleType) !== "stationery" && <span style={{ color: "red" }}>*</span>}</label>
                <input type="text" name="vehicle" className={`form-control ${showInvalid("vehicle")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.vehicle} placeholder="Enter vehicle name or number" />
                <div className="invalid-feedback">{formik.errors.vehicle}</div>
              </div>
            </div>
          )}

          {/* Category + Vendor (hidden for Salary) */}
          {!isSalary && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Category <span style={{ color: "red" }}>*</span></label>
                <select name="category" className={`form-control ${showInvalid("category")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.category}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="invalid-feedback">{formik.errors.category}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label>Vendor <span style={{ color: "red" }}>*</span></label>
                <input type="text" name="vendor" className={`form-control ${showInvalid("vendor")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.vendor} placeholder="Enter vendor name" />
                <div className="invalid-feedback">{formik.errors.vendor}</div>
              </div>
            </div>
          )}

          {/* Odometer */}
          <div className="row">
            {showOdometer && (
              <div className="col-md-6 mb-3">
                <label>Odometer (km)</label>
                <input type="text" name="odometer" className={`form-control ${showInvalid("odometer")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.odometer} placeholder="Enter odometer reading" />
                <div className="invalid-feedback">{formik.errors.odometer}</div>
              </div>
            )}
          </div>

          {/* Fuel fields */}
          {showFuelFields && (
            <div className="row">
              <div className="col-md-4 mb-3">
                <label>Liters</label>
                <input type="text" name="liters" className={`form-control ${showInvalid("liters")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.liters} placeholder="Enter liters filled" />
                <div className="invalid-feedback">{formik.errors.liters}</div>
              </div>
              <div className="col-md-4 mb-3">
                <label>Price / Liter</label>
                <input type="text" name="pricePerLiter" className={`form-control ${showInvalid("pricePerLiter")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.pricePerLiter} placeholder="Enter price per liter" />
                <div className="invalid-feedback">{formik.errors.pricePerLiter}</div>
              </div>
              <div className="col-md-4 mb-3 d-flex align-items-center">
                <div>
                  <label style={{ display: "block" }}>Full tank?</label>
                  <input type="checkbox" name="fullTank" onChange={(e) => formik.setFieldValue("fullTank", e.target.checked)} checked={formik.values.fullTank} />
                </div>
              </div>
            </div>
          )}

          {/* Amount + Notes */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Amount <span style={{ color: "red" }}>*</span></label>
              <input type="text" name="amount" className={`form-control ${showInvalid("amount")}`} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.amount} placeholder="Auto-calculated or enter manually" />
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
      </Modal.Body>
    </Modal>
  );
}
