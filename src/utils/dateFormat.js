export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return "-";

  // Preserve day-month values for ISO-like strings without timezone shifts.
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateInput));
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
