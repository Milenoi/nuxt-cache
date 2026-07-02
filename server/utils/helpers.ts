/**
 * Format a date string as e.g. "Jul 1, 2026".
 *
 * @param {string} dateString - The input date string to be formatted.
 * @return {string} The formatted date string.
 */
const getFormatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

export { getFormatDate };
