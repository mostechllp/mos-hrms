import { forwardRef, useState, useEffect, useRef } from "react";

const DateInput = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "dd/mm/yyyy",
      className = "",
      error = false,
      onBlur,
      type = "general", // "general", "dob", "joining", "custom"
      ...props
    },
  ) => {
    const [displayValue, setDisplayValue] = useState("");
    const [internalError, setInternalError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef(null);

    // Get current date for validation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const minYear = 1900; // Minimum reasonable year
    const maxYear = currentYear + 50; // Allow up to 50 years in future

    // Check if date is in the future
    const isFutureDate = (year, month, day) => {
      const dateToCheck = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dateToCheck > today;
    };

    // Calculate age from date of birth
    const calculateAge = (year, month, day) => {
      let age = currentYear - year;
      const monthDiff = currentMonth - (month - 1);
      if (monthDiff < 0 || (monthDiff === 0 && currentDay < day)) {
        age--;
      }
      return age;
    };

    // Validate complete date with type-specific rules
    const isValidDate = (dateString) => {
      if (!dateString) return true;
      
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
      
      const [day, month, year] = dateString.split("/").map(Number);
      
      // Check year range
      if (year < minYear || year > maxYear) return false;
      
      // Check month range
      if (month < 1 || month > 12) return false;
      
      // Check day range
      if (!isValidDay(day, month, year)) return false;
      
      // Type-specific validations
      if (type === "dob") {
        // DOB cannot be in the future
        if (isFutureDate(year, month, day)) return false;
        
        // Calculate age
        const age = calculateAge(year, month, day);
        
        // Age should be reasonable (between 0 and 120)
        if (age > 120) return false;
      }
      
      return true;
    };

    // Validate day based on month and year
    const isValidDay = (day, month, year) => {
      if (day < 1 || day > 31) return false;
      
      // Days in each month
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      
      // Check for leap year
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (month === 2 && isLeapYear) {
        return day <= 29;
      }
      
      return day <= daysInMonth[month - 1];
    };

    // Format date from YYYY-MM-DD to DD/MM/YYYY for display
    const formatToDisplay = (dateValue) => {
      if (!dateValue) return "";
      
      // If it's already in DD/MM/YYYY format
      if (typeof dateValue === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        return dateValue;
      }
      
      // If it's in YYYY-MM-DD format
      if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split("-");
        return `${day}/${month}/${year}`;
      }
      
      // If it's a Date object
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        const day = String(dateValue.getDate()).padStart(2, "0");
        const month = String(dateValue.getMonth() + 1).padStart(2, "0");
        const year = dateValue.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return dateValue || "";
    };

    // Format from DD/MM/YYYY to YYYY-MM-DD for backend
    const formatToBackend = (dateString) => {
      if (!dateString) return "";
      
      // If it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Convert from DD/MM/YYYY to YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        return `${year}-${month}-${day}`;
      }
      
      return dateString;
    };

    // Get error message for invalid date
    const getErrorMessage = (dateString) => {
      if (!dateString || dateString.length !== 10) return null;
      
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return "Invalid format. Use DD/MM/YYYY";
      }
      
      const [day, month, year] = dateString.split("/").map(Number);
      
      if (year < minYear) {
        return `Year must be ${minYear} or later`;
      }
      
      if (year > maxYear) {
        return `Year cannot be beyond ${maxYear}`;
      }
      
      if (month < 1 || month > 12) {
        return "Month must be between 01 and 12";
      }
      
      if (!isValidDay(day, month, year)) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        let maxDays = daysInMonth[month - 1];
        if (month === 2 && isLeapYear) maxDays = 29;
        
        return `Day must be between 01 and ${maxDays} for month ${month}`;
      }
      
      // Type-specific error messages
      if (type === "dob") {
        if (isFutureDate(year, month, day)) {
          return "Date of birth cannot be in the future";
        }
        
        const age = calculateAge(year, month, day);
        if (age > 120) {
          return "Date of birth seems too old (max 120 years)";
        }
        if (age < 0) {
          return "Invalid date of birth";
        }
      }
      
      return "Invalid date";
    };

    // Auto-format as user types
    const handleInputChange = (e) => {
      let rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits
      
      // Limit to 8 digits (DDMMYYYY)
      if (rawValue.length > 8) rawValue = rawValue.slice(0, 8);
      
      // Auto-format with slashes
      let formatted = "";
      if (rawValue.length > 0) {
        // Limit day to 31
        let dayPart = rawValue.slice(0, 2);
        if (parseInt(dayPart) > 31 && dayPart.length === 2) {
          dayPart = "31";
        }
        formatted = dayPart;
        
        if (rawValue.length >= 2) {
          // Limit month to 12
          let monthPart = rawValue.slice(2, 4);
          if (parseInt(monthPart) > 12 && monthPart.length === 2) {
            monthPart = "12";
          }
          formatted += "/" + monthPart;
        }
        
        if (rawValue.length >= 4) {
          let yearPart = rawValue.slice(4, 8);
          // Limit year length
          if (yearPart.length > 4) yearPart = yearPart.slice(0, 4);
          formatted += "/" + yearPart;
        }
      }
      
      setDisplayValue(formatted);
      setInternalError(false);
      setErrorMessage("");
      
      // Validate and send to form
      if (formatted.length === 10) {
        if (isValidDate(formatted)) {
          const backendDate = formatToBackend(formatted);
          onChange(backendDate);
        } else {
          setInternalError(true);
          setErrorMessage(getErrorMessage(formatted));
        }
      } else if (formatted.length === 0) {
        onChange("");
      }
    };

    const handleBlur = (e) => {
      let value = e.target.value;
      
      // If field is empty, clear the value
      if (!value) {
        onChange("");
        setDisplayValue("");
        setInternalError(false);
        setErrorMessage("");
        if (onBlur) onBlur(e);
        return;
      }
      
      // Try to auto-complete partial dates
      if (value.length > 0 && value.length < 10) {
        const digits = value.replace(/\D/g, "");
        
        if (digits.length >= 2) {
          let day = digits.slice(0, 2);
          let month = digits.length >= 4 ? digits.slice(2, 4) : "01";
          let year = digits.length >= 8 ? digits.slice(4, 8) : currentYear.toString();
          
          // Ensure day is valid (01-31)
          let dayNum = parseInt(day);
          dayNum = Math.min(Math.max(dayNum, 1), 31);
          day = dayNum.toString().padStart(2, "0");
          
          // Ensure month is valid (01-12)
          let monthNum = parseInt(month);
          monthNum = Math.min(Math.max(monthNum, 1), 12);
          month = monthNum.toString().padStart(2, "0");
          
          // Ensure year is valid
          let yearNum = parseInt(year);
          if (yearNum < minYear) yearNum = minYear;
          if (yearNum > maxYear) yearNum = maxYear;
          year = yearNum.toString();
          
          const formatted = `${day}/${month}/${year}`;
          
          if (isValidDate(formatted)) {
            setDisplayValue(formatted);
            const backendDate = formatToBackend(formatted);
            onChange(backendDate);
            setInternalError(false);
            setErrorMessage("");
          } else {
            setDisplayValue(formatted);
            setInternalError(true);
            setErrorMessage(getErrorMessage(formatted));
          }
        }
      }
      
      // Validate and show error styling
      if (value.length === 10) {
        if (isValidDate(value)) {
          setInternalError(false);
          setErrorMessage("");
          const backendDate = formatToBackend(value);
          onChange(backendDate);
        } else {
          setInternalError(true);
          setErrorMessage(getErrorMessage(value));
        }
      }
      
      if (onBlur) onBlur(e);
    };

    // Update display value when prop value changes
    useEffect(() => {
      const newDisplayValue = formatToDisplay(value);
      setDisplayValue(newDisplayValue);
      setInternalError(false);
      setErrorMessage("");
    }, [value]);

    // Determine if there's an error (either from prop or internal validation)
    const showError = error || internalError;
    const displayErrorMessage = errorMessage || (error && "Invalid date");

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${
            showError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          } ${className}`}
          {...props}
        />
        {showError && displayValue && displayValue.length === 10 && displayErrorMessage && (
          <p className="mt-1 text-xs text-red-500 absolute -bottom-5 left-0 whitespace-nowrap">
            {displayErrorMessage}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;