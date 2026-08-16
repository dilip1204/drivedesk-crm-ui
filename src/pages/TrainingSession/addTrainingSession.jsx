import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { updateTrainingSession } from "../../store/trainingSession/actions";
import "./TrainingSessionModals.css";


export default function AddTrainingSession({
  showModal,
  hideModal,
  id,
  isEdit,
  onStudentAdded,
  studentData
}) {
  const dispatch = useDispatch();

  const initialValues = {
    start_time: id?.start_time || '',
    num_classes: id?.num_classes || 1,
    remarks: id?.remarks || '',
    status: id?.status || 'Scheduled',
  };

  const validationSchema = Yup.object({
    start_time: Yup.string()
      .required("Start time is required")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
    num_classes: Yup.number()
      .required("Number of classes is required")
      .min(1, "Must be at least 1"),
    remarks: Yup.string().nullable().max(255, "Max 255 characters"),
    status: Yup.string().required("Status is required"),
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

      // Avoid sending empty PATCH
      if (Object.keys(updatedFields).length === 0) {
        alert("No changes detected.");
        setSubmitting(false);
        return;
      }

      dispatch(updateTrainingSession({ session_id: id?._id, ...values }, (res) => {

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
            alert("Update failed. Please check your input.");
          }
        } else {
          if (typeof onStudentAdded === "function") { 
            onStudentAdded();
            studentData(res, isEdit);
          }
          formik.resetForm();
          hideModal();
        }
      }));
    },
  });

  const fields = ["start_time", "num_classes", "remarks", "status"];

  return (
    <Modal
      show={showModal}
      onHide={hideModal}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
      dialogClassName="session-form-dialog"
    >
      <Modal.Header className="session-form-header">
        <Modal.Title>{isEdit ? "Update Session" : "Add Session"}</Modal.Title>
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
      <Modal.Body className="session-form-body">
        <form onSubmit={formik.handleSubmit} className="session-form">
          <div className="row session-form-row">
            {fields.map((field) => (
              <div className="col-md-6" key={field}>
                <div className="form-group session-form-group">
                  <label>
                    {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    <span style={{ color: "red" }}>*</span>
                  </label>

                  {field === "remarks" ? (
                    <textarea
                      name={field}
                      className={`form-control ${formik.touched[field] && formik.errors[field] ? "is-invalid" : ""}`}
                      rows={2}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values[field]}
                    />
                  ) : field === "status" ? (
                    <select
                      name={field}
                      className={`form-control ${formik.touched[field] && formik.errors[field] ? "is-invalid" : ""}`}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values[field]}
                    >
                      <option value="">Select Status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      {/* <option value="Missed">Missed</option>
                      <option value="Cancelled">Cancelled</option> */}
                    </select>
                  ) : (
                    <input
                      type={field.includes("time") ? "time" : "number"}
                      name={field}
                      className={`form-control ${formik.touched[field] && formik.errors[field] ? "is-invalid" : ""}`}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values[field]}
                    />
                  )}

                  {formik.touched[field] && formik.errors[field] && (
                    <div className="text-danger">{formik.errors[field]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Modal.Footer className="session-form-footer">
            <Button variant="secondary" onClick={hideModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formik.isSubmitting}>
              {isEdit ? "Update" : "Submit"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
