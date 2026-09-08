import { METHOD_TYPES } from '../../../shared/constants/methodTypes';
import { request } from "../../core/networkRequest";
import { ENDPOINTS } from "../../../shared/constants/endPoints";

const PARTIAL_MOBILE_BATCH_SIZE = 100;
const MAX_PARTIAL_MOBILE_PAGES = 100;

const buildEnquiriesUrl = ({ skip, limit, name = "", mobileNumber = "" }) => {
    const query = new URLSearchParams();

    if (name) query.set("name", name);
    if (mobileNumber) query.set("mobile_number", mobileNumber);
    query.set("skip", String(skip));
    query.set("limit", String(limit));

    return `${ENDPOINTS.getAllEnquiries}?${query.toString()}`;
};

const parseEnquiriesPage = (response) => {
    const payload = response?.data?.response;
    const enquiries = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.enquiries)
            ? payload.enquiries
            : [];
    const total = Number(payload?.total);

    return {
        enquiries,
        total: Number.isFinite(total) ? total : enquiries.length,
        isArrayResponse: Array.isArray(payload),
    };
};

const getEnquiriesByPartialMobile = async ({ skip, limit, mobileNumber }) => {
    let firstResponse;
    let allEnquiries = [];
    let nextSkip = 0;
    let total = Number.POSITIVE_INFINITY;
    let pageCount = 0;

    while (nextSkip < total && pageCount < MAX_PARTIAL_MOBILE_PAGES) {
        const response = await request(
            METHOD_TYPES.GET,
            buildEnquiriesUrl({
                skip: nextSkip,
                limit: PARTIAL_MOBILE_BATCH_SIZE,
            })
        );
        if (!firstResponse) firstResponse = response;

        const page = parseEnquiriesPage(response);
        if (!page.enquiries.length) break;

        allEnquiries = allEnquiries.concat(page.enquiries);
        nextSkip += page.enquiries.length;
        total = page.total;
        pageCount += 1;

        if (page.isArrayResponse) break;
    }

    const matches = allEnquiries.filter((enquiry) =>
        String(enquiry?.mobile_number || "")
            .replace(/\D/g, "")
            .includes(mobileNumber)
    );
    const pageItems = matches.slice(skip, skip + limit);
    const originalData = firstResponse?.data || {};
    const originalPayload = originalData?.response;

    return {
        ...firstResponse,
        data: {
            ...originalData,
            response: {
                ...(originalPayload && !Array.isArray(originalPayload) ? originalPayload : {}),
                enquiries: pageItems,
                total: matches.length,
                skip,
                limit,
            },
        },
    };
};

export const getAllEnquiries = (param) => {
    const skip = Number.isFinite(Number(param?.skip)) ? Number(param.skip) : 0;
    const limit = Number.isFinite(Number(param?.limit)) ? Number(param.limit) : 10;
    const name = String(param?.name || "").trim();
    const mobileNumber = String(param?.mobile_number || "").replace(/\D/g, "");

    if (mobileNumber && mobileNumber.length < 10) {
        return getEnquiriesByPartialMobile({ skip, limit, mobileNumber });
    }

    return request(
        METHOD_TYPES.GET,
        buildEnquiriesUrl({ skip, limit, name, mobileNumber })
    );
}

export const getAllEnquiriesFilter = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllEnquiriesFilter+'?status='+param.status+'&month='+param.month+'&year='+param.year
    )
} 

export const getAllStudentsFilter = (param) => {
    return request(
        METHOD_TYPES.GET,
        ENDPOINTS.getAllStudentsFilter+'?month='+param.month+'&year='+param.year+'&status='+param.status+'&instructor_name='+param.instructor_name+'&test_date='+param.test_date
    )
}
