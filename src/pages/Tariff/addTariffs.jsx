import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addTariff, updateTariff } from "../../store/tariff/actions"; // <-- Use correct actions
import { IoClose } from "react-icons/io5"; // You can use other icons too
import "./addTariffs.css";

export default function AddTariffs({
  showModal,
  hideModal,
  id,
  isEdit,
  onTariffSaved,
  tariffData,
}) {
  const dispatch = useDispatch();

  const initialValues = {
    plan_name: id?.plan_name || "",
    amount: id?.amount,
    training_days: id?.training_days,
    reference_fee: id?.reference_fee ?? 0,
    description: id?.description || "",
    remarks: id?.remarks || "",
    category: id?.category || "",
  };

  const validationSchema = Yup.object({
    plan_name: Yup.string().required("Plan name is required"),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Amount is required"),
    training_days: Yup.number()
      .typeError("Training days must be a number")
      .required("Training days are required"),
    // reference_fee: Yup.number()
    //   .typeError("Reference fee must be a number")
    //   .required("Reference fee is required"),
    // description: Yup.string().required("Description is required"),
    // remarks: Yup.string().required("Remarks are required"),
    // category: Yup.string().required("Category is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const payload = { ...values, created_at: new Date().toISOString() };
      const action = isEdit ? updateTariff : addTariff;
      dispatch(
        action(payload, (response) => {
          // Handle API-level success
          if (response?.isError === false && response?.response?.message) {
            formik.resetForm();
            if (typeof onTariffSaved === 'function') {
              onTariffSaved();
            }
            tariffData(response, isEdit);
            hideModal();
          }

          // Handle possible validation errors array (e.g. FastAPI or DRF format)
          else if (Array.isArray(response?.detail || response?.data?.detail)) {
            const errorList = response.detail || response.data.detail;
            let firstErrorHandled = false;

            errorList.forEach((err) => {
              const field = err?.loc?.[1];
              const msg = err?.msg || err?.message || "Invalid input";
              if (field && formik.values.hasOwnProperty(field)) {
                formik.setFieldTouched(field, true, false);
                formik.setFieldError(field, msg);

                if (!firstErrorHandled) {
                  const el = document.getElementsByName(field)?.[0];
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.focus();
                  }
                  firstErrorHandled = true;
                }
              }
            });
          }
        })
      );
    },
  });

  const fields = Object.keys(initialValues);
  const fieldPairs = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    formik.setFieldValue(name, numericValue);
  };

  return (
    <Modal
      show={showModal}
      onHide={hideModal}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
      dialogClassName="tariff-form-dialog"
    >
      <Modal.Header className="tariff-form-header">
        <Modal.Title>{isEdit ? "Update Tariff" : "Add Tariff"}</Modal.Title>
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
      <Modal.Body className="tariff-form-body">
        <form onSubmit={formik.handleSubmit} className="tariff-form">
          {fieldPairs.map((pair, rowIndex) => (
            <div className="row tariff-form-row" key={rowIndex}>
              {pair.map((field) => (
                <div className="col-md-6" key={field}>
                  <div className="form-group tariff-form-group">
                    <label>
                      {field
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      {["plan_name", "amount", "training_days"].includes(
                        field
                      ) && <span style={{ color: "red" }}>*</span>}
                    </label>
                    <input
                      type={
                        ["amount", "training_days", "reference_fee"].includes(
                          field
                        )
                          ? "number"
                          : "text"
                      }
                      name={field}
                      className={`form-control${
                        formik.touched[field] && formik.errors[field]
                          ? " is-invalid"
                          : formik.touched[field] && !formik.errors[field]
                          ? " is-valid"
                          : ""
                      }`}
                      onChange={
                        ["amount", "training_days", "reference_fee"].includes(
                          field
                        )
                          ? handleNumericInput
                          : formik.handleChange
                      }
                      onBlur={formik.handleBlur}
                      value={formik.values[field]}
                    />
                    {formik.touched[field] && formik.errors[field] && (
                      <div className="text-danger">{formik.errors[field]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <Modal.Footer className="tariff-form-footer">
            <Button
              variant="secondary"
              onClick={() => {
                formik.resetForm(); // Reset form to initial values
                hideModal(); // Close the modal
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? "Update" : "Add"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
