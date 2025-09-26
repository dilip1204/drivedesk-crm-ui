import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { RescheduleTrainingSession } from "../../store/trainingSession/actions";

// Helper to get local YYYY-MM-DD (avoids timezone issues)
const toLocalISODate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function RescheduleSession({
  showModal,
  hideModal,
  id,
  isEdit,
  onStudentAdded,
  studentData,
}) {
  const dispatch = useDispatch();

  const today = new Date();
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toLocalISODate(tomorrowDate); // YYYY-MM-DD

  const initialValues = {
    action: "postpone",
    new_date: tomorrow, // default to tomorrow
  };

  const validationSchema = Yup.object({
    new_date: Yup.date()
      .required("New date is required")
      .min(tomorrow, "Please pick a future date (tomorrow or later)"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values, { setSubmitting, setErrors }) => {
      const updatedFields = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValues[key]) {
          updatedFields[key] = values[key];
        }
      });

      // if (Object.keys(updatedFields).length === 0) {
      //   alert("No changes detected.");
      //   setSubmitting(false);
      //   return;
      // }

      dispatch(
        RescheduleTrainingSession({ session_id: id?._id, ...values }, (res) => {
          setSubmitting(false);
          if (res?.isError) {
            const errors = res?.data?.detail || res?.detail || res;
            if (Array.isArray(errors)) {
              const errorMap = {};
              errors.forEach((e) => {
                const field = e?.loc?.[1] || "";
                if (field) errorMap[field] = e?.msg || "Invalid input";
              });
              setErrors(errorMap);
            } else {
              alert("Reschedule failed. Please check your input.");
            }
          } else {
            if (typeof onStudentAdded === "function") {
              onStudentAdded();
              studentData(res, isEdit);
            }
            formik.resetForm();
            hideModal();
          }
        })
      );
    },
  });

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
        <Modal.Title>{isEdit ? "Reschedule Session" : "Add Session"}</Modal.Title>
        {/* <IoClose
          onClick={() => {
            formik.resetForm();
            hideModal();
          }}
          style={{ cursor: "pointer", fontSize: "1.5rem", marginLeft: "auto", color: "#6c757d" }}
          title="Close"
        /> */}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>
                  New Date <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  name="new_date"
                  min={tomorrow}  // today disabled; only future allowed
                  className={`form-control ${formik.touched.new_date && formik.errors.new_date ? "is-invalid" : ""}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.new_date}
                />
                {formik.touched.new_date && formik.errors.new_date && (
                  <div className="text-danger">{formik.errors.new_date}</div>
                )}
              </div>
            </div>
          </div>

          <Modal.Footer>
            <Button variant="secondary" onClick={hideModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formik.isSubmitting}>
              {isEdit ? "Reschedule" : "Submit"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
