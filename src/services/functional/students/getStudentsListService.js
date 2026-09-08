import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

const MAX_STUDENT_PAGE_SIZE = 100;
const LLR_FILTER_BATCH_SIZE = 500;
const MAX_LLR_FILTER_PAGES = 100;

const buildStudentFilterUrl = (param = {}) => {
  const query = new URLSearchParams();

  Object.entries(param).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return `${ENDPOINTS.getAllStudentsFilter}?${query.toString()}`;
};

const parseStudentsPage = (response) => {
  const payload = response?.data?.response;
  const students = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.students)
      ? payload.students
      : [];
  const total = Number(payload?.total);

  return {
    students,
    total: Number.isFinite(total) ? total : students.length,
    isArrayResponse: Array.isArray(payload),
  };
};

const parseLocalDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || "").trim());
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const hasCompletedThirtyLlrDays = (student) => {
  const llrFromDate =
    student?.llr_from_date || student?.student_details?.llr_from_date;
  const startDate = parseLocalDate(llrFromDate);
  if (!startDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - startDate.getTime()) / 86400000) >= 30;
};

const getStudentsWithCompletedLlrDays = async (param = {}) => {
  const requestedSkip = Number(param.skip);
  const requestedLimit = Number(param.limit);
  const skip = Number.isFinite(requestedSkip) && requestedSkip >= 0
    ? Math.floor(requestedSkip)
    : 0;
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(Math.floor(requestedLimit), MAX_STUDENT_PAGE_SIZE)
    : 10;
  const backendFilters = { ...param };
  delete backendFilters.skip;
  delete backendFilters.limit;

  let firstResponse;
  let allStudents = [];
  let nextSkip = 0;
  let total = Number.POSITIVE_INFINITY;
  let pageCount = 0;

  while (nextSkip < total && pageCount < MAX_LLR_FILTER_PAGES) {
    const response = await request(
      METHOD_TYPES.GET,
      buildStudentFilterUrl({
        ...backendFilters,
        skip: nextSkip,
        limit: LLR_FILTER_BATCH_SIZE,
      })
    );
    if (!firstResponse) firstResponse = response;
    if (response?.data?.isError) return response;

    const page = parseStudentsPage(response);
    if (!page.students.length) break;

    allStudents = allStudents.concat(page.students);
    nextSkip += page.students.length;
    total = page.total;
    pageCount += 1;

    if (page.isArrayResponse) break;
  }

  const matches = allStudents.filter(hasCompletedThirtyLlrDays);
  const originalData = firstResponse?.data || {};
  const originalPayload = originalData?.response;

  return {
    ...firstResponse,
    data: {
      ...originalData,
      response: {
        ...(originalPayload && !Array.isArray(originalPayload) ? originalPayload : {}),
        students: matches.slice(skip, skip + limit),
        total: matches.length,
        skip,
        limit,
      },
    },
  };
};

export const getAllStudents = (param = {}) => {
    const requestedSkip = Number(param.skip);
    const requestedLimit = Number(param.limit);
    const skip = Number.isFinite(requestedSkip) && requestedSkip >= 0
        ? Math.floor(requestedSkip)
        : 0;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), MAX_STUDENT_PAGE_SIZE)
        : 10;
    const query = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
    });

    return request(
        METHOD_TYPES.GET,
        `${ENDPOINTS.getAllStudents}?${query.toString()}`
    );
};

export const getAllStudentsFilter = (param = {}) => {
  if (String(param.llr_30_days_completed || "").toLowerCase() === "true") {
    return getStudentsWithCompletedLlrDays(param);
  }

  return request(METHOD_TYPES.GET, buildStudentFilterUrl(param));
};


export const getStudentReceipt = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getStudentReceipt+param.receipt_no
    )
}
