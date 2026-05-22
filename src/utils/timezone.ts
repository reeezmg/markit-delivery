export const getDeviceTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
