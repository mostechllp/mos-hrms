export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getDaysDifference = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(dateStr);
  if (isNaN(expiryDate.getTime())) return null;
  return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
};

export const exportToCSV = (data, headers, filename) => {
  const rows = data.map((item) =>
    headers.map((header) => {
      let value = item[header.key] !== undefined ? item[header.key] : "-";
      if (value && typeof value === "object") value = JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    })
  );

  const csvContent = [
    headers.map((h) => h.label).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};