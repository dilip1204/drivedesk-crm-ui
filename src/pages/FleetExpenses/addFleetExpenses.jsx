import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const VEHICLE_TYPES = ["Car", "Bus", "Truck", "Bike", "Other"];
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

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AddFleetExpenses({
  showModal,
  hideModal,
  id = null,
  isEdit = false,
  onStudentAdded = () => {},
  studentData = () => {},
  plans = [],
  instructors = [],
}) {
  const initialValues = React.useMemo(() => ({
    id: id && id.id ? id.id : uid(),
    date: id && id.date ? id.date : "",
    vehicle: id && id.vehicle ? id.vehicle : "",
    vehicleType: id && id.vehicleType ? id.vehicleType : "",
    odometer: id && (id.odometer || id.odometer === 0) ? String(id.odometer) : "",
    category: id && id.category ? id.category : "",
    vendor: id && id.vendor ? id.vendor : "",
    liters: id && (id.liters || id.liters === 0) ? String(id.liters) : "",
    pricePerLiter:
      id && (id.pricePerLiter || id.pricePerLiter === 0)
        ? String(id.pricePerLiter)
        : "",
    fullTank: id && !!id.fullTank,
    amount: id && (id.amount || id.amount === 0) ? String(id.amount) : "",
    notes: id && id.notes ? id.notes : "",
  }), [id]);

  const validationSchema = Yup.object().shape({
    date: Yup.string().required("Date is required"),
    vehicle: Yup.string().required("Vehicle is required"),
    vehicleType: Yup.string().oneOf([...VEHICLE_TYPES, ""], "Invalid vehicle type"),
    odometer: Yup.number()
      .typeError("Odometer must be a number")
      .min(0, "Odometer cannot be negative")
      .nullable(),
    category: Yup.string().oneOf([...CATEGORIES, ""], "Invalid category"),
    vendor: Yup.string().max(100, "Vendor name too long"),
    liters: Yup.number()
      .typeError("Liters must be a number")
      .min(0, "Liters cannot be negative")
      .nullable(),
    pricePerLiter: Yup.number()
      .typeError("Price per liter must be a number")
      .min(0, "Price per liter cannot be negative")
      .nullable(),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .min(0, "Amount cannot be negative")
      .nullable(),
    notes: Yup.string().max(500, "Notes too long"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      const payload = {
        ...values,
        odometer: values.odometer === "" ? null : Number(values.odometer),
        liters: values.liters === "" ? null : Number(values.liters),
        pricePerLiter: values.pricePerLiter === "" ? null : Number(values.pricePerLiter),
        amount: values.amount === "" ? null : Number(values.amount),
      };

      try {
        onStudentAdded(payload);
        if (typeof studentData === "function") studentData(payload);
        setSubmitting(false);
        hideModal();
      } catch (err) {
        console.error(err);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const litersNum = parseFloat(formik.values.liters);
    const priceNum = parseFloat(formik.values.pricePerLiter);

    if (Number.isFinite(litersNum) && Number.isFinite(priceNum)) {
      const computed = +(litersNum * priceNum).toFixed(2);
      const current = parseFloat(formik.values.amount);
      if (isNaN(current) || Math.abs(current - computed) > 0.0001) {
        formik.setFieldValue("amount", String(computed), false);
      }
    }
  }, [formik.values.liters, formik.values.pricePerLiter]);

  const showInvalid = (name) =>
    formik.touched[name] && formik.errors[name] ? "is-invalid" : "";

  return (
    <Modal
      show={!!showModal}
      onHide={hideModal}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Update Expense" : "Add Expense"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form noValidate onSubmit={formik.handleSubmit}>
          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label>
                Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                name="date"
                className={`form-control ${showInvalid("date")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.date}
                placeholder="Select expense date"
              />
              {formik.touched.date && formik.errors.date ? (
                <div className="invalid-feedback">{formik.errors.date}</div>
              ) : null}
            </div>

            <div className="col-md-6 form-group mb-3">
              <label>
                Vehicle <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="vehicle"
                className={`form-control ${showInvalid("vehicle")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.vehicle}
                placeholder="Enter vehicle name or number"
              />
              {formik.touched.vehicle && formik.errors.vehicle ? (
                <div className="invalid-feedback">{formik.errors.vehicle}</div>
              ) : null}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label>Vehicle Type</label>
              <select
                name="vehicleType"
                className={`form-control ${showInvalid("vehicleType")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.vehicleType}
              >
                <option value="">Select vehicle type</option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {formik.touched.vehicleType && formik.errors.vehicleType ? (
                <div className="invalid-feedback">{formik.errors.vehicleType}</div>
              ) : null}
            </div>

            <div className="col-md-6 form-group mb-3">
              <label>Odometer (km)</label>
              <input
                type="text"
                name="odometer"
                className={`form-control ${showInvalid("odometer")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.odometer}
                placeholder="Enter odometer reading"
              />
              {formik.touched.odometer && formik.errors.odometer ? (
                <div className="invalid-feedback">{formik.errors.odometer}</div>
              ) : null}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label>Category</label>
              <select
                name="category"
                className={`form-control ${showInvalid("category")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.category}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {formik.touched.category && formik.errors.category ? (
                <div className="invalid-feedback">{formik.errors.category}</div>
              ) : null}
            </div>

            <div className="col-md-6 form-group mb-3">
              <label>Vendor</label>
              <input
                type="text"
                name="vendor"
                className={`form-control ${showInvalid("vendor")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.vendor}
                placeholder="Enter vendor name"
              />
              {formik.touched.vendor && formik.errors.vendor ? (
                <div className="invalid-feedback">{formik.errors.vendor}</div>
              ) : null}
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 form-group mb-3">
              <label>Liters</label>
              <input
                type="text"
                name="liters"
                className={`form-control ${showInvalid("liters")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.liters}
                placeholder="Enter liters filled"
              />
              {formik.touched.liters && formik.errors.liters ? (
                <div className="invalid-feedback">{formik.errors.liters}</div>
              ) : null}
            </div>

            <div className="col-md-4 form-group mb-3">
              <label>Price / Liter</label>
              <input
                type="text"
                name="pricePerLiter"
                className={`form-control ${showInvalid("pricePerLiter")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.pricePerLiter}
                placeholder="Enter price per liter"
              />
              {formik.touched.pricePerLiter && formik.errors.pricePerLiter ? (
                <div className="invalid-feedback">{formik.errors.pricePerLiter}</div>
              ) : null}
            </div>

            <div className="col-md-4 form-group mb-3 d-flex align-items-center">
              <div>
                <label style={{ display: "block" }}>Full tank?</label>
                <input
                  type="checkbox"
                  name="fullTank"
                  onChange={(e) => formik.setFieldValue("fullTank", e.target.checked)}
                  checked={formik.values.fullTank}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label>Amount</label>
              <input
                type="text"
                name="amount"
                className={`form-control ${showInvalid("amount")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.amount}
                placeholder="Auto-calculated or enter manually"
              />
              {formik.touched.amount && formik.errors.amount ? (
                <div className="invalid-feedback">{formik.errors.amount}</div>
              ) : null}
            </div>

            <div className="col-md-6 form-group mb-3">
              <label>Notes</label>
              <input
                type="text"
                name="notes"
                className={`form-control ${showInvalid("notes")}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.notes}
                placeholder="Additional notes or remarks"
              />
              {formik.touched.notes && formik.errors.notes ? (
                <div className="invalid-feedback">{formik.errors.notes}</div>
              ) : null}
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="btn btn-secondary me-2" onClick={hideModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
