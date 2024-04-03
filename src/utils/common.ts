export const formatTimestamp = (
  timestamp: number | string,
  format: string = "yyyy-MM-dd HH:mm:ss",
  includeMilliseconds: boolean = false
): string => {
  if (typeof timestamp === "string") {
    timestamp = parseInt(timestamp);
  }
  const date = includeMilliseconds
    ? new Date(timestamp)
    : new Date(timestamp * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("yyyy", String(year))
    .replace("MM", month)
    .replace("dd", day)
    .replace("HH", hour)
    .replace("mm", minute)
    .replace("ss", second);
};
