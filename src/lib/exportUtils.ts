import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// CSV export
export const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// PDF export
export const exportPDF = (
  title: string,
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: { label: string; value: string | number }[]
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(title, 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 14, 28);
  doc.text("MAXDAX FSM — Performance Report", 14, 34);

  let startY = 42;

  // Summary section
  if (summary && summary.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text("Summary", 14, startY);
    startY += 6;

    autoTable(doc, {
      startY,
      head: [["Metric", "Value"]],
      body: summary.map((s) => [s.label, String(s.value)]),
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Data table
  if (headers.length > 0 && rows.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text("Detailed Data", 14, startY);
    startY += 6;

    autoTable(doc, {
      startY,
      head: [headers],
      body: rows.map((r) => r.map(String)),
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14 },
    });
  }

  doc.save(`${filename}.pdf`);
};
