import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addEnquiries, updateEnquiries } from "../../store/Enquiries/actions"; // Update path as needed
import { IoClose } from "react-icons/io5";

export default function AddEnquiries({ showModal, hideModal, id, isEdit, onEnquiriesAdded, enquiriesData }) {
  const dispatch = useDispatch();

  // Utility to format date for datetime-local input
const formatDateTimeLocal = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


  const initialValues = {
  name: id?.name || '',
  mobile_number: id?.mobile_number || '',
  dob: id?.dob || '',
  referred_by: id?.referred_by || '',
  email: id?.email || '',
  course_interest: id?.course_interest || '',
  enquiry_date: id?.enquiry_date ? formatDateTimeLocal(id.enquiry_date) : formatDateTimeLocal(new Date()),
  follow_up_status: id?.follow_up_status || 'pending',
  remarks: id?.remarks || ''
};



  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    mobile_number: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    dob: Yup.date().required("Date of birth is required"),
    referred_by: Yup.string().required("Referred by is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    course_interest: Yup.string().required("Course interest is required"),
    enquiry_date: Yup.date().required("Enquiry date is required"),
    follow_up_status: Yup.string().required("Follow-up status is required"),
    remarks: Yup.string().required("Remarks are required")
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      let payload;
      if (isEdit) {
    // Only send status for update
    payload = {
      id: id?.id, // or use id._id or whatever key uniquely identifies the enquiry
      status: values.follow_up_status
    };
  } else {
       payload = { ...values };
  }
      const action = isEdit ? updateEnquiries : addEnquiries;

      dispatch(action(payload, (response) => {
        if (response?.isError === false && response?.response?.message) {
          formik.resetForm();
         // if (typeof onSaved === 'function') {
            onEnquiriesAdded();
         // }
          enquiriesData(response, isEdit);
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
        <Modal.Title>{isEdit ? 'Update Enquiry' : 'Add Enquiry'}</Modal.Title>
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
              ['mobile_number', 'text'],
              ['dob', 'date'],
              ['referred_by', 'text'],
              ['email', 'email'],
              ['course_interest', 'text'],
              ['enquiry_date', 'datetime-local'],
              ['remarks', 'text']
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
                <label>Follow Up Status <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="follow_up_status"
                  className="form-control"
                  value={formik.values.follow_up_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="pending">Pending</option>
                  <option value="followed">Followed</option>
                  <option value="closed">Closed</option>
                </select>
                {formik.touched.follow_up_status && formik.errors.follow_up_status && (
                  <div className="text-danger">{formik.errors.follow_up_status}</div>
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
