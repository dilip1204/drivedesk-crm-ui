import React, { useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
//import { toast } from "react-toastify";
import { addStudent, updateStudent } from "../../store/addStudent/actions";
import {
    toaster,
    successNotification,
    errorNotification
} from "../../shared/commonComponent/toaster/toaster"

export default function AddStudents({ showModal, hideModal, id, isEdit, onStudentAdded }) {
  const dispatch = useDispatch();
  const setErrorField = useSelector((state) => state.studentUpdate.addStudenttError);
  console.info('id........', id?.name)
  const initialValues = {
    name: id?.name || '',
    dob: id?.dob || '',
    mobile_number: id?.mobile_number || '',
    application_number: id?.application_number || '',
    email: id?.email || '',
    aadhar_number: id?.aadhar_number || '',
    plan: id?.plan || '',
    initial_payment_method: id?.initial_payment_method || '',
    paid_amount: id?.paid_amount || 0,
    total_amount: id?.total_amount || 0,
    balance: id?.balance || 0,
    full_payment_status: id?.full_payment_status || 'Pending',
  };

  const validationSchema = Yup.object(
    Object.keys(initialValues).reduce((schema, key) => {
      if (key === 'email') {
        schema[key] = Yup.string()
          .required(`${key.replace(/_/g, ' ')} is required`)
          .email('Invalid email format');
      } else if (['paid_amount', 'total_amount', 'balance'].includes(key)) {
        schema[key] = Yup.number()
          .typeError(`${key.replace(/_/g, ' ')} must be a number`)
          .required(`${key.replace(/_/g, ' ')} is required`);
      } else {
        schema[key] = Yup.string().required(`${key.replace(/_/g, ' ')} is required`);
      }
      return schema;
    }, {})
  ).test(
    'paid-vs-total',
    'Paid amount cannot be greater than total amount',
    function (values) {
      const paid = parseFloat(values.paid_amount);
      const total = parseFloat(values.total_amount);
      return !isNaN(paid) && !isNaN(total) ? paid <= total : true;
    }
  );

  const formik = useFormik({
    enableReinitialize: true, //important to bind new props to form
    validateOnChange: true,
    validateOnBlur: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const firstErrorField = Object.keys(formik.errors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementsByName(firstErrorField)[0];
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
        return;
      }

      const payload = {
        studentData: {
          ...values,
          status: "Process Started",
        },
      };
      const action = isEdit ? updateStudent : addStudent;
      dispatch(action(payload, (response) => {
        const errorList = response?.data?.detail || response?.detail || response;

        if (Array.isArray(errorList)) {
          let firstErrorHandled = false;

          errorList.forEach((err) => {
            const field = err?.loc?.[1];
            const msg = err?.msg || err?.message || 'Invalid input';

            if (field && formik.values.hasOwnProperty(field)) {
              formik.setFieldTouched(field, true, false);
              formik.setFieldError(field, msg);

              if (!firstErrorHandled) {
                const el = document.getElementsByName(field)?.[0];
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.focus();
                }
                firstErrorHandled = true;
              }
            } else {
              //toast().error(msg);
            }
          });

          return;
        }

        // toaster(
        //     'Add Student',
        //     'Student added successfully...!',
        //     successNotification,
        // )
        formik.resetForm();
        if (typeof onStudentAdded === 'function') {
          onStudentAdded(); // trigger refresh in parent
        }
        hideModal();
      }));
    },
  });

  useEffect(() => {
    const paid = parseFloat(formik.values.paid_amount);
    const total = parseFloat(formik.values.total_amount);
    if (!isNaN(paid) && !isNaN(total)) {
      formik.setFieldValue('balance', total - paid);
    }
  }, [formik.values.paid_amount, formik.values.total_amount]);

  const fields = Object.keys(initialValues);
  const fieldPairs = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    formik.setFieldValue(name, numericValue);
  };

  const showBalanceWarning = parseFloat(formik.values.balance) < 0;

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
        <Modal.Title>{isEdit ? 'Update Student' : 'Add Student'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          {showBalanceWarning && (
            <Alert variant="warning">
              Warning: Balance is negative. Please verify paid and total amounts.
            </Alert>
          )}
          {fieldPairs.map((pair, rowIndex) => (
            <div className="row" key={rowIndex}>
              {pair.map((field) => (
                <div className="col-md-6" key={field}>
                  <div className="form-group">
                    <label>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    {['full_payment_status', 'initial_payment_method', 'plan'].includes(field) ? (
                      <select
                        name={field}
                        className={`form-control${formik.touched[field] && formik.errors[field] ? ' is-invalid' : formik.touched[field] && !formik.errors[field] ? ' is-valid' : ''}`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field]}
                      >
                        <option value="">Select {field.replace(/_/g, ' ')}</option>
                        {field === 'full_payment_status' &&
                          ["Pending", "Completed", "Failed"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        {field === 'initial_payment_method' &&
                          ["cash", "upi"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        {field === 'plan' &&
                          ["Basic", "Advanced", "Premium"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type={
                          field === 'dob' || field.includes('date') ? 'date'
                            : field === 'email' ? 'email'
                            : 'text'
                        }
                        name={field}
                        className={`form-control${formik.touched[field] && formik.errors[field] ? ' is-invalid' : formik.touched[field] && !formik.errors[field] ? ' is-valid' : ''}${showBalanceWarning && field === 'balance' ? ' is-invalid' : ''}`}
                        onChange={
                          ['mobile_number', 'aadhar_number'].includes(field)
                            ? handleNumericInput
                            : formik.handleChange
                        }
                        onBlur={formik.handleBlur}
                        value={formik.values[field]}
                        readOnly={field === 'balance'}
                        maxLength={
                          field === 'mobile_number' ? 10
                            : field === 'aadhar_number' ? 12
                            : undefined
                        }
                        style={document.activeElement?.name === field ? { backgroundColor: '#f0f8ff' } : {}}
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
          <Modal.Footer>
            <Button variant="secondary" onClick={hideModal}>Cancel</Button>
            <Button type="submit" variant="primary">{isEdit ? 'Update' : 'Add'}</Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
