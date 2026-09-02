import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addEnquiries, updateEnquiries } from "../../store/Enquiries/actions"; // Update path as needed
import { addStudent } from "../../store/addStudent/actions";
import { getTariffsListInformation } from "../../store/tariff/actions";
import {
  getInstructorAvailInformation,
  getInstructorsListInformation,
} from "../../store/instructors/actions";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { IoClose } from "react-icons/io5";
import "./addEnquiries.css";

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
  const [instructorsData, setInstructorsData] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityDay, setAvailabilityDay] = useState(null);

  useEffect(() => {
    if (!showModal) return;

    dispatch(
      getTariffsListInformation({}, (res) => {
        const tariffsList = Array.isArray(res?.response) ? res.response : [];
        setTariffsData(tariffsList);
      })
    );

    dispatch(
      getInstructorsListInformation({}, (res) => {
        const instructorsList = Array.isArray(res?.response) ? res.response : [];
        setInstructorsData(instructorsList);
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

  const getLocalISODate = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDefaultDob = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return getLocalISODate(date);
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

  const to24HourTime = (value) => {
    if (!value || typeof value !== "string") return "";
    const time = value.trim();
    const time24 = /^([01]\d|2[0-3]):([0-5]\d)/.exec(time);
    if (time24) return `${time24[1]}:${time24[2]}`;

    const time12 = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(time);
    if (!time12) return "";
    let hours = Number(time12[1]);
    if (time12[3].toUpperCase() === "AM" && hours === 12) hours = 0;
    if (time12[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
    return `${String(hours).padStart(2, "0")}:${time12[2]}`;
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

  const getTariffTrainingDaysByCourse = (courseInterest) => {
    const selectedPlan = String(courseInterest || "").trim().toLowerCase();
    const matchedTariff = (tariffsData || []).find(
      (tariff) =>
        String(tariff?.plan_name || "").trim().toLowerCase() === selectedPlan
    );
    return matchedTariff?.training_days ?? "";
  };

  const buildStudentPayloadFromEnquiry = (values) => {
    const totalAmount = Number(values?.total_amount || 0);
    const paidAmount = Number(values?.paid_amount || 0);
    const balance = Math.max(totalAmount - paidAmount, 0);

    return {
      studentData: {
        name: values?.name || "",
        dob: values?.dob || "",
        mobile_number: values?.mobile_number || "",
        application_number: values?.application_number || "",
        email: values?.email || null,
        aadhar_number: values?.aadhar_number || "",
        plan: values?.course_interest || "",
        payment_method: values?.payment_method || "",
        paid_amount: Number.isFinite(paidAmount) ? paidAmount : 0,
        total_amount: Number.isFinite(totalAmount) ? totalAmount : 0,
        balance,
        full_payment_status: balance === 0 ? "Completed" : "Pending",
        instructor_name: values?.instructor_name || "",
        instructor_id: values?.instructor_id || "",
        instructor_mobile: values?.instructor_mobile || "",
        test_date: values?.test_date || null,
        discount: 0,
        training_days: Number(values?.training_days || 0),
        training_start_date: values?.training_start_date || "",
        training_time: values?.training_time || "",
        attended_days: 0,
        status: "Process Started",
      },
    };
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
    dob: formatDateInput(id?.dob),
    application_number: id?.application_number || "",
    aadhar_number: id?.aadhar_number || "",
    payment_method: id?.payment_method || "",
    instructor_name: id?.instructor_name || "",
    instructor_id: id?.instructor_id || "",
    instructor_mobile: id?.instructor_mobile || "",
    training_days: getTariffTrainingDaysByCourse(id?.course_interest),
    training_start_date: formatDateInput(id?.training_start_date) || getLocalISODate(),
    training_time: id?.training_time || "",
    test_date: formatDateInput(id?.test_date),
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
    total_amount: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when("follow_up_status", {
        is: (status) => isEnrolledStatus(status),
        then: (schema) =>
          schema
            .typeError("Select a course with a valid tariff amount")
            .moreThan(0, "Selected course must have a valid tariff amount")
            .required("Total amount is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    dob: Yup.date()
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .when("follow_up_status", {
        is: (status) => isEnrolledStatus(status),
        then: (schema) =>
          schema
            .required("Date of birth is required")
            .max(new Date(), "DOB cannot be in the future")
            .test("minimum-age", "Student must be at least 18 years old", (value) => {
              if (!value) return false;
              const today = new Date();
              const dob = new Date(value);
              let age = today.getFullYear() - dob.getFullYear();
              const monthDifference = today.getMonth() - dob.getMonth();
              if (
                monthDifference < 0 ||
                (monthDifference === 0 && today.getDate() < dob.getDate())
              ) {
                age -= 1;
              }
              return age >= 18;
            }),
        otherwise: (schema) => schema.notRequired(),
      }),
    application_number: Yup.string().when("follow_up_status", {
      is: (status) => isEnrolledStatus(status),
      then: (schema) => schema.trim().required("Application number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    aadhar_number: Yup.string().when("follow_up_status", {
      is: (status) => isEnrolledStatus(status),
      then: (schema) =>
        schema
          .matches(/^\d{12}$/, "Aadhaar number must be 12 digits")
          .required("Aadhaar number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    payment_method: Yup.string().when("follow_up_status", {
      is: (status) => isEnrolledStatus(status),
      then: (schema) => schema.required("Payment method is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    instructor_name: Yup.string().when("follow_up_status", {
      is: (status) => isEnrolledStatus(status),
      then: (schema) => schema.required("Instructor is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    training_days: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when("follow_up_status", {
        is: (status) => isEnrolledStatus(status),
        then: (schema) =>
          schema
            .typeError("Training days must be a valid number")
            .moreThan(0, "Training days must be greater than zero")
            .required("Training days are required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    training_start_date: Yup.date()
      .nullable()
      .when("follow_up_status", {
        is: (status) => isEnrolledStatus(status),
        then: (schema) =>
          schema
            .required("Training start date is required")
            .min(getLocalISODate(), "Training start date cannot be in the past"),
        otherwise: (schema) => schema.notRequired(),
      }),
    training_time: Yup.string().when("follow_up_status", {
      is: (status) => isEnrolledStatus(status),
      then: (schema) =>
        schema
          .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Select a valid training time")
          .required("Training time is required"),
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
      const enrollingStudent = isEnrolledStatus(normalizedValues.follow_up_status);

      if (enrollingStudent) {
        normalizedValues.training_days = getTariffTrainingDaysByCourse(
          normalizedValues.course_interest
        );
        const selectedInstructor = instructorsData.find(
          (instructor) => instructor?.name === normalizedValues.instructor_name
        );
        normalizedValues.instructor_id =
          selectedInstructor?.id || normalizedValues.instructor_id || "";
        normalizedValues.instructor_mobile =
          selectedInstructor?.mobile_number ||
          normalizedValues.instructor_mobile ||
          "";
      } else {
        normalizedValues.total_amount = "";
        normalizedValues.paid_amount = "";
        normalizedValues.dob = normalizedValues.dob || id?.dob || getDefaultDob();
      }

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
      const wasPreviouslyEnrolled = isEnrolledStatus(id?.follow_up_status);
      const shouldCreateStudent =
        enrollingStudent && (!isEdit || !wasPreviouslyEnrolled);

      const applyApiFieldErrors = (responseData) => {
        if (!Array.isArray(responseData?.detail)) return;

        responseData.detail.forEach((errorItem) => {
          const location = Array.isArray(errorItem?.loc) ? errorItem.loc : [];
          const field = location[location.length - 1];
          if (field && Object.prototype.hasOwnProperty.call(formik.values, field)) {
            formik.setFieldTouched(field, true, false);
            formik.setFieldError(
              field,
              errorItem?.msg || errorItem?.message || "Invalid value"
            );
          }
        });
      };

      const saveEnquiry = (studentMeta = null) => {
        dispatch(action(payload, (response) => {
          const responseData = response?.data || response || {};
          const hasError =
            responseData?.isError === true ||
            Number(responseData?.statusCode) >= 400 ||
            Number(response?.status) >= 400;

          if (!hasError) {
            formik.resetForm();
            if (typeof onEnquiriesAdded === "function") {
              onEnquiriesAdded();
            }
            if (typeof enquiriesData === "function") {
              enquiriesData(responseData, isEdit, {
                enrolledFlow: Boolean(studentMeta),
                studentCreated: Boolean(studentMeta?.studentCreated),
                studentResponse: studentMeta?.studentResponse,
              });
            }
            hideModal();
          } else {
            applyApiFieldErrors(responseData);
          }

          if (hasError && typeof enquiriesData === "function") {
            enquiriesData(responseData, isEdit, {
              enrolledFlow: false,
              studentCreated: false,
            });
          }
        }));
      };

      if (!shouldCreateStudent) {
        saveEnquiry();
        return;
      }

      const studentPayload = buildStudentPayloadFromEnquiry(normalizedValues);
      dispatch(
        addStudent(studentPayload, (studentResponse) => {
          const studentResponseData = studentResponse?.data || studentResponse || {};
          const studentHasError =
            studentResponseData?.isError === true ||
            Number(studentResponseData?.statusCode) >= 400 ||
            Number(studentResponse?.status) >= 400;

          if (studentHasError) {
            applyApiFieldErrors(studentResponseData);
            if (typeof enquiriesData === "function") {
              enquiriesData(
                { ...studentResponseData, isError: true },
                isEdit,
                {
                  enrolledFlow: true,
                  studentCreated: false,
                  studentResponse: studentResponseData,
                }
              );
            }
            return;
          }

          saveEnquiry({
            studentCreated: true,
            studentResponse: studentResponseData,
          });
        })
      );
    },

  });

  const handleCourseInterestChange = (event) => {
    const courseInterest = event.target.value;
    formik.setFieldValue("course_interest", courseInterest);
    formik.setFieldValue(
      "total_amount",
      getTariffAmountByCourse(courseInterest)
    );
    formik.setFieldValue(
      "training_days",
      getTariffTrainingDaysByCourse(courseInterest)
    );
  };

  const handleInstructorChange = (event) => {
    const instructorName = event.target.value;
    const selectedInstructor = instructorsData.find(
      (instructor) => instructor?.name === instructorName
    );

    formik.setFieldValue("instructor_name", instructorName);
    formik.setFieldValue("instructor_id", selectedInstructor?.id || "");
    formik.setFieldValue(
      "instructor_mobile",
      selectedInstructor?.mobile_number || ""
    );
    formik.setFieldValue("training_time", "", false);
    setAvailabilityDay(null);
    setAvailabilityError("");
  };

  const handleTrainingStartDateChange = (event) => {
    formik.setFieldValue("training_start_date", event.target.value);
    formik.setFieldValue("training_time", "", false);
    setAvailabilityDay(null);
    setAvailabilityError("");
  };

  const bookedTimesForDay = Array.isArray(availabilityDay?.booked_slots)
    ? availabilityDay.booked_slots
        .map((slot) =>
          to24HourTime(
            typeof slot === "string"
              ? slot
              : slot?.time || slot?.slot_time || slot?.start_time || ""
          )
        )
        .filter(Boolean)
    : [];

  const availableTimesForDay = Array.isArray(availabilityDay?.available_slots)
    ? availabilityDay.available_slots
        .map((slot) =>
          to24HourTime(
            typeof slot === "string"
              ? slot
              : slot?.time || slot?.slot_time || slot?.start_time || ""
          )
        )
        .filter(Boolean)
    : [];

  const combinedTimesForDay = Array.from(
    new Set([...availableTimesForDay, ...bookedTimesForDay])
  ).sort();
  const selectedTrainingTime = to24HourTime(formik.values.training_time || "");
  const isSelectedTimeBooked = bookedTimesForDay.includes(selectedTrainingTime);
  const isSelectedTimeUnavailable = Boolean(
    selectedTrainingTime &&
      availableTimesForDay.length > 0 &&
      !availableTimesForDay.includes(selectedTrainingTime)
  );
  const hasTimeConflict = isSelectedTimeBooked || isSelectedTimeUnavailable;

  useEffect(() => {
    const isEnrolling = isEnrolledStatus(formik.values.follow_up_status);
    const instructorKey =
      formik.values.instructor_mobile || formik.values.instructor_id;
    const selectedDate = formik.values.training_start_date;

    if (!showModal || !isEnrolling || !instructorKey || !selectedDate) {
      setAvailabilityLoading(false);
      setAvailabilityError("");
      setAvailabilityDay(null);
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");

    dispatch(
      getInstructorAvailInformation(
        {
          mobile_number: instructorKey,
          month: selectedDate.slice(0, 7),
        },
        (response, error) => {
          if (error || response?.response?.status >= 400) {
            setAvailabilityDay(null);
            setAvailabilityError("Unable to load instructor availability.");
            setAvailabilityLoading(false);
            return;
          }

          const payload = response?.response ?? response;
          const days = Array.isArray(payload?.days) ? payload.days : [];
          const selectedDay = days.find((day) =>
            String(day?.date || "").startsWith(selectedDate)
          );

          setAvailabilityDay(selectedDay || null);
          setAvailabilityLoading(false);
        }
      )
    );
  }, [
    dispatch,
    formik.values.follow_up_status,
    formik.values.instructor_id,
    formik.values.instructor_mobile,
    formik.values.training_start_date,
    showModal,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedTrainingTime || !hasTimeConflict) return;
    formik.setFieldError(
      "training_time",
      isSelectedTimeBooked
        ? "This training time is already booked. Select another slot."
        : "This training time is unavailable. Select another slot."
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTimeConflict, isSelectedTimeBooked, selectedTrainingTime]);

  return (
    <Modal
      show={showModal}
      onHide={hideModal}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
      dialogClassName="enquiry-form-dialog"
    >
      <Modal.Header className="enquiry-form-header">
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
      <Modal.Body className="enquiry-form-body">
        <form onSubmit={formik.handleSubmit} className="enquiry-form">
          <div className="row enquiry-form-row">
            {[
              ["name", "text"],
              ["mobile_number", "text"],
              ["referred_by", "text"],
              // ['enquiry_date', 'datetime-local'],
              ["remarks", "text"],
            ].map(([field, type]) => (
              <div className="col-md-6" key={field}>
                <div className="form-group enquiry-form-group">
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
              <div className="form-group enquiry-form-group">
                <label>
                  {isEnrolledStatus(formik.values.follow_up_status)
                    ? "Plan"
                    : "Course Interest"}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="course_interest"
                  className={`form-control${
                    formik.touched.course_interest && formik.errors.course_interest
                      ? " is-invalid"
                      : ""
                  }`}
                  value={formik.values.course_interest}
                  onChange={handleCourseInterestChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">
                    {isEnrolledStatus(formik.values.follow_up_status)
                      ? "Select plan"
                      : "Select course interest"}
                  </option>
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
              <div className="form-group enquiry-form-group">
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
                <div className="form-group enquiry-form-group">
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
              <div className="col-12">
                <section className="enquiry-enrollment-panel" aria-labelledby="enquiry-enrollment-title">
                  <div className="enquiry-enrollment-heading">
                    <span className="enquiry-enrollment-icon" aria-hidden="true">
                      <i className="bi bi-person-plus" />
                    </span>
                    <div>
                      <h3 id="enquiry-enrollment-title">Student enrolment details</h3>
                      <p>Complete these details to create the student record.</p>
                    </div>
                  </div>

                  <div className="row enquiry-form-row">
                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Date of Birth <span className="required-mark">*</span></label>
                        <input
                          type="date"
                          name="dob"
                          max={getLocalISODate()}
                          className={`form-control${formik.touched.dob && formik.errors.dob ? " is-invalid" : ""}`}
                          value={formik.values.dob || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.dob && formik.errors.dob && (
                          <div className="text-danger">{formik.errors.dob}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Application Number <span className="required-mark">*</span></label>
                        <input
                          type="text"
                          name="application_number"
                          className={`form-control${formik.touched.application_number && formik.errors.application_number ? " is-invalid" : ""}`}
                          value={formik.values.application_number || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter application number"
                        />
                        {formik.touched.application_number && formik.errors.application_number && (
                          <div className="text-danger">{formik.errors.application_number}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Aadhaar Number <span className="required-mark">*</span></label>
                        <input
                          type="text"
                          name="aadhar_number"
                          inputMode="numeric"
                          maxLength="12"
                          className={`form-control${formik.touched.aadhar_number && formik.errors.aadhar_number ? " is-invalid" : ""}`}
                          value={formik.values.aadhar_number || ""}
                          onChange={(event) =>
                            formik.setFieldValue(
                              "aadhar_number",
                              event.target.value.replace(/\D/g, "").slice(0, 12)
                            )
                          }
                          onBlur={formik.handleBlur}
                          placeholder="Enter 12-digit Aadhaar number"
                        />
                        {formik.touched.aadhar_number && formik.errors.aadhar_number && (
                          <div className="text-danger">{formik.errors.aadhar_number}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Payment Method <span className="required-mark">*</span></label>
                        <select
                          name="payment_method"
                          className={`form-control${formik.touched.payment_method && formik.errors.payment_method ? " is-invalid" : ""}`}
                          value={formik.values.payment_method || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select payment method</option>
                          <option value="Cash">Cash</option>
                          <option value="Upi">UPI</option>
                        </select>
                        {formik.touched.payment_method && formik.errors.payment_method && (
                          <div className="text-danger">{formik.errors.payment_method}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Total Amount <span className="required-mark">*</span></label>
                        <input
                          type="number"
                          name="total_amount"
                          className={`form-control${formik.touched.total_amount && formik.errors.total_amount ? " is-invalid" : ""}`}
                          value={getTariffAmountByCourse(formik.values.course_interest)}
                          readOnly
                          aria-readonly="true"
                        />
                        {formik.touched.total_amount && formik.errors.total_amount && (
                          <div className="text-danger">{formik.errors.total_amount}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Paid Amount <span className="required-mark">*</span></label>
                        <input
                          type="number"
                          name="paid_amount"
                          min="0"
                          step="0.01"
                          className={`form-control${formik.touched.paid_amount && formik.errors.paid_amount ? " is-invalid" : ""}`}
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

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Instructor <span className="required-mark">*</span></label>
                        <select
                          name="instructor_name"
                          className={`form-control${formik.touched.instructor_name && formik.errors.instructor_name ? " is-invalid" : ""}`}
                          value={formik.values.instructor_name || ""}
                          onChange={handleInstructorChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select instructor</option>
                          {instructorsData.map((instructor) => (
                            <option key={instructor?.id || instructor?.mobile_number || instructor?.name} value={instructor?.name || ""}>
                              {instructor?.name}
                            </option>
                          ))}
                        </select>
                        {formik.touched.instructor_name && formik.errors.instructor_name && (
                          <div className="text-danger">{formik.errors.instructor_name}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Instructor Mobile</label>
                        <input
                          type="text"
                          name="instructor_mobile"
                          className="form-control"
                          value={formik.values.instructor_mobile || ""}
                          readOnly
                          aria-readonly="true"
                          placeholder="Filled from instructor"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Training Days <span className="required-mark">*</span></label>
                        <input
                          type="number"
                          name="training_days"
                          className={`form-control${formik.touched.training_days && formik.errors.training_days ? " is-invalid" : ""}`}
                          value={getTariffTrainingDaysByCourse(formik.values.course_interest)}
                          readOnly
                          aria-readonly="true"
                        />
                        {formik.touched.training_days && formik.errors.training_days && (
                          <div className="text-danger">{formik.errors.training_days}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Training Start Date <span className="required-mark">*</span></label>
                        <input
                          type="date"
                          name="training_start_date"
                          min={getLocalISODate()}
                          className={`form-control${formik.touched.training_start_date && formik.errors.training_start_date ? " is-invalid" : ""}`}
                          value={formik.values.training_start_date || ""}
                          onChange={handleTrainingStartDateChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.training_start_date && formik.errors.training_start_date && (
                          <div className="text-danger">{formik.errors.training_start_date}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Training Time <span className="required-mark">*</span></label>
                        <input
                          type="time"
                          name="training_time"
                          step="60"
                          className={`form-control${formik.touched.training_time && formik.errors.training_time ? " is-invalid" : ""}`}
                          value={formik.values.training_time || ""}
                          readOnly
                          aria-readonly="true"
                          onBlur={formik.handleBlur}
                          placeholder="Select an available slot below"
                        />
                        {formik.touched.training_time && formik.errors.training_time && (
                          <div className="text-danger">{formik.errors.training_time}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group enquiry-form-group">
                        <label>Test Date <span className="enquiry-optional-label">Optional</span></label>
                        <input
                          type="date"
                          name="test_date"
                          className="form-control"
                          value={formik.values.test_date || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="enquiry-payment-summary" aria-live="polite">
                        <span>Balance</span>
                        <strong>
                          ₹{Math.max(
                            Number(getTariffAmountByCourse(formik.values.course_interest) || 0) -
                              Number(formik.values.paid_amount || 0),
                            0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    {formik.values.instructor_name &&
                      formik.values.training_start_date && (
                        <div className="col-12">
                          <div className="enquiry-availability-panel">
                            <div className="enquiry-availability-header">
                              <div>
                                <h4>Instructor Availability</h4>
                                <span>{formik.values.training_start_date}</span>
                              </div>
                              <a
                                href={`/instructors/${
                                  formik.values.instructor_mobile ||
                                  formik.values.instructor_id
                                }/availability`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="bi bi-calendar3" aria-hidden="true" />
                                <span>Full schedule</span>
                              </a>
                            </div>

                            {availabilityLoading && (
                              <LoadingState
                                label="Loading instructor availability"
                                variant="compact"
                              />
                            )}

                            {!availabilityLoading && availabilityError && (
                              <Alert variant="danger" className="enquiry-availability-alert">
                                {availabilityError}
                              </Alert>
                            )}

                            {!availabilityLoading &&
                              !availabilityError &&
                              availabilityDay && (
                                <>
                                  <div className="enquiry-availability-summary">
                                    <span>
                                      Available <strong>{availableTimesForDay.length}</strong>
                                    </span>
                                    <span>
                                      Booked <strong>{bookedTimesForDay.length}</strong>
                                    </span>
                                    {availabilityDay.is_working_day === false && (
                                      <span className="is-non-working">
                                        Non-working day
                                      </span>
                                    )}
                                  </div>

                                  {hasTimeConflict && (
                                    <Alert variant="danger" className="enquiry-availability-alert">
                                      {isSelectedTimeBooked
                                        ? "This training time is already booked. Select another slot."
                                        : "This training time is unavailable. Select another slot."}
                                    </Alert>
                                  )}

                                  <div className="enquiry-slot-list" aria-label="Instructor training slots">
                                    {combinedTimesForDay.length > 0 ? (
                                      combinedTimesForDay.map((slot) => {
                                        const isBooked = bookedTimesForDay.includes(slot);
                                        const isSelected = selectedTrainingTime === slot;
                                        return (
                                          <button
                                            key={slot}
                                            type="button"
                                            className={`enquiry-slot${
                                              isBooked
                                                ? " is-booked"
                                                : isSelected
                                                ? " is-selected"
                                                : ""
                                            }`}
                                            disabled={isBooked}
                                            onClick={() => {
                                              formik.setFieldValue("training_time", slot);
                                              formik.setFieldTouched("training_time", true, false);
                                              formik.setFieldError("training_time", undefined);
                                            }}
                                            aria-pressed={isSelected}
                                            title={isBooked ? "Already booked" : "Select this training time"}
                                          >
                                            {slot}
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <span className="enquiry-no-slots">
                                        No slots are available for this date.
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}

                            {!availabilityLoading &&
                              !availabilityError &&
                              !availabilityDay && (
                                <EmptyState
                                  icon="bi bi-calendar2-x"
                                  title="No availability found"
                                  description="No instructor availability is configured for this date."
                                  variant="compact"
                                />
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </section>
              </div>
            )}
          </div>

          <Modal.Footer className="enquiry-form-footer">
            <Button
              variant="secondary"
              onClick={() => {
                formik.resetForm();
                hideModal();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                isEnrolledStatus(formik.values.follow_up_status) &&
                Boolean(
                  formik.values.instructor_name &&
                    formik.values.training_start_date
                ) &&
                (availabilityLoading ||
                  Boolean(availabilityError) ||
                  !availabilityDay ||
                  availabilityDay?.is_working_day === false ||
                  !selectedTrainingTime ||
                  hasTimeConflict)
              }
            >
              {isEnrolledStatus(formik.values.follow_up_status)
                ? "Enroll Student"
                : isEdit
                ? "Update"
                : "Add"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
