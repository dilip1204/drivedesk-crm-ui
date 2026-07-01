import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addInstructor, updateInstructor } from "../../store/instructors/actions";
import { IoClose } from "react-icons/io5";

const WEEK_DAYS = [
  { label: "Monday", value: "MON" },
  { label: "Tuesday", value: "TUE" },
  { label: "Wednesday", value: "WED" },
  { label: "Thursday", value: "THU" },
  { label: "Friday", value: "FRI" },
  { label: "Saturday", value: "SAT" },
  { label: "Sunday", value: "SUN" },
];

const DEFAULT_WORKING_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Instructors({ showModal, hideModal, id, isEdit, onSaved, instructorsData }) {
  const dispatch = useDispatch();

  const initialValues = {
    name: id?.name || '',
    email: id?.email || '',
    password: '', // Do not prefill passwords
    mobile_number: id?.mobile_number || '',
    available_from: id?.available_from || '',
    available_to: id?.available_to || '',
    working_days: Array.isArray(id?.working_days)
      ? id.working_days
      : isEdit
        ? []
        : DEFAULT_WORKING_DAYS,
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
      const payload = {
        ...values,
        working_days: values.working_days || [],
      };

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

  const handleWorkingDayChange = (day) => {
    const selectedDays = formik.values.working_days || [];
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    formik.setFieldValue('working_days', nextDays);
  };

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

            <div className="col-md-12">
              <div className="form-group">
                <label>Working Days</label>
                <div className="border rounded p-3">
                  <div className="d-flex flex-wrap">
                    {WEEK_DAYS.map(({ label, value }) => (
                      <div
                        key={value}
                        className="d-flex align-items-center mb-2 mr-4"
                        style={{ minWidth: '140px' }}
                      >
                          <input
                            className="mr-2"
                            type="checkbox"
                            name="working_days"
                            value={value}
                            id={`working-day-${value}`}
                            checked={(formik.values.working_days || []).includes(value)}
                            onChange={() => handleWorkingDayChange(value)}
                            style={{ cursor: 'pointer' }}
                          />
                          <label
                            htmlFor={`working-day-${value}`}
                            className="mb-0"
                            style={{ cursor: 'pointer' }}
                          >
                            {label}
                          </label>
                      </div>
                    ))}
                  </div>
                  <small className="text-muted">Select only the days this instructor is available to work.</small>
                </div>
              </div>
            </div>

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
