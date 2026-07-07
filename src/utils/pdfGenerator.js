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

    // Dark navy blue color
    const primaryColor = [2, 12, 77]; // #020c4d

    // Title - using primary color
    this.doc.setFontSize(18);
    this.doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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

    // Summary stats - using primary color for emphasis
    if (filters.stats) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      this.doc.text(filters.stats, 14, yOffset);
      yOffset += 7;
    }

    // Add a decorative line under the header
    this.doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.setLineWidth(0.5);
    this.doc.line(14, yOffset + 2, this.doc.internal.pageSize.getWidth() - 14, yOffset + 2);

    return yOffset + 5;
  }

  addTable(columns, data, startY = 48, options = {}) {
    if (!this.doc) return;

    // Dark navy blue color
    const primaryColor = [2, 12, 77];
    const primaryLight = [40, 60, 120];

    const defaultOptions = {
      theme: "striped",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: primaryColor, // #020c4d
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 249, 253], // Very light blue tint
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

    const primaryColor = [2, 12, 77];
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add a footer line
      this.doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      this.doc.setLineWidth(0.3);
      this.doc.line(
        14, 
        this.doc.internal.pageSize.getHeight() - 12,
        this.doc.internal.pageSize.getWidth() - 14,
        this.doc.internal.pageSize.getHeight() - 12
      );
      
      // Page number
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() - 20,
        this.doc.internal.pageSize.getHeight() - 5
      );
      
      // Generated date on the left
      this.doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        14,
        this.doc.internal.pageSize.getHeight() - 5
      );
    }
  }

  save(filename) {
    if (!this.doc) return;
    this.doc.save(filename);
  }
}

export default PDFGenerator;