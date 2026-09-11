import PDFGenerator from "./pdfGenerator";
import { formatDate, getDaysDifference } from "./reportUtils";

export const generateEmployeeDetailsPDF = (employees, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  const stats = `Total: ${employees.length} | Active: ${employees.filter(e => e.status === "Active").length} | Inactive: ${employees.filter(e => e.status === "Inactive").length}`;
  
  pdf.addHeader("Employee Details Report", "", { ...filters, stats });

  const columns = [
    "S.No", "Emp ID", "Name", "Company", "Department", "Designation",
    "Passport No", "Passport Expiry", "Visa No", "Visa Expiry",
    "Labor No", "Labor Expiry", "EID No", "EID Expiry", "Joining Date",
    "Email", "Phone", "Status"
  ];

  const data = employees.map((emp, index) => [
    index + 1,
    emp.emp_id,
    emp.name,
    emp.company_name,
    emp.department_name,
    emp.designation_name,
    emp.passport_no,
    formatDate(emp.passport_expiry),
    emp.visa_no,
    formatDate(emp.visa_expiry),
    emp.labor_no,
    formatDate(emp.labor_expiry),
    emp.eid_no,
    formatDate(emp.eid_expiry),
    formatDate(emp.joining_date),
    emp.email,
    emp.phone,
    emp.status,
  ]);

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`employee_details_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateAttendancePDF = (records, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  // Helper function to check if overtime exists (handles both string and number)
  const hasOvertimeValue = (overtime) => {
    if (!overtime || overtime === "-" || overtime === "0" || overtime === 0) return false;
    // If it's a string like "5 mins", "1 hour 32 mins", it has overtime
    if (typeof overtime === 'string' && overtime.trim() !== "") return true;
    // If it's a number greater than 0
    if (typeof overtime === 'number' && overtime > 0) return true;
    return false;
  };

  // Update stats calculation to include overtime
  const totalPresent = records.filter(r => {
    const status = String(r.status || r.attendance_status || "").toLowerCase();
    return status === "present" || status === "full day" || status === "fullday";
  }).length;
  const totalAbsent = records.filter(r => {
    const status = String(r.status || r.attendance_status || "").toLowerCase();
    return status === "absent";
  }).length;
  const totalLate = records.filter(r => {
    const status = String(r.status || r.attendance_status || "").toLowerCase();
    return status === "late";
  }).length;
  const totalHalfDay = records.filter(r => {
    const status = String(r.status || r.attendance_status || "").toLowerCase();
    return status === "half day" || status === "halfday";
  }).length;
  const totalOvertime = records.filter(r => hasOvertimeValue(r.overtime)).length;
  
  const stats = `Total: ${records.length} | Present: ${totalPresent} | Late: ${totalLate} | Half Day: ${totalHalfDay} | Absent: ${totalAbsent} | Overtime: ${totalOvertime}`;
  
  pdf.addHeader("Attendance Report", `Period: ${filters.start_date} to ${filters.end_date}`, { ...filters, stats });

  // Updated columns - added OVERTIME column
  const columns = ["S.No", "Date", "Employee", "Department", "Punch In", "Punch Out", "Worked Hours", "Overtime", "Is Overtime", "Status"];

  // Helper function to format worked hours (handles both number and string)
  const formatWorkedHours = (hours) => {
    if (!hours || hours === 0 || hours === "0" || hours === "-") return "-";
    
    let numHours;
    if (typeof hours === 'string') {
      // If it's already a formatted string like "9 hrs 5 mins", return as-is
      if (hours.includes('hr') || hours.includes('min') || hours.includes('hour')) {
        return hours;
      }
      numHours = parseFloat(hours);
    } else {
      numHours = hours;
    }
    
    if (isNaN(numHours) || numHours === 0) return "-";
    const h = Math.floor(numHours);
    const m = Math.round((numHours - h) * 60);
    if (h === 0) return `${m} mins`;
    if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${h} hr${h > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusLower = String(status || "").toLowerCase();
    const statusMap = {
      "present": "Full Day",
      "full day": "Full Day",
      "fullday": "Full Day",
      "absent": "Absent",
      "late": "Late",
      "half day": "Half Day",
      "halfday": "Half Day",
      "holiday": "Holiday",
      "leave": "Leave",
    };
    return statusMap[statusLower] || status || "Unknown";
  };

  // Build the data array
  const data = records.map((record, index) => {
    const status = record.status || record.attendance_status || "Present";
    const hasOvertime = hasOvertimeValue(record.overtime);
    
    // Get the overtime display value (as-is from API)
    const overtimeDisplay = hasOvertime ? record.overtime : "-";
    
    // Format worked hours - if it's already formatted, keep it
    let workedHoursDisplay = record.worked_hours || record.working_hours;
    if (workedHoursDisplay && typeof workedHoursDisplay === 'number') {
      workedHoursDisplay = formatWorkedHours(workedHoursDisplay);
    } else if (workedHoursDisplay && typeof workedHoursDisplay === 'string') {
      // If it's a string that already contains 'hr' or 'min', keep it as-is
      if (workedHoursDisplay.includes('hr') || workedHoursDisplay.includes('min') || workedHoursDisplay.includes('hour')) {
        // Keep as-is
      } else {
        workedHoursDisplay = formatWorkedHours(workedHoursDisplay);
      }
    } else {
      workedHoursDisplay = "-";
    }
    
    return [
      index + 1,
      record.date || "-",
      record.employeeName || record.name || "-",
      record.department || "-",
      record.punchIn || record.punch_in || "-",
      record.punchOut || record.punch_out || (record.punchOut === null ? "Not Punched Out" : "-"),
      workedHoursDisplay,
      overtimeDisplay,
      (hasOvertime || record.is_overtime) ? "Yes" : "No",
      getStatusLabel(status) + (hasOvertime ? " + OT" : ""),
    ];
  });

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`attendance_report_${filters.start_date}_to_${filters.end_date}.pdf`);
};

export const generateTaskReportPDF = (records, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  const total = records.length;
  const withRemarks = records.filter(r => r.remarks && r.remarks.trim()).length;
  const stats = `Total: ${total} | With Remarks: ${withRemarks}`;
  
  let filterText = `Period: ${filters.start_date} to ${filters.end_date}`;
  if (filters.employee) filterText += ` | Employee: ${filters.employee}`;
  if (filters.search) filterText += ` | Search: "${filters.search}"`;
  
  pdf.addHeader("Task Report", filterText, { ...filters, stats });

  const columns = [
    "S.No", "Date", "Employee", "Tasks Completed", 
    "Pending Tasks", "Plan for Tomorrow", "Remarks"
  ];

  const data = records.map((report, index) => [
    index + 1,
    report.date || "-",
    report.employee || "-",
    report.tasksCompleted || "-",
    report.pendingTasks || "-",
    report.planForTomorrow || "-",
    report.remarks || "-",
  ]);

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`task_report_${filters.start_date}_to_${filters.end_date}.pdf`);
};


export const generateLeavesPDF = (leaves, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  // Helper function to get full employee name
  const getEmployeeFullName = (leave) => {
    if (leave.employee) {
      const firstName = leave.employee.first_name || '';
      const lastName = leave.employee.last_name || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    if (leave.employee_name) return leave.employee_name;
    if (leave.employee?.name) return leave.employee.name;
    if (leave.employee?.first_name) return leave.employee.first_name;
    return "-";
  };

  // Helper function to get reason with fallback
  const getReason = (leave) => {
    return leave.reason || leave.remarks || leave.admin_remark || "-";
  };

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    try {
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString("en-GB");
      }
      if (typeof dateValue === "string") {
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateValue.split("-");
          return `${day}/${month}/${year}`;
        }
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB");
        }
      }
      return dateValue;
    } catch (error) {
      return dateValue || "-";
    }
  };

  // Calculate stats
  const pending = leaves.filter(l => 
    (l.status || "").toLowerCase() === "pending"
  ).length;
  const approved = leaves.filter(l => 
    (l.status || "").toLowerCase() === "approved"
  ).length;
  const rejected = leaves.filter(l => 
    (l.status || "").toLowerCase() === "rejected"
  ).length;
  
  const stats = `Total: ${leaves.length} | Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}`;
  
  pdf.addHeader("Leave Requests Report", "", { ...filters, stats });

  // Updated columns to include Reason
  const columns = [
    "S.No", 
    "Request Date", 
    "Employee", 
    "Leave Type", 
    "From", 
    "To", 
    "Days", 
    "Reason", 
    "Status"
  ];

  // Prepare data with all fields
  const data = leaves.map((leave, index) => [
    index + 1,
    formatDate(leave.created_at || leave.request_date || leave.date),
    getEmployeeFullName(leave),
    leave.leave_type?.name || leave.type || leave.leave_type || "-",
    formatDate(leave.from_date || leave.fromDate || leave.start_date),
    formatDate(leave.to_date || leave.toDate || leave.end_date),
    leave.number_of_days || leave.days || leave.duration_days || "-",
    getReason(leave),
    leave.status || "-",
  ]);

  // Add table with adjusted column width (58 instead of 55 for more columns)
  pdf.addTable(columns, data, 58);
  pdf.addFooter();
  pdf.save(`leave_requests_${new Date().toISOString().split("T")[0]}.pdf`);
};
export const generateEmployeeExpiryPDF = (employees, title, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  const expiring7 = employees.filter(e => e.daysLeft <= 7).length;
  const expiring15 = employees.filter(e => e.daysLeft > 7 && e.daysLeft <= 15).length;
  const expiring30 = employees.filter(e => e.daysLeft > 15 && e.daysLeft <= 30).length;
  const stats = `Total: ${employees.length} | 7 days: ${expiring7} | 15 days: ${expiring15} | 30 days: ${expiring30}`;
  
  pdf.addHeader(title, `Expiry period: ${filters.expiryDays || 30} days`, { ...filters, stats });

  const columns = ["S.No", "Emp ID", "Name", "Company", "Department", "Passport Expiry", "Visa Expiry", "Labor Expiry", "EID Expiry", "Days Left"];

  const data = employees.map((emp, index) => [
    index + 1,
    emp.emp_id,
    emp.name,
    emp.company_name,
    emp.department_name,
    formatDate(emp.passport_expiry),
    formatDate(emp.visa_expiry),
    formatDate(emp.labor_expiry),
    formatDate(emp.eid_expiry),
    emp.daysLeft ? `${emp.daysLeft} days` : "-",
  ]);

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`${title.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateCompanyExpiryPDF = (companies, title, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  const stats = `Total companies with expiring documents: ${companies.length}`;
  
  pdf.addHeader(title, `Expiry period: ${filters.expiryDays || 30} days`, { ...filters, stats });

  const columns = ["S.No", "Company Name", "Trade License", "TL Expiry", "Days Left (TL)", "Est. Card", "EC Expiry", "Days Left (EC)"];

  const data = companies.map((company, index) => [
    index + 1,
    company.name,
    company.trade_license_number || "-",
    formatDate(company.trade_license_expiry),
    getDaysDifference(company.trade_license_expiry) || "-",
    company.establishment_card_number || "-",
    formatDate(company.establishment_card_expiry),
    getDaysDifference(company.establishment_card_expiry) || "-",
  ]);

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`${title.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateEmployeeUpcomingRenewalsPDF = (employees, title, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  // Calculate statistics
  const totalEmployees = employees.length;
  const renewing31to45 = employees.filter(emp => {
    const earliest = getEarliestUpcomingExpiryForEmployee(emp, filters.minDays || 31, filters.maxDays || 90);
    return earliest && earliest.days >= 31 && earliest.days <= 45;
  }).length;
  const renewing46to60 = employees.filter(emp => {
    const earliest = getEarliestUpcomingExpiryForEmployee(emp, filters.minDays || 31, filters.maxDays || 90);
    return earliest && earliest.days >= 46 && earliest.days <= 60;
  }).length;
  const renewing61to90 = employees.filter(emp => {
    const earliest = getEarliestUpcomingExpiryForEmployee(emp, filters.minDays || 31, filters.maxDays || 90);
    return earliest && earliest.days >= 61 && earliest.days <= 90;
  }).length;

  const stats = `Total: ${totalEmployees} | 31-45 days: ${renewing31to45} | 46-60 days: ${renewing46to60} | 61-90 days: ${renewing61to90}`;
  
  // Create filter summary text
  let filterText = `Renewal period: ${filters.minDays || 31} to ${filters.maxDays || 90} days from today`;
  if (filters.company && filters.company !== "all") filterText += ` | Company: ${filters.company}`;
  if (filters.department && filters.department !== "all") filterText += ` | Department: ${filters.department}`;
  if (filters.search) filterText += ` | Search: "${filters.search}"`;
  
  pdf.addHeader(title, filterText, { ...filters, stats });

  const columns = [
    "S.No", "Emp ID", "Name", "Company", "Department",
    "Passport Expiry", "Visa Expiry", "Labor Expiry", "EID Expiry", "Days Left (Earliest)"
  ];

  const data = employees.map((emp, index) => {
    // Find earliest upcoming expiry
    const minDays = filters.minDays || 31;
    const maxDays = filters.maxDays || 90;
    
    const expiryItems = [
      { date: emp.passport_expiry, name: "Passport", key: "passport" },
      { date: emp.visa_expiry, name: "Visa", key: "visa" },
      { date: emp.labor_expiry, name: "Labor", key: "labor" },
      { date: emp.eid_expiry, name: "EID", key: "eid" },
    ].map(item => ({
      ...item,
      days: getDaysDifference(item.date)
    })).filter(
      item => item.days !== null && item.days >= minDays && item.days <= maxDays
    );

    const earliest = expiryItems.length > 0 ? 
      expiryItems.reduce((min, item) => item.days < min.days ? item : min, expiryItems[0]) : 
      null;

    // Get the earliest days left display
    let daysLeftDisplay = "-";
    if (earliest) {
      let bgColor = "";
      if (earliest.days >= 31 && earliest.days <= 45) bgColor = "blue";
      else if (earliest.days >= 46 && earliest.days <= 60) bgColor = "cyan";
      // eslint-disable-next-line no-unused-vars
      else if (earliest.days >= 61 && earliest.days <= 90) bgColor = "green";
      daysLeftDisplay = `${earliest.days} days (${earliest.name})`;
    }

    return [
      index + 1,
      emp.emp_id || "-",
      emp.name || "-",
      emp.company_name || "-",
      emp.department_name || "-",
      formatDate(emp.passport_expiry),
      formatDate(emp.visa_expiry),
      formatDate(emp.labor_expiry),
      formatDate(emp.eid_expiry),
      daysLeftDisplay,
    ];
  });

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`${title.toLowerCase().replace(/ /g, "_")}_${filters.minDays || 31}_${filters.maxDays || 90}days_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Helper function to get earliest upcoming expiry for an employee
const getEarliestUpcomingExpiryForEmployee = (employee, minDays, maxDays) => {
  const expiryItems = [
    { date: employee.passport_expiry, name: "Passport" },
    { date: employee.visa_expiry, name: "Visa" },
    { date: employee.labor_expiry, name: "Labor" },
    { date: employee.eid_expiry, name: "EID" },
  ].map(item => ({
    ...item,
    days: getDaysDifference(item.date)
  })).filter(
    item => item.days !== null && item.days >= minDays && item.days <= maxDays
  );

  if (expiryItems.length === 0) return null;
  return expiryItems.reduce((min, item) => item.days < min.days ? item : min, expiryItems[0]);
};

export const generateCompanyUpcomingRenewalsPDF = (companies, title, filters = {}) => {
  const pdf = new PDFGenerator();
  pdf.init("landscape");

  const stats = `Total companies with upcoming renewals: ${companies.length} | Period: ${filters.minDays || 31}-${filters.maxDays || 90} days`;
  
  // Create filter summary text
  let filterText = `Renewal period: ${filters.minDays || 31} to ${filters.maxDays || 90} days from today`;
  if (filters.search) {
    filterText += ` | Search: "${filters.search}"`;
  }
  
  pdf.addHeader(title, filterText, { ...filters, stats });

  const columns = [
    "S.No", 
    "Company Name", 
    "Trade License", 
    "TL Expiry", 
    "Days Left (TL)", 
    "Est. Card", 
    "EC Expiry", 
    "Days Left (EC)"
  ];

  const data = companies.map((company, index) => {
    const tlDays = getDaysDifference(company.trade_license_expiry);
    const ecDays = getDaysDifference(company.establishment_card_expiry);
    
    return [
      index + 1,
      company.name,
      company.trade_license_number || "-",
      formatDate(company.trade_license_expiry),
      tlDays !== null && tlDays >= (filters.minDays || 31) && tlDays <= (filters.maxDays || 90) ? `${tlDays} days` : "-",
      company.establishment_card_number || "-",
      formatDate(company.establishment_card_expiry),
      ecDays !== null && ecDays >= (filters.minDays || 31) && ecDays <= (filters.maxDays || 90) ? `${ecDays} days` : "-",
    ];
  });

  pdf.addTable(columns, data, 55);
  pdf.addFooter();
  pdf.save(`${title.toLowerCase().replace(/ /g, "_")}_${filters.minDays || 31}_${filters.maxDays || 90}days_${new Date().toISOString().split("T")[0]}.pdf`);
};