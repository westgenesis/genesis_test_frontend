import dayjs from "dayjs";

export const formatDateTime = (dateStr?: string | Date | number): string => {
  if (!dateStr) return "";
  console.log(dateStr);
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};
