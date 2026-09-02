import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "./Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import AddStudents from "./addStudents";
import {
  getStudentsListInformation,
  getStudentsFilterListInformation,
} from "../../store/students/actions";
import { getTariffsListInformation } from "../../store/tariff/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";
import { deleteStudent } from "../../store/deleteStudent/actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentProfileModal from "./StudentProfile";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AddPayment from "./addPayment";
import { addStudentPayment } from "../../store/addStudentPayment/actions";
import Pagination from "./Pagenation";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import schoolPrintLogo from "../../assets/logo/school_print_logo.png";
import { getAdminPrintLogoSource, isDriveDeskAdmin } from "../../utils/printBranding";
import { ensureTenantLogo, useTenantLogo } from "../../hooks/useTenantLogo";

const Students = () => {
  const dispatch = useDispatch();
  const { logoSrc: tenantLogo, hasTenantLogo } = useTenantLogo(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentAppId, setSelectedStudentAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tariffsData, setTariffsData] = useState([]);
  const [instructorsData, setInstructorsData] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStudentData, setProfileStudentData] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [filterApplied, setFilterApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // --- New: search state ---
  const [searchType, setSearchType] = useState("name"); // 'name' | 'mobile_number' | 'month'
  const [searchValue, setSearchValue] = useState("");

  // before your table rows
  const startIndex = (currentPage - 1) * pageSize;

  const studentDataLists = useSelector(
    (state) => state.studentsListInfo.studentsList
  );

  const [searchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") || "";
  const initialYear = searchParams.get("year") || "";
  const initialMobileNumber = searchParams.get("mobile_number") || "";
  const initialOpenMode = searchParams.get("mode") || "edit";
  const hasOpenedLinkedStudent = useRef(false);

  const getOneStudentPaymentData = (flag, student) => {
    setShowPaymentModal(flag);
    setStudentForPayment(student);
  };

  const [filters, setFilters] = useState({
    month: initialMonth || "",
    year: initialYear || "",
    status: "All",
    instructor_name: "",
    test_date: "",
  });

  // Updated Validation: IF year is selected -> month is mandatory
  const FilterValidationSchema = Yup.object().shape({
    month: Yup.number()
      .nullable()
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? null : value
      )
      .min(1, "Min value is 1")
      .max(12, "Max value is 12")
      .when("year", {
        is: (year) => year != null,
        then: (schema) =>
          schema.required("Month is required when Year is provided"),
        otherwise: (schema) => schema,
      }),
    year: Yup.number()
      .nullable()
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? null : value
      )
      .min(2000, "Min value is 2000")
      .max(2100, "Max value is 2100"),
    status: Yup.string().nullable(),
    instructor_name: Yup.string().nullable(),
    test_date: Yup.string().nullable(),
  });

  const openProfileModal = (student) => {
    setProfileStudentData(student);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileStudentData(null);
  };

  const normalizeStudentsResponse = (res) => {
    const response = res?.response ?? res;
    const students = response?.students ?? (Array.isArray(response) ? response : []);
    const total = response?.total ?? (Array.isArray(response) ? students.length : 0);
    const isError = res?.isError ?? false;
    return { students: Array.isArray(students) ? students : [], total, isError };
  };

  const withPagination = (payload = {}, page = currentPage, limit = pageSize) => {
    const skip = (page - 1) * limit;
    return {
      ...payload,
      skip,
      limit,
    };
  };

  const getStudentsList = useCallback(() => {
    const skip = (currentPage - 1) * pageSize;
    setLoading(true);
     dispatch(
      getStudentsListInformation({ skip, limit: pageSize }, (res) => {
        const { students, total } = normalizeStudentsResponse(res);
        //console.log("Students from API:", students);
        setTotalCount(total);
        setStudentsData(students);
        setLoading(false); 
      })
    );
  }, [dispatch, currentPage, pageSize]);

  const getTariffsList = useCallback(() => {
    dispatch(
      getTariffsListInformation({}, (res) => {
        const tariffsList = res?.response || [];
        setTariffsData(Array.isArray(tariffsList) ? tariffsList : []);
      })
    );
  }, [dispatch]);

  const getInstructorsList = useCallback(() => {
    dispatch(
      getInstructorsListInformation({}, (res) => {
        const instructorsList = res?.response || [];
        setInstructorsData(
          Array.isArray(instructorsList) ? instructorsList : []
        );
      })
    );
  }, [dispatch]);

  useEffect(() => {
    getTariffsList();
    getInstructorsList();
    // Ensure loader shows for initial fetch
    setLoading(true);

    if (initialMobileNumber && hasOpenedLinkedStudent.current) return;

    if (initialMobileNumber) {
      hasOpenedLinkedStudent.current = true;
      dispatch(
        getStudentsFilterListInformation(
          { mobile_number: initialMobileNumber, skip: 0, limit: 1 },
          (res) => {
            const { students, total } = normalizeStudentsResponse(res);
            const linkedStudent = students[0];
            setStudentsData(students);
            setTotalCount(total);
            setLoading(false);
            if (!linkedStudent) {
              setError("No students found.");
              toast.error("The linked student could not be found.");
              return;
            }
            setError(null);
            if (initialOpenMode === "view") openProfileModal(linkedStudent);
            else handleEditStudent(linkedStudent);
          }
        )
      );
      return;
    }

    // If any initial query param is present (month, year, status, instructor_name, test_date)
    // apply filters; previously code required both month AND year which prevented year-only filters.
    const hasQueryFilters =
      (initialMonth && initialMonth !== "") ||
      (initialYear && initialYear !== "") ||
      (filters.status && filters.status !== "All") ||
      (filters.instructor_name && filters.instructor_name !== "") ||
      (filters.test_date && filters.test_date !== "");

    if (hasQueryFilters) {
      // Build cleaned filter object from current filters (use initialMonth/year from URL first)
      const initialFilterPayload = {
        ...filters,
        month: initialMonth || filters.month,
        year: initialYear || filters.year,
      };
      // Remove empty values
      const cleanedInitial = Object.fromEntries(
        Object.entries(initialFilterPayload).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const paginatedInitial = withPagination(cleanedInitial, currentPage, pageSize);

      dispatch(
        getStudentsFilterListInformation(paginatedInitial, (res) => {
          const { students, total } = normalizeStudentsResponse(res);
          if (Array.isArray(students) && students.length > 0) {
            setStudentsData(students);
            setError(null);
          } else {
            setStudentsData([]);
            setError("No students found.");
          }
          setTotalCount(total ?? 0);
          setLoading(false);
        })
      );
    } else {
      // default: load paginated students list
      getStudentsList();
    }
    // include the variables that should trigger re-run when they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, pageSize, initialMonth, initialYear, initialMobileNumber, initialOpenMode]);

  const onStudentData = (res, isEdit) => {
    setSelectedStudent(res.response);
    toast[res.isError ? "error" : "success"](
      res.isError
        ? "Failed....!"
        : isEdit
        ? "Student updated successfully!"
        : "Student added successfully!"
    );
  };

  const handleDeleteCloseModel = () => setShowDeleteModal(false);

  const deleteData = (appId) => {
    dispatch(
      deleteStudent({ appId }, (res) => {
        handleDeleteCloseModel();

        // if filters are applied, re-run filter; else load normal list (respects pagination)
        if (filterApplied) {
          setLoading(true);
          const paginatedFilters = withPagination(filters, currentPage, pageSize);
          dispatch(
            getStudentsFilterListInformation(paginatedFilters, (fres) => {
              const { students, total } = normalizeStudentsResponse(fres);
              setStudentsData(Array.isArray(students) ? students : []);
              setTotalCount(total ?? 0);
              setError(
                Array.isArray(students) && students.length ? null : "No students found."
              );
              setLoading(false);
            })
          );
        } else {
          getStudentsList();
        }

        toast.success("Student deleted successfully.");
      })
    );
  };

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedStudentAppId(appId);
  };

  const AddStudentsModal = () => setShowModal(true);

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedStudent(null);
  };

  // Fixed payments access (was using .lenth typo and unsafe access)
  const handleAddPayment = (payload) => {
    console.log("Payment Payload:", payload, studentForPayment);

    const payments = Array.isArray(studentForPayment?.payments)
      ? studentForPayment.payments
      : [];

    const lastPayment = payments.length > 0 ? payments[payments.length - 1] : {};

    const initialValues = {
      appId: studentForPayment?.mobile_number,
      studentPaymentData: {
        payment_id: lastPayment?.payment_id || "",
        receipt_no: lastPayment?.receipt_no || "",
        amount: payload.amount,
        transaction_id: "",
        date: payload.date,
        payment_method: payload.payment_method,
        payment_status: payload.payment_status,
        remarks: payload.remarks,
        payment_received_by: lastPayment?.payment_received_by || "",
      },
    };

    dispatch(
      addStudentPayment(initialValues, (response) => {
        const errorList =
          response?.data?.detail || response?.detail || response;

        if (Array.isArray(errorList)) {
          errorList.forEach((err) => {
            const field = err?.loc?.[1];
            const msg = err?.msg || err?.message || "Invalid input";
            toast.error(`${field}: ${msg}`);
          });
          return;
        }

        if (response?.isError || (response?.status >= 400) || (response?.statusCode >= 400)) {
          const msg =
            response?.data?.message ||
            response?.data?.detail ||
            response?.message ||
            "Payment failed. Please try again.";
          toast.error(typeof msg === "string" ? msg : "Payment failed. Please try again.");
        } else {
          setReceiptData(response);
          toast.success("Payment added successfully!");
          //setShowPaymentModal(false);
          getStudentsList(); // refresh student data after payment
        }
      })
    );
  };

  // ---------- NEW: perform search based on selected searchType ----------
  const performSearch = (value, type) => {
    // Trim input
    const v = String(value ?? "").trim();

    // If empty search, revert to normal list
    if (!v) {
      setSearchValue("");
      setFilterApplied(false);
      setCurrentPage(1);
      getStudentsList();
      return;
    }

    // Build payload for API - pass pagination (skip/limit) and the search field
    const skip = 0; // always search from first page
    const payload = { skip, limit: pageSize };

    if (type === "month") {
      // Accept numeric month; backend may expect number or string
      const num = Number(v);
      if (Number.isNaN(num) || num < 1 || num > 12) {
        toast.error("Month must be a number between 1 and 12");
        return;
      }
      payload.month = num;
    } else if (type === "mobile_number") {
      payload.mobile_number = v;
    } else {
      // name search (default)
      payload.name = v;
    }

    setFilterApplied(true);
    setCurrentPage(1);
    setLoading(true);

    dispatch(
      getStudentsFilterListInformation(payload, (res) => {
        const { students, total, isError } = normalizeStudentsResponse(res);

        if (isError && Array.isArray(res?.response)) {
          (res.response || []).forEach((err) => {
            const field = err?.loc?.[1] || "Field";
            const message = err?.msg || "Invalid input";
            toast.error(`${field}: ${message}`);
          });
          setLoading(false);
          return;
        }

        if (Array.isArray(students) && students.length > 0) {
          setStudentsData(students);
          setError(null);
        } else {
          setStudentsData([]);
          setError("No students found.");
        }
        setTotalCount(total ?? 0);
        setLoading(false);
      })
    );
  };

  // onchange handler for search input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    // perform search immediately on change (you can debounce if desired)
    performSearch(val, searchType);
  };

  const PrintableStudentTable = ({ students }) => {
    if (!students.length) return null;

    return (
      <div className="printable-student-table mt-3">
        <table className="table table-bordered table-striped text-start">
          <thead>
            <tr>
              <th>#</th>
              <th>Plan</th>
              <th>Application No</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.application_number || index}>
                <td>{index + 1}</td>
                <td>{student.plan || "-"}</td>
                <td>{student.application_number || "-"}</td>
                <td>{student.name || "-"}</td>
                <td>{student.mobile_number || "-"}</td>
                <td>₹{student.balance || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrint = async () => {
    await ensureTenantLogo(dispatch);
    await new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    });

    const printImages = Array.from(
      document.querySelectorAll(".print-page-wrapper img")
    );
    await Promise.all(printImages.map((image) => (
      typeof image.decode === "function" ? image.decode().catch(() => undefined) : Promise.resolve()
    )));

    const originalTitle = document.title;
    document.title = "Filtered Students Report";

    // Restore original title after printing (use afterprint if available)
    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();

    // Fallback restore in case afterprint isn't fired
    setTimeout(() => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    }, 2000);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  let orgNameForPrint = "Students Test List";
  let tenantInfoForPrint = {};
  try {
    tenantInfoForPrint = JSON.parse(localStorage.getItem("userInfo") || "{}");
    orgNameForPrint =
      tenantInfoForPrint?.org_name ||
      tenantInfoForPrint?.organization_name ||
      tenantInfoForPrint?.name ||
      "Students Test List";
  } catch (e) {
    orgNameForPrint = "Students Test List";
  }

  const normalizedOrgName = (orgNameForPrint || "").toLowerCase();
  const isCustomWatermarkOrg = normalizedOrgName.includes("sri ragavendra");
  const apiLogo =
    tenantInfoForPrint?.logo_url ||
    tenantInfoForPrint?.org_logo ||
    tenantInfoForPrint?.logo ||
    null;
  const driveDeskAdmin = isDriveDeskAdmin();
  const schoolLogo = hasTenantLogo
    ? tenantLogo
    : driveDeskAdmin
      ? getAdminPrintLogoSource()
      : apiLogo || (isCustomWatermarkOrg ? schoolPrintLogo : null);

  return (
    <>
      <div
        className="header-fixed sidebar-fixed sidebar-dark header-light students-page"
        id="body"
      >
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />
            <div className="content-wrapper">
              <div className="content">
                <div className="row students-page-heading">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Students</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#" className="students-breadcrumb-home" aria-label="Students home">
                            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                              <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                            </svg>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Students</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Student List
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <div className="col-xl-6 text-right students-page-actions">
                    <button
                      type="button"
                      className="mb-1 btn btn-secondary mr-2"
                      onClick={() => {
                        setFiltersVisible(!filtersVisible);
                        if (!filtersVisible) setFilterApplied(false);
                      }}
                    >
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button
                      type="button"
                      className="mb-1 btn btn-primary mr-2"
                      onClick={() => setShowModal(true)}
                    >
                      <i className="bi bi-plus-lg"></i> Add Students
                    </button>
                    {filterApplied && studentsData.length > 0 && (
                      <button
                        type="button"
                        className="mb-1 btn btn-outline-secondary"
                        onClick={handlePrint}
                      >
                        <i className="bi bi-printer"></i> Print
                      </button>
                    )}
                  </div>
                </div>

                {/* ---------- NEW: Search box (above table) ---------- */}
                <div className="row mb-3 students-search-toolbar">
                  <div className="col-md-3 students-search-type">
                    <select
                      className="form-control students-select-arrow"
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        // Clear current search input whenever type changes
                        setSearchValue("");
                        // If you'd like to immediately clear results when type changes, uncomment:
                        // performSearch("", e.target.value);
                      }}
                    >
                      <option value="name">Name</option>
                      <option value="mobile_number">Mobile Number</option>
                      <option value="month">Month</option>
                    </select>
                  </div>

                  <div className="col-md-5 students-search-input">
                    <input
                      type={searchType === "month" ? "number" : "text"}
                      min={searchType === "month" ? 1 : undefined}
                      max={searchType === "month" ? 12 : undefined}
                      className="form-control"
                      placeholder={
                        searchType === "month"
                          ? "Enter month (1-12)"
                          : searchType === "mobile_number"
                          ? "Search by mobile number"
                          : "Search by name"
                      }
                      value={searchValue}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div className="col-md-2 students-search-clear">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        // Clear search and reload list
                        setSearchValue("");
                        setFilterApplied(false);
                        setCurrentPage(1);
                        getStudentsList();
                      }}
                    >
                      Clear Search
                    </button>
                  </div>
                </div>

                {filtersVisible && (
                  <div className="card p-3 mb-4 students-filter-card">
                    <Formik
                      initialValues={{
                        month: filters.month ?? "",
                        year: filters.year ?? "",
                        status: filters.status ?? "All",
                        instructor_name: filters.instructor_name ?? "",
                        test_date: filters.test_date ?? "",
                      }}
                      validationSchema={FilterValidationSchema}
                      onSubmit={(values) => {
                        setFilterApplied(true);
                        setCurrentPage(1);

                        const cleanedValues = Object.fromEntries(
                          Object.entries(values).filter(
                            ([, v]) => v !== "" && v !== null && v !== undefined
                          )
                        );

                        if (Object.keys(cleanedValues).length === 0) {
                          toast.warn("Please enter at least one filter value.");
                          return;
                        }

                        setFilters(cleanedValues);
                        setLoading(true); // show loader while filter fetches

                        const paginatedFilters = withPagination(cleanedValues, 1, pageSize);

                        dispatch(
                          getStudentsFilterListInformation(paginatedFilters, (res) => {
                            const { students, total, isError } = normalizeStudentsResponse(res);

                            if (isError && Array.isArray(res?.response)) {
                              // backend validation errors - preserve existing behavior
                              (res.response || []).forEach((err) => {
                                const field = err?.loc?.[1] || "Field";
                                const message = err?.msg || "Invalid input";
                                toast.error(`${field}: ${message}`);
                              });
                              setLoading(false);
                              return;
                            }

                            if (Array.isArray(students) && students.length > 0) {
                              setStudentsData(students);
                              setError(null);
                            } else {
                              setStudentsData([]);
                              setError("No students found.");
                            }
                            setTotalCount(total ?? 0);
                            setLoading(false);
                          })
                        );
                      }}
                    >
                      {({ handleSubmit }) => (
                        <Form onSubmit={handleSubmit}>
                          <div className="row students-filter-grid">
                            <div className="col-md-2">
                              <label>Month</label>
                              <Field
                                type="number"
                                name="month"
                                id="month"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="month"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Year</label>
                              <Field
                                type="number"
                                name="year"
                                id="year"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="year"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Status</label>
                              <Field
                                as="select"
                                name="status"
                                className="form-control students-select-arrow"
                              >
                                <option value="All">All</option>
                                <option value="Process Started">
                                  Process Started
                                </option>
                                <option value="Process failed">
                                  Process failed
                                </option>
                                <option value="Process stalled">
                                  Process stalled
                                </option>
                                <option value="Process completed">
                                  Process completed
                                </option>
                              </Field>
                              <ErrorMessage
                                name="status"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-3">
                              <label>Instructor Name</label>
                              <Field
                                as="select"
                                name="instructor_name"
                                className="form-control students-select-arrow"
                              >
                                <option value="">--Select--</option>
                                {instructorsData.map((instructor, idx) => (
                                  <option key={idx} value={instructor.name}>
                                    {instructor.name}
                                  </option>
                                ))}
                              </Field>

                              <ErrorMessage
                                name="instructor_name"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Test Date</label>
                              <Field
                                type="date"
                                name="test_date"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="test_date"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="submit"
                                className="btn btn-primary w-100"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                )}

                {/* Student List */}
                <div>
                  {loading ? (
                    <LoadingState label="Loading students" />
                  ) : error ? (
                    <EmptyState
                      icon="bi bi-people"
                      title="No students found"
                      description="Students will appear here after they are added or when they match the selected filters."
                    />
                  ) : (
                    <>
                      <div className="table-responsive students-table-wrap">
                        <table className="table custom-table text-center align-middle students-table">
                          <thead className="table-light">
                            <tr>
                              <th>S.NO</th>
                              <th>Student Name</th>
                              <th>Mobile Number</th>
                              <th>Plan</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsData.map((student, index) => (
                              <tr key={student.application_number || index}>
                                <td data-label="S.No">{startIndex + index + 1}</td>
                                <td data-label="Student Name">{student.name || "Student Name"}</td>
                                <td data-label="Mobile Number">{student.mobile_number || "N/A"}</td>
                                <td data-label="Plan" className="status">
                                  <span className="students-plan-value">
                                    <i className="bi bi-check-circle" aria-hidden="true"></i>
                                    <span>{student.plan || "No plan"}</span>
                                  </span>
                                </td>
                                <td data-label="Actions" className="students-row-actions">
                                  <button
                                    className="btn btn-sm btn-warning students-action-icon"
                                    title="Edit Student"
                                    data-tooltip="Edit Student"
                                    aria-label="Edit Student"
                                    onClick={() => handleEditStudent(student)}
                                  >
                                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                                    <span className="students-action-label">Edit</span>
                                  </button>{" "}
                                  <button
                                    className="btn btn-sm btn-success students-action-icon"
                                    title={
                                      Number(student.balance) <= 0
                                        ? "No balance due"
                                        : "Add Payment"
                                    }
                                    data-tooltip={
                                      Number(student.balance) <= 0
                                        ? "No balance due"
                                        : "Add Payment"
                                    }
                                    aria-label={
                                      Number(student.balance) <= 0
                                        ? "No balance due"
                                        : "Add Payment"
                                    }
                                    onClick={() =>
                                      getOneStudentPaymentData(true, student)
                                    }
                                    disabled={Number(student.balance) <= 0}
                                  >
                                    <i className="bi bi-cash-coin" aria-hidden="true"></i>
                                    <span className="students-action-label">Fee</span>
                                  </button>{" "}
                                  <button
                                    type="button"
                                    onClick={() => openProfileModal(student)}
                                    className="btn btn-primary btn-sm students-action-icon"
                                    title="View Student"
                                    data-tooltip="View Student"
                                    aria-label="View Student"
                                  >
                                    <i className="bi bi-eye" aria-hidden="true"></i>
                                    <span className="students-action-label">View</span>
                                  </button>{" "}
                                  <button
                                    className="btn btn-sm btn-danger students-action-icon"
                                    title="Delete Student"
                                    data-tooltip="Delete Student"
                                    aria-label="Delete Student"
                                    onClick={() =>
                                      deleteUser(student.mobile_number)
                                    }
                                  >
                                    <i className="bi bi-trash" aria-hidden="true"></i>
                                    <span className="students-action-label">Delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  <Pagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => {
                      setPageSize(s);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <AddStudents
              showModal={showModal}
              hideModal={handleCloseModal}
              onStudentAdded={getStudentsList}
              studentData={onStudentData}
              id={selectedStudent}
              isEdit={isEdit}
              plans={tariffsData}
              instructors={instructorsData}
            />
            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedStudentAppId}
              message={"Are you sure want to delete this student?"}
            />
            <StudentProfileModal
              show={showProfileModal}
              onClose={closeProfileModal}
              student={profileStudentData}
            />

            <AddPayment
              show={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onSubmit={handleAddPayment}
              payReceiptData={receiptData}
              student={studentForPayment}
            />

            <Footer />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeButton={false}
        closeOnClick
        pauseOnHover
      />

      <div className="d-none d-print-block print-page-wrapper">

        {/* ── Watermark layers (behind everything) ── */}
        <div className="print-watermark-layer">
          {/* Logo watermark – large, centered */}
          {schoolLogo && (
            <img src={schoolLogo} alt="" className="print-wm-logo" aria-hidden="true" />
          )}
        </div>

        {/* ── Foreground content ── */}
        <div className="print-foreground">
          {/* Header */}
          <div className="print-header-top">
            {schoolLogo && (
              <div className="print-logo-area">
                <img src={schoolLogo} alt={`${orgNameForPrint} logo`} className="print-school-logo" />
              </div>
            )}
            <div className="print-title-area">
              <h2 className="print-org-name">{orgNameForPrint}</h2>
              <h4 className="print-list-title">Student Test Date</h4>
            </div>
            <span className="print-header-spacer" aria-hidden="true" />
          </div>
          <hr className="print-divider" />

          <section className="print-report-meta" aria-label="Report information">
            <div><span>Report</span><strong>Student Test List</strong></div>
            <div><span>Total records</span><strong>{studentsData.length}</strong></div>
            <div><span>Report period</span><strong>{initialMonth && initialYear ? `${String(initialMonth).padStart(2, "0")}/${initialYear}` : "All records"}</strong></div>
            <div><span>Generated on</span><strong>{formatDateDDMMYYYY(new Date().toISOString())}</strong></div>
          </section>

          {/* Student table */}
          <PrintableStudentTable students={studentsData} />

          {/* <section className="print-signatures" aria-label="Report signatures">
            <div><span>Prepared By</span><small>DriveDesk</small></div>
            <div><span>Authorized Signature</span><small>{orgNameForPrint}</small></div>
          </section> */}
        </div>

      </div>
    </>
  );
};

export default Students;
