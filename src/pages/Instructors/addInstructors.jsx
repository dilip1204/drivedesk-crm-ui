import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addInstructor, updateInstructor } from "../../store/instructors/actions";
import { IoClose } from "react-icons/io5";

export default function Instructors({ showModal, hideModal, id, isEdit, onSaved, instructorsData }) {
  const dispatch = useDispatch();

  const initialValues = {
    name: id?.name || '',
    email: id?.email || '',
    password: '', // Do not prefill passwords
    mobile_number: id?.mobile_number || '',
    available_from: id?.available_from || '',
    available_to: id?.available_to || '',
    is_active: id?.is_active ?? true,
    role: id?.role || 'instructor'
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: isEdit
      ? Yup.string()
      : Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    mobile_number: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    available_from: Yup.string().required("Available from is required"),
    available_to: Yup.string().required("Available to is required"),
    role: Yup.string().required("Role is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => { 
      const payload = { ...values };

      const action = isEdit ? updateInstructor : addInstructor;

      dispatch(action(payload, (response) => {
        if (!response?.isError && response?.response?.message) {
          formik.resetForm();
          if (typeof onSaved === 'function') { 
            onSaved();
          }
          instructorsData(response, isEdit);
          hideModal();
        } else if (Array.isArray(response?.detail || response?.data?.detail)) {
          const errors = response.detail || response.data.detail;
          errors.forEach((err) => {
            const field = err?.loc?.[1];
            const msg = err?.msg || err?.message || 'Invalid input';
            if (field && formik.values.hasOwnProperty(field)) {
              formik.setFieldError(field, msg);
            }
          });
        }
      }));
    }
  });

  return (
    <Modal show={showModal} onHide={hideModal} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header>
        <Modal.Title>{isEdit ? 'Update Instructor' : 'Add Instructor'}</Modal.Title>
        <IoClose
          onClick={() => {
            formik.resetForm();
            hideModal();
          }}
          style={{ cursor: 'pointer', fontSize: '1.5rem', marginLeft: 'auto', color: '#6c757d' }}
          title="Close"
        />
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          <div className="row">
            {[
              ['name', 'text'],
              ['email', 'email'],
              ['password', 'password'],
              ['mobile_number', 'text'],
              ['available_from', 'time'],
              ['available_to', 'time']
            ].map(([field, type]) => (
              <div className="col-md-6" key={field}>
                <div className="form-group">
                  <label>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type={type}
                    name={field}
                    className={`form-control${formik.touched[field] && formik.errors[field] ? ' is-invalid' : ''}`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values[field]}
                  />
                  {formik.touched[field] && formik.errors[field] && (
                    <div className="text-danger">{formik.errors[field]}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="col-md-6">
              <div className="form-group">
                <label>Status <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="is_active"
                  className="form-control"
                  value={formik.values.is_active}
                  onChange={(e) => formik.setFieldValue('is_active', e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Role <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="role"
                  className={`form-control${formik.touched.role && formik.errors.role ? ' is-invalid' : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.role}
                  readOnly
                />
                {formik.touched.role && formik.errors.role && (
                  <div className="text-danger">{formik.errors.role}</div>
                )}
              </div>
            </div>
          </div>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => { formik.resetForm(); hideModal(); }}>Cancel</Button>
            <Button type="submit" variant="primary">{isEdit ? 'Update' : 'Add'}</Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
