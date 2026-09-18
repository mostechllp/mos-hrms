import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiFileText,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiPrinter,
  FiSettings,
  FiLoader,
} from "react-icons/fi";
import {
  fetchEmployeeDetails,
  setStep,
  updateOfferLetter,
} from "../../store/slices/onboardingSlice";
import jsPDF from "jspdf";

const OfferLetterPreview = () => {
  const dispatch = useDispatch();

  const onboarding = useSelector((state) => state.onboarding);
  const employeeDetails = onboarding?.employeeDetails || {};
  const offerLetter = onboarding?.offerLetter || {};

  const [template, setTemplate] = useState(offerLetter.template || "standard");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Helpers ──
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "";
    const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatMoney = (val) => {
    if (val === undefined || val === null || val === "") return "0";
    const n = Number(val);
    if (isNaN(n)) return "0";
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const numberToWords = (num) => {
    const n = Number(num);
    if (isNaN(n)) return "";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (x) => {
      if (x < 20) return a[x];
      if (x < 100)
        return b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
      if (x < 1000)
        return (
          a[Math.floor(x / 100)] +
          " Hundred" +
          (x % 100 ? " " + inWords(x % 100) : "")
        );
      if (x < 100000)
        return (
          inWords(Math.floor(x / 1000)) +
          " Thousand" +
          (x % 1000 ? " " + inWords(x % 1000) : "")
        );
      if (x < 10000000)
        return (
          inWords(Math.floor(x / 100000)) +
          " Lakh" +
          (x % 100000 ? " " + inWords(x % 100000) : "")
        );
      return (
        inWords(Math.floor(x / 10000000)) +
        " Crore" +
        (x % 10000000 ? " " + inWords(x % 10000000) : "")
      );
    };
    return inWords(Math.round(n));
  };

  // ── Generate the FULL multi-page offer letter content ──
  // Page 1: main offer letter
  // Pages 2+: annexures (A through L)
  const generateContent = ({
    empName,
    designation,
    joiningDate,
    basicSalary,
    otherAllowance,
    totalSalary,
    paymentCycle,
    department,
  }) => {
    const today = new Date().toLocaleDateString("en-GB");
    const joinDateShort = formatDate(joiningDate) || "[Joining Date]";
    const joinDateLong = formatDateLong(joiningDate) || "[Joining Date]";

    const basic = Number(basicSalary) || 0;
    const other = Number(otherAllowance) || 0;
    const total = Number(totalSalary) || basic + other;

    const annualSalary = total * 12;
    const totalWords = numberToWords(total);
    const cycle = (paymentCycle || "Monthly").toLowerCase();
    const title = designation || "[Job Title]";
    const name = empName || "[Candidate Name]";
    const dept = department || "Software Development";

    return `# Offer of Employment - ${title}

Date: ${today}

To: ${name}

Subject: Offer of Employment at Mostech Business Solutions

Dear ${name},

Welcome to Mostech Business Solutions (MOS)!

It was a pleasure meeting you and discussing the opportunity to join our organization. Based on our discussions, we are pleased to offer you the position of ${title} at Mostech Business Solutions.

We are pleased to offer you a ${cycle} salary of INR ${formatMoney(
      total,
    )} (Rupees ${totalWords} only), equivalent to INR ${formatMoney(
      annualSalary,
    )} per annum. This offer is effective from ${joinDateLong}, which will be your joining date.

Your employment will initially be on a probation period of three (3) months. During probation, either party may terminate employment with 15 days' notice. Upon successful completion of the probation period, your services may be confirmed based on performance and company evaluation, and thereafter a one (1) month notice period will apply for resignation or termination. Salary and designation may be revised based on performance, company policies, and management decisions.

## Salary Structure

- Basic Salary: INR ${formatMoney(basic)}
- Housing and Other Allowances: INR ${formatMoney(other)}
- Total ${cycle.charAt(0).toUpperCase() + cycle.slice(1)} Salary: INR ${formatMoney(
      total,
    )}

## Duties and Responsibilities

As a ${title} at Mostech Business Solutions, your key duties and responsibilities include:

- Assisting in designing, developing, and maintaining websites and web applications based on requirements.
- Working with latest technologies under the guidance of senior developers.
- Assisting in project development, testing, debugging, and deployment of applications.
- Collaborating with designers and developers to convert UI/UX designs into responsive web pages.
- Learning and implementing best coding practices and maintaining proper documentation.
- Troubleshooting issues and assisting in optimizing websites for performance and security.
- Participating in team discussions, project planning, and development activities.

## Acknowledgment and Acceptance

I, ${name}, have read and understood the terms and conditions governing my employment with Mostech Business Solutions and hereby accept this offer in full. I confirm my acceptance and agree to report for work on ${joinDateLong}.

Signature: ____________________

Name: ${name}

Date: ____________________

--- PAGE BREAK ---

ANNEXURES

## Annexure A - Employment Terms

### A.1 - Place of Work

- Workplace: Both Work-from-Home (WFH) and Work-from-Office (WFO) options are available.
- Employees may work remotely, with the flexibility to work from the office if required or preferred.
- Office visits may be requested occasionally for meetings, training, or project-related requirements.

### A.2 - Working Hours

- Monday to Friday: 9:00 AM to 6:00 PM
- Saturday: 9:00 AM to 1:00 PM
- Sunday: Weekly off
- Occasional extended hours may be required depending on projects or client requirements.

### A.3 - Leave Policy

- You are entitled to 30 days total leave per calendar year, inclusive of annual leave, public holidays, and sick/casual leave.
- Detailed leave information is provided in Annexure C - Holiday Handbook.
- Any leave beyond this limit will be unpaid.
- Unused leave cannot be carried forward unless specifically approved by management.

### A.4 - Probation & Confirmation

- Probation: 3 months with 15-day notice period during probation.
- Confirmation: Post-probation, a one-month notice period applies.
- Salary and benefits may be revised at Company discretion after confirmation.

## Annexure B - Confidentiality & Intellectual Property

### B.1 - Ownership of Work

- All work, designs, content, or materials produced during your employment remain the exclusive property of Mostech Business Solutions.
- This includes work for clients handled by you during employment.

### B.2 - Confidentiality Obligations

- You must maintain confidentiality of all company and client information during and after employment.
- Disclosure of confidential information to unauthorized parties is strictly prohibited.

### B.3 - Data Protection

- All company data, client data, and proprietary materials must be securely stored.
- Use of company devices and platforms should comply with internal IT and security policies.
- Personal use of company data is prohibited without prior approval.

### B.4 - Non-Disclosure & Non-Compete

- You agree not to engage with competitors or disclose proprietary processes for 2 years post-employment. This covers intellectual property, trade secrets, and client-related information.

## Annexure C - Holiday Handbook

### C.1 - Public Holidays (Kerala-Optimized)

- New Year's Day
- Republic Day
- Maha Shivaratri
- Eid Al-Fitr (as per lunar calendar)
- Good Friday
- Vishu
- Easter
- Labour Day
- Eid Al-Adha
- Independence Day
- Onam / Thiruvonam Day
- Gandhi Jayanti
- Diwali
- Christmas
- Milad-un-Nabi (as per lunar calendar)

### C.2 - Sick/Casual Leave

- 12 working days per calendar year, included in the total 30-day leave limit.

### C.3 - Optional / Restricted Holidays

- Employees may choose to work on holidays not assigned to them and claim the leave in combination as needed.
- The maximum number of days that can be claimed together is 15 days.

## Annexure D - Compliance & Conduct

### D.1 - Policies & Procedures

- You are required to follow all company policies, procedures, and ethical standards.
- Misconduct, dishonesty, or policy violations may lead to disciplinary action or termination.

### D.2 - Gifts & Benefits

- Accepting gifts, commissions, or benefits from clients/vendors must be disclosed immediately to management.

### D.3 - Background Verification

- Employment is subject to successful completion of background verification.
- Any falsified or misleading information may result in immediate termination.

## Annexure E - Office Dress Code

### E.1 - Daily Dress Code

- Formal attire Monday to Friday
- Casual attire on Saturday

### E.2 - Traditional / Festive Dress

- Traditional attire allowed during cultural/company events.

### E.3 - Grooming & Appearance

- Professional grooming and hygiene standards are expected.

## Annexure F - Travel, Conferences & Exhibitions

### F.1 - Official Travel

- Employees may be required to travel for client meetings, conferences, exhibitions, or company events. Travel will be pre-approved and reimbursed.

### F.2 - Participation in Conferences / Exhibitions

- Employees representing the Company must follow professional behavior and branding guidelines.

### F.3 - Reporting During Travel

- During official travel, employees report to Team Lead or Operations Head.

## Annexure G - Reporting Structure & Performance

### G.1 - Reporting Lines

- Primary Reporting: Team Lead (day-to-day tasks)
- Secondary Reporting: Operations Head / Operations Manager (escalations & performance)

### G.2 - Performance Review

- Evaluations post-probation and periodically thereafter based on task completion, creativity, punctuality, teamwork, and policy adherence.

### G.3 - Feedback & Grievances

- Employees can provide feedback or report grievances to reporting managers.
- Zero tolerance for harassment, discrimination, or workplace misconduct.

## Annexure H - Workplace Ethics & Conduct

### H.1 - Anti-Discrimination & Diversity

- Workplace free from racism, sexism, or discrimination; respectful behavior expected.

### H.2 - Collaboration & Teamwork

- Employees must collaborate effectively and resolve conflicts professionally.

### H.3 - Company Property & Resources

- Responsible use of company property is required; unauthorized use prohibited.

### H.4 - Digital & Remote Work Etiquette

- Maintain professionalism during remote work or online meetings.

### H.5 - Confidentiality & Reporting Obligations

- Ethical breaches, data leaks, or misconduct must be reported to Team Lead or Operations Head.

## Annexure I - IT & Digital Policy

### I.1 - Use of Company Devices

- Computers, software, and internet access are for official purposes only.

### I.2 - Data Security

- Employees must use secure passwords and comply with IT security policies.

### I.3 - Social Media & Communication

- Public representation of the company on social media requires prior approval.

## Annexure J - Employee Welfare & Facilities

### J.1 - Health & Safety

- Employees must follow workplace safety guidelines.

### J.2 - Amenities

- Company provides necessary tools, software, and resources for efficient work.

## Annexure K - Employee Recognition & Awards

### K.1 - Rewards & Appreciation

- Exceptional performance may be recognized with awards, certificates, or incentives.

## Annexure L - Termination & Exit Policy

### L.1 - Notice Period

- Probation: 15 days
- Post-confirmation: 1 month

### L.2 - Final Settlement

- Salary and benefits will be settled as per company policies and statutory compliance.

### L.3 - Company Property Return

- All company property must be returned at the time of exit.`;
  };

  const [content, setContent] = useState("");

  const resolvedUserId =
    employeeDetails.userId ||
    (() => {
      try {
        return localStorage.getItem("onboarding_user_id");
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    if (resolvedUserId) {
      dispatch(fetchEmployeeDetails(resolvedUserId));
    }
  }, [dispatch, resolvedUserId]);

  const fullName =
    employeeDetails.fullName ||
    [employeeDetails.firstName, employeeDetails.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  const jobTitle =
    employeeDetails.designation ||
    employeeDetails.designationName ||
    employeeDetails.jobTitle ||
    employeeDetails.user?.designation?.name ||
    "";

  useEffect(() => {
    const initialContent =
      offerLetter.content ||
      generateContent({
        empName: fullName,
        designation: jobTitle,
        joiningDate: employeeDetails.joiningDate,
        basicSalary: employeeDetails.basicSalary,
        otherAllowance: employeeDetails.otherAllowance,
        totalSalary: employeeDetails.totalMonthlySalary,
        paymentCycle: employeeDetails.paymentCycle,
        department: employeeDetails.department,
      });
    setContent(initialContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeDetails, offerLetter.content]);

  const handleNext = () => {
    dispatch(updateOfferLetter({ content, template, generated: true }));
    dispatch(setStep(6));
  };

  const handleBack = () => {
    dispatch(setStep(4));
  };

  // ── Load logo as data URL ──
  const loadLogoDataUrl = () =>
    new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve({
              dataUrl: canvas.toDataURL("image/png"),
              width: canvas.width,
              height: canvas.height,
            });
          } catch (err) {
            console.warn("Logo canvas conversion failed:", err);
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = "/favicon-light.png";
      } catch {
        resolve(null);
      }
    });

  // ── PDF export (multi-page) ──
  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 20;
      const lineHeight = 6.2;

      const logo = await loadLogoDataUrl();

      let isFirstPage = true;

      // Helper: draw header (logo + title + rule) on the current page
      const drawHeader = (compact = false) => {
        if (logo?.dataUrl) {
          const maxLogoW = compact ? 12 : 16;
          const maxLogoH = compact ? 12 : 16;
          const ratio = logo.width / logo.height || 1;
          let drawW = maxLogoW;
          let drawH = maxLogoW / ratio;
          if (drawH > maxLogoH) {
            drawH = maxLogoH;
            drawW = maxLogoH * ratio;
          }
          doc.addImage(
            logo.dataUrl,
            "PNG",
            pageWidth / 2 - drawW / 2,
            12,
            drawW,
            drawH,
          );
        }

        const titleY = logo?.dataUrl ? (compact ? 28 : 36) : compact ? 18 : 22;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(compact ? 13 : 15);
        doc.setTextColor(44, 62, 80);
        doc.text("OFFER OF EMPLOYMENT", pageWidth / 2, titleY, {
          align: "center",
        });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(
          "Mostech Business Solutions (MOS)",
          pageWidth / 2,
          titleY + 5,
          { align: "center" },
        );

        const ruleY = titleY + 9;
        doc.setDrawColor(46, 204, 113);
        doc.setLineWidth(0.8);
        doc.line(margin, ruleY, pageWidth - margin, ruleY);

        return ruleY + 8; // starting Y for body
      };

      let y = drawHeader(false);

      // ── Split content into logical blocks ──
      // A "block" = a heading or a paragraph line.
      // We keep headings with the first following paragraph to avoid orphans.
      const lines = content.split("\n");

      const isHeading = (line) => {
        const t = line.trim();
        if (!t) return false;
        // Markdown-style headings
        if (/^#{1,6}\s+/.test(t)) return true;
        // ALL-CAPS lines longer than 3 chars
        if (t === t.toUpperCase() && t.length > 3 && /[A-Z]/.test(t)) {
          return true;
        }
        return false;
      };

      const isPageBreak = (line) => line.trim() === "--- PAGE BREAK ---";

      let i = 0;
      while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        // Explicit page break
        if (isPageBreak(raw)) {
          doc.addPage();
          isFirstPage = false;
          y = drawHeader(true);
          i++;
          continue;
        }

        // Blank line → small spacing
        if (!line) {
          y += 3;
          i++;
          continue;
        }

        // Handle heading
        if (isHeading(raw)) {
          // Convert markdown heading to plain text
          let text = line.replace(/^#{1,6}\s+/, "");
          const level = (raw.match(/^(#{1,6})/) || [, "##"])[1].length;

          // If not enough room for heading + at least 2 lines, page break
          if (y > bottomLimit - lineHeight * 3) {
            doc.addPage();
            isFirstPage = false;
            y = drawHeader(true);
          }

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(level <= 2 ? 12 : 11);
          doc.setTextColor(30, 41, 59);

          const headingLines = doc.splitTextToSize(text, maxLineWidth);
          headingLines.forEach((hl) => {
            doc.text(hl, margin, y);
            y += lineHeight + 0.5;
          });
          y += 1.5;

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(50, 50, 50);
          i++;
          continue;
        }

        // Regular paragraph — split to width
        const wrapped = doc.splitTextToSize(line, maxLineWidth);
        wrapped.forEach((wl) => {
          if (y > bottomLimit) {
            doc.addPage();
            isFirstPage = false;
            y = drawHeader(true);
          }
          doc.text(wl, margin, y);
          y += lineHeight;
        });
        y += 1;
        i++;
      }

      const filename = `Offer_Letter_${
        fullName.replace(/\s+/g, "_") || "Candidate"
      }.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF offer letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Print (browser print dialog) ──
  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Convert the markdown-ish content into HTML paragraphs & headings
    const html = content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return `<div style="height: 10px;"></div>`;
        if (trimmed === "--- PAGE BREAK ---")
          return `<div style="page-break-after: always;"></div>`;

        // Markdown headings
        const md = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (md) {
          const level = md[1].length;
          const text = md[2];
          const size = level === 1 ? 18 : level === 2 ? 15 : 13;
          return `<h${level} style="margin: 18px 0 8px; font-size: ${size}px; font-weight: 700; color: #1f2937;">${text}</h${level}>`;
        }

        // ALL-CAPS headings
        if (
          trimmed === trimmed.toUpperCase() &&
          trimmed.length > 3 &&
          /[A-Z]/.test(trimmed)
        ) {
          return `<h3 style="margin: 18px 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; color: #1f2937;">${trimmed}</h3>`;
        }

        // Bullets
        if (/^[-*]\s+/.test(trimmed)) {
          const text = trimmed.replace(/^[-*]\s+/, "");
          return `<li style="margin: 0 0 6px; line-height: 1.6; font-size: 13.5px; color: #1f2937;">${text}</li>`;
        }

        return `<p style="margin: 0 0 10px; line-height: 1.65; font-size: 13.5px; color: #1f2937; text-align: justify;">${trimmed}</p>`;
      })
      .join("");

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Offer Letter - ${fullName || "Candidate"}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #1f2937;
              padding: 10px;
            }
            .letterhead {
              text-align: center;
              border-bottom: 2px solid #2ecc71;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }
            .letterhead img {
              max-height: 60px;
              max-width: 180px;
              display: block;
              margin: 0 auto 10px;
              object-fit: contain;
            }
            .letterhead h1 {
              margin: 0 0 4px;
              font-size: 22px;
              color: #1f2937;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .letterhead .company {
              font-size: 12px;
              color: #4b5563;
              letter-spacing: 0.5px;
            }
            ul { padding-left: 20px; margin: 0 0 10px; }
            h1, h2, h3 { page-break-after: avoid; }
            p, li { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <img src="/favicon-light.png" alt="Mostech Business Solutions" />
            <h1>Offer of Employment</h1>
            <div class="company">Mostech Business Solutions (MOS)</div>
          </div>
          <div class="content">
            ${html}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  if (!onboarding)
    return <div className="p-10 text-center">Loading Onboarding Data...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Configuration Sidebar */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiSettings className="text-green-600" />
            Settings
          </h3>
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
            >
              <option value="standard">Standard MOS (Multi-page)</option>
              <option value="modern">Modern</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-6 text-center">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border hover:border-green-500 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <FiLoader size={20} className="text-green-600 animate-spin" />
              ) : (
                <FiDownload size={20} className="text-gray-400" />
              )}
              <span className="text-[10px] font-bold">
                {isGenerating ? "SAVING..." : "PDF"}
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border hover:border-green-500 transition-all flex flex-col items-center justify-center gap-2"
            >
              <FiPrinter size={20} className="text-gray-400" />
              <span className="text-[10px] font-bold">PRINT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-green-600" />
              <span className="text-sm font-bold">
                Offer Letter Preview (Multi-page)
              </span>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-inner outline-none resize-none font-serif text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900"
            >
              <FiChevronLeft size={20} /> Back
            </button>
            <button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Continue <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPreview;