import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  init(orientation = "landscape") {
    this.doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4",
    });
    return this.doc;
  }

  addHeader(title, subtitle = "", filters = {}) {
    if (!this.doc) return;

    // Title
    this.doc.setFontSize(18);
    this.doc.setTextColor(46, 204, 113);
    this.doc.text(title, 14, 20);

    // Subtitle / Generation date
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    let dateStr = `Generated: ${new Date().toLocaleString()}`;
    this.doc.text(dateStr, 14, 28);

    // Filters summary if any
    let yOffset = 35;
    if (subtitle) {
      this.doc.setFontSize(9);
      this.doc.text(subtitle, 14, yOffset);
      yOffset += 7;
    }

    if (Object.keys(filters).length > 0) {
      const filterTexts = [];
      if (filters.company && filters.company !== "all")
        filterTexts.push(`Company: ${filters.company}`);
      if (filters.department && filters.department !== "all")
        filterTexts.push(`Department: ${filters.department}`);
      if (filters.status && filters.status !== "all")
        filterTexts.push(`Status: ${filters.status}`);
      if (filters.dateRange) filterTexts.push(`Period: ${filters.dateRange}`);
      if (filters.expiryDays) filterTexts.push(`Expiry: ${filters.expiryDays} days`);
      if (filters.minDays && filters.maxDays)
        filterTexts.push(`Renewal: ${filters.minDays}-${filters.maxDays} days`);

      if (filterTexts.length > 0) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(120, 120, 120);
        this.doc.text(filterTexts.join(" | "), 14, yOffset);
        yOffset += 7;
      }
    }

    // Summary stats
    if (filters.stats) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(filters.stats, 14, yOffset);
      yOffset += 7;
    }

    return yOffset;
  }

  addTable(columns, data, startY = 48, options = {}) {
    if (!this.doc) return;

    const defaultOptions = {
      theme: "striped",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: startY, left: 14, right: 14, bottom: 20 },
    };

    autoTable(this.doc, {
      ...defaultOptions,
      ...options,
      head: [columns],
      body: data,
    });
  }

  addFooter() {
    if (!this.doc) return;

    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() - 20,
        this.doc.internal.pageSize.getHeight() - 10
      );
    }
  }

  save(filename) {
    if (!this.doc) return;
    this.doc.save(filename);
  }
}

export default PDFGenerator;