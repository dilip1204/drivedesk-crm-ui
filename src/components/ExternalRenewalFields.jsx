import React from "react";
import "./ExternalRenewalFields.css";

export const EMPTY_EXTERNAL_RENEWAL_FORM = {
  renewal_type: "DL",
  name: "",
  mobile_number: "",
  document_number: "",
  license_classes: "",
  badge_number: "",
  issue_date: "",
  expiry_date: "",
  rto: "",
  enrollment_number: "",
  remarks: "",
};

const asText = (value) => String(value ?? "");

export const getExternalRenewalFieldName = (prefix, key) =>
  prefix && key === "renewal_type" ? `${prefix}type` : `${prefix}${key}`;

export const normalizeExternalRenewalForm = (item = {}) => {
  const safeItem = item || {};
  return {
    ...EMPTY_EXTERNAL_RENEWAL_FORM,
    ...safeItem,
    license_classes: Array.isArray(safeItem.license_classes)
      ? safeItem.license_classes.join(", ")
      : safeItem.license_classes || "",
    badge_number: safeItem.badge_number || "",
    remarks: safeItem.remarks || "",
  };
};

export const createExternalRenewalFields = (item = {}, prefix = "") => {
  const safeItem = item || {};
  const normalized = normalizeExternalRenewalForm(safeItem);
  return Object.keys(EMPTY_EXTERNAL_RENEWAL_FORM).reduce((fields, key) => {
    const fieldName = getExternalRenewalFieldName(prefix, key);
    fields[fieldName] = safeItem[fieldName] ?? normalized[key];
    return fields;
  }, {});
};

export const toExternalRenewalPayload = (
  values,
  { prefix = "", name, mobileNumber } = {}
) => {
  const get = (key) => values?.[getExternalRenewalFieldName(prefix, key)];
  const renewalType = asText(get("renewal_type") || "DL");
  const classes = asText(get("license_classes"))
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value, index, list) => value && list.indexOf(value) === index);

  return {
    renewal_type: renewalType,
    name: asText(name ?? get("name")).trim(),
    mobile_number: asText(mobileNumber ?? get("mobile_number")).trim(),
    document_number: asText(get("document_number")).trim(),
    license_classes: renewalType === "DL" ? classes : [],
    badge_number:
      renewalType === "CL" ? asText(get("badge_number")).trim() || null : null,
    issue_date: asText(get("issue_date")),
    expiry_date: asText(get("expiry_date")),
    rto: asText(get("rto")).trim(),
    enrollment_number: asText(get("enrollment_number")).trim(),
    remarks: asText(get("remarks")).trim() || null,
  };
};

export const validateExternalRenewal = (payload) => {
  if (
    !payload.name ||
    !payload.mobile_number ||
    !payload.document_number ||
    !payload.issue_date ||
    !payload.expiry_date
  ) {
    return "Name, mobile number, document number, issue date and expiry date are required.";
  }
  if (!/^\d{10}$/.test(payload.mobile_number)) {
    return "Mobile number must contain exactly 10 digits.";
  }
  if (payload.expiry_date < payload.issue_date) {
    return "Expiry date cannot be before issue date.";
  }
  return "";
};

export default function ExternalRenewalFields({
  values,
  onChange,
  onBlur,
  errors = {},
  touched = {},
  fieldPrefix = "",
  includeCustomerFields = true,
  disabled = false,
}) {
  const fieldName = (name) => getExternalRenewalFieldName(fieldPrefix, name);
  const fieldValue = (name) => values?.[fieldName(name)] ?? "";
  const fieldError = (name) =>
    touched?.[fieldName(name)] && errors?.[fieldName(name)];
  const inputClass = (name) =>
    `external-renewal-input${fieldError(name) ? " is-invalid" : ""}`;

  const renderField = (name, label, type = "text", required = false) => (
    <div className="external-renewal-field" key={name}>
      <label htmlFor={fieldName(name)}>
        {label} {required && <span className="required-mark">*</span>}
      </label>
      <input
        id={fieldName(name)}
        name={fieldName(name)}
        type={type}
        value={fieldValue(name)}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={name === "mobile_number" ? 10 : undefined}
        inputMode={name === "mobile_number" ? "numeric" : undefined}
        className={inputClass(name)}
      />
      {fieldError(name) && (
        <div className="external-renewal-error">{errors[fieldName(name)]}</div>
      )}
    </div>
  );

  return (
    <div className="external-renewal-fields">
      <div className="external-renewal-field">
        <label htmlFor={fieldName("renewal_type")}>
          Renewal Type <span className="required-mark">*</span>
        </label>
        <select
          id={fieldName("renewal_type")}
          name={fieldName("renewal_type")}
          value={fieldValue("renewal_type") || "DL"}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClass("renewal_type")}
        >
          <option value="DL">Driving Licence (DL)</option>
          <option value="CL">Conductor Licence (CL)</option>
        </select>
        {fieldError("renewal_type") && (
          <div className="external-renewal-error">
            {errors[fieldName("renewal_type")]}
          </div>
        )}
      </div>

      {includeCustomerFields && renderField("name", "Customer Name", "text", true)}
      {includeCustomerFields &&
        renderField("mobile_number", "Mobile Number", "tel", true)}
      {renderField("document_number", "Document / Licence Number", "text", true)}
      {renderField("issue_date", "Issue Date", "date", true)}
      {renderField("expiry_date", "Expiry Date", "date", true)}
      {renderField("rto", "RTO")}
      {renderField("enrollment_number", "Enrollment Number")}

      {fieldValue("renewal_type") === "CL" ? (
        renderField("badge_number", "Badge Number")
      ) : (
        <div className="external-renewal-field external-renewal-wide">
          <label htmlFor={fieldName("license_classes")}>Licence Classes</label>
          <input
            id={fieldName("license_classes")}
            name={fieldName("license_classes")}
            value={fieldValue("license_classes")}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={inputClass("license_classes")}
            placeholder="MCWG, LMV"
          />
          <small>Separate multiple classes with commas.</small>
          {fieldError("license_classes") && (
            <div className="external-renewal-error">
              {errors[fieldName("license_classes")]}
            </div>
          )}
        </div>
      )}

      <div className="external-renewal-field external-renewal-wide">
        <label htmlFor={fieldName("remarks")}>Renewal Remarks</label>
        <textarea
          id={fieldName("remarks")}
          name={fieldName("remarks")}
          rows="3"
          value={fieldValue("remarks")}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClass("remarks")}
        />
      </div>
    </div>
  );
}
