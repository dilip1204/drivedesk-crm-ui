import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addEnquiries, updateEnquiries } from "../../store/Enquiries/actions"; // Update path as needed
import { addStudent } from "../../store/addStudent/actions";
import { getTariffsListInformation } from "../../store/tariff/actions";
import { IoClose } from "react-icons/io5";

export default function AddEnquiries({
  showModal,
  hideModal,
  id,
  isEdit,
  onEnquiriesAdded,
  enquiriesData,
}) {
  const dispatch = useDispatch();
  const [tariffsData, setTariffsData] = useState([]);

  useEffect(() => {
    if (!showModal) return;

    dispatch(
      getTariffsListInformation({}, (res) => {
        const tariffsList = Array.isArray(res?.response) ? res.response : [];
        setTariffsData(tariffsList);
      })
    );
  }, [dispatch, showModal]);

  const courseOptions = useMemo(() => {
    const byPlanName = new Map();
    (tariffsData || []).forEach((tariff) => {
      const plan = (tariff?.plan_name || "").trim();
      if (plan && !byPlanName.has(plan)) {
        byPlanName.set(plan, plan);
      }
    });

    const current = (id?.course_interest || "").trim();
    if (current && !byPlanName.has(current)) {
      byPlanName.set(current, current);
    }

    return Array.from(byPlanName.values());
  }, [tariffsData, id?.course_interest]);

  const getDefaultDob = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateInput = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isEnrolledStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    return normalized === "converted" || normalized === "enrolled";
  };

  const normalizeFollowUpStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    if (normalized === "converted") return "Enrolled";
    if (normalized === "pending") return "Pending";
    if (normalized === "contacted") return "Contacted";
    if (normalized === "enrolled") return "Enrolled";
    if (normalized === "dropped") return "Dropped";
    return "Pending";
  };

  const getTariffAmountByCourse = (courseInterest) => {
    const selectedPlan = String(courseInterest || "").trim().toLowerCase();
    if (!selectedPlan) return 0;

    const matchedTariff = (tariffsData || []).find(
      (tariff) =>
        String(tariff?.plan_name || "").trim().toLowerCase() === selectedPlan
    );

    const amount = Number(matchedTariff?.amount || 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  const buildStudentPayloadFromEnquiry = (values) => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const totalAmount = Number(values?.total_amount || 0);
    const paidAmount = Number(values?.paid_amount || 0);

    return {
      studentData: {
        name: values?.name || "",
        dob: values?.dob || getDefaultDob(),
        mobile_number: values?.mobile_number || "",
        application_number: `ENQ-${now}`,
        email: values?.email || null,
        aadhar_number: "000000000000",
        plan: values?.course_interest || "",
        payment_method: "Cash",
        paid_amount: Number.isFinite(paidAmount) ? paidAmount : 0,
        total_amount: Number.isFinite(totalAmount) ? totalAmount : 0,
        balance:
          Number.isFinite(totalAmount) && Number.isFinite(paidAmount)
            ? Math.max(totalAmount - paidAmount, 0)
            : Number.isFinite(totalAmount)
            ? totalAmount
            : 0,
        full_payment_status: "Pending",
        instructor_name: "Not Assigned",
        instructor_id: "",
        instructor_mobile: "0000000000",
        test_date: null,
        discount: 0,
        training_days: 0,
        training_start_date: today,
        training_time: "10:00",
        attended_days: 0,
        status: "Process Started",
      },
    };
  };

  // Utility to format date for datetime-local input
  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const initialValues = {
    name: id?.name || "",
    mobile_number: id?.mobile_number || "",
    referred_by: id?.referred_by || "",
    email: id?.email || null,
    course_interest: id?.course_interest || "",
    // enquiry_date: id?.enquiry_date ? formatDateTimeLocal(id.enquiry_date) : formatDateTimeLocal(new Date()),
    follow_up_status: normalizeFollowUpStatus(id?.follow_up_status || "Pending"),
    follow_up_date: formatDateInput(id?.follow_up_date),
    total_amount: getTariffAmountByCourse(id?.course_interest),
    paid_amount: "",
    remarks: id?.remarks || "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    mobile_number: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    //referred_by: Yup.string().required("Referred by is required"),
    //email: Yup.string().email("Invalid email").required("Email is required"),
    course_interest: Yup.string().required("Course interest is required"),
    //enquiry_date: Yup.date().required("Enquiry date is required"),
    follow_up_status: Yup.string().required("Follow-up status is required"),
    paid_amount: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when(["follow_up_status", "course_interest"], {
        is: (status) => isEnrolledStatus(status),
        then: (schema) =>
          schema
            .typeError("Paid amount must be a valid number")
            .min(0, "Paid amount cannot be negative")
            .max(
              Yup.ref("total_amount"),
              "Paid amount cannot be greater than total amount"
            )
            .required("Paid amount is required for enrolled status"),
        otherwise: (schema) => schema.notRequired(),
      }),
    //remarks: Yup.string().required("Remarks are required")
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      let payload;

      const normalizedValues = {
        ...values,
        follow_up_status: normalizeFollowUpStatus(values?.follow_up_status),
      };
      normalizedValues.follow_up_date = normalizedValues.follow_up_date || null;
      normalizedValues.total_amount = getTariffAmountByCourse(
        normalizedValues.course_interest
      );
      if (!isEnrolledStatus(normalizedValues.follow_up_status)) {
        normalizedValues.total_amount = "";
        normalizedValues.paid_amount = "";
      }
      // DOB is hidden in UI; send a valid value to satisfy backend schema.
      normalizedValues.dob = normalizedValues.dob || id?.dob || getDefaultDob();

      if (isEdit) {
        const changedFields = Object.keys(normalizedValues).reduce((diff, key) => {
          if (normalizedValues[key] !== id?.[key]) {
            diff[key] = normalizedValues[key];
          }
          return diff;
        }, {});

        payload = {
          id: id?.id,
          ...changedFields,
        };
      } else {
        payload = { ...normalizedValues };
      }

      const action = isEdit ? updateEnquiries : addEnquiries;

      dispatch(
        action(payload, (response) => {
          const responseData = response?.data || response || {};
          const hasError =
            responseData?.isError === true ||
            Number(responseData?.statusCode) >= 400 ||
            Number(response?.status) >= 400;

          if (!hasError) {
            const isCurrentlyEnrolled = isEnrolledStatus(
              normalizedValues.follow_up_status
            );
            const wasPreviouslyEnrolled = isEnrolledStatus(id?.follow_up_status);
            const enrolled =
              isCurrentlyEnrolled && (!isEdit || !wasPreviouslyEnrolled);

            if (enrolled) {
              const studentPayload = buildStudentPayloadFromEnquiry(normalizedValues);

              dispatch(
                addStudent(studentPayload, (studentResponse) => {
                  const studentResponseData =
                    studentResponse?.data || studentResponse || {};
                  const studentHasError =
                    studentResponseData?.isError === true ||
                    Number(studentResponseData?.statusCode) >= 400 ||
                    Number(studentResponse?.status) >= 400;

                  formik.resetForm();
                  if (typeof onEnquiriesAdded === "function") {
                    onEnquiriesAdded();
                  }

                  if (typeof enquiriesData === "function") {
                    enquiriesData(responseData, isEdit, {
                      enrolledFlow: true,
                      studentCreated: !studentHasError,
                      studentResponse: studentResponseData,
                    });
                  }
                  hideModal();
                })
              );
              return;
            }

            formik.resetForm();
            if (typeof onEnquiriesAdded === "function") {
              onEnquiriesAdded();
            }
            if (typeof enquiriesData === "function") {
              enquiriesData(responseData, isEdit, {
                enrolledFlow: false,
                studentCreated: false,
              });
            }
            hideModal();
          } else if (Array.isArray(responseData?.detail)) {
            const errors = responseData.detail;
            errors.forEach((err) => {
              const field = err?.loc?.[1];
              const msg = err?.msg || err?.message || "Invalid input";
              if (field && formik.values.hasOwnProperty(field)) {
                formik.setFieldError(field, msg);
              }
            });
          }

          if (hasError && typeof enquiriesData === "function") {
            enquiriesData(responseData, isEdit, {
              enrolledFlow: false,
              studentCreated: false,
            });
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
      <Modal.Header>
        <Modal.Title>{isEdit ? "Update Enquiry" : "Add Enquiry"}</Modal.Title>
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
      <Modal.Body>
        <form onSubmit={formik.handleSubmit}>
          <div className="row">
            {[
              ["name", "text"],
              ["mobile_number", "text"],
              ["referred_by", "text"],
              // ['enquiry_date', 'datetime-local'],
              ["remarks", "text"],
            ].map(([field, type]) => (
              <div className="col-md-6" key={field}>
                <div className="form-group">
                  <label>
                    {field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    {field !== "referred_by" &&
                      field !== "email" &&
                      field !== "remarks" && (
                        <span style={{ color: "red" }}>*</span>
                      )}
                  </label>
                  <input
                    type={type}
                    name={field}
                    className={`form-control${
                      formik.touched[field] && formik.errors[field]
                        ? " is-invalid"
                        : ""
                    }`}
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
                <label>
                  Course Interest <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="course_interest"
                  className={`form-control${
                    formik.touched.course_interest && formik.errors.course_interest
                      ? " is-invalid"
                      : ""
                  }`}
                  value={formik.values.course_interest}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">--Select--</option>
                  {courseOptions.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
                {formik.touched.course_interest && formik.errors.course_interest && (
                  <div className="text-danger">{formik.errors.course_interest}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>
                  Follow Up Status <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="follow_up_status"
                  className="form-control"
                  value={formik.values.follow_up_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Dropped">Dropped</option>
                </select>
                {formik.touched.follow_up_status &&
                  formik.errors.follow_up_status && (
                    <div className="text-danger">
                      {formik.errors.follow_up_status}
                    </div>
                  )}
              </div>
            </div>

            {!isEnrolledStatus(formik.values.follow_up_status) && (
              <div className="col-md-6">
                <div className="form-group">
                  <label>Follow Up Date</label>
                  <input
                    type="date"
                    name="follow_up_date"
                    className="form-control"
                    value={formik.values.follow_up_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>
            )}

            {isEnrolledStatus(formik.values.follow_up_status) && (
              <div className="col-md-6">
                <div className="form-group">
                  <label>
                    Total Amount <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={getTariffAmountByCourse(formik.values.course_interest)}
                    readOnly
                    placeholder="Auto-filled from selected course"
                  />
                </div>
              </div>
            )}

            {isEnrolledStatus(formik.values.follow_up_status) && (
              <div className="col-md-6">
                <div className="form-group">
                  <label>
                    Paid Amount <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    min="0"
                    step="0.01"
                    className={`form-control${
                      formik.touched.paid_amount && formik.errors.paid_amount
                        ? " is-invalid"
                        : ""
                    }`}
                    value={formik.values.paid_amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter paid amount"
                  />
                  {formik.touched.paid_amount && formik.errors.paid_amount && (
                    <div className="text-danger">{formik.errors.paid_amount}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                formik.resetForm();
                hideModal();
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
