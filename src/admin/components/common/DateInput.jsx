import { forwardRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateInput = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "dd/mm/yyyy",
      className = "",
      error = false,
      onBlur,
      minDate,
      maxDate,
      type = "general",
      ...props
    },
    // eslint-disable-next-line no-unused-vars
    ref 
  ) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [internalError, setInternalError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Helper function to parse date from string (DD/MM/YYYY) to Date object
    const parseDate = (dateValue) => {
      if (!dateValue) return null;
      
      // If it's already a Date object
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }
      
      // If it's a string in YYYY-MM-DD format
      if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split("-");
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // If it's a string in DD/MM/YYYY format
      if (typeof dateValue === "string" && dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateValue.split("/");
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    };

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate min and max dates based on type
    const getMinDate = () => {
      if (minDate) return minDate;
      if (type === "dob") {
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);
        return hundredYearsAgo;
      }
      if (type === "special_day") {
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);
        return hundredYearsAgo;
      }
      return null;
    };

    const getMaxDate = () => {
      if (maxDate) return maxDate;
      if (type === "dob") {
        // Age must be at least 18
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
        return eighteenYearsAgo;
      }
      if (type === "special_day") {
        return today;
      }
      return null;
    };

    const validateDate = (date) => {
      if (!date) {
        setInternalError(false);
        setErrorMessage("");
        return true;
      }
      
      if (type === "dob") {
        // Check if date is in the future
        if (date > today) {
          setInternalError(true);
          setErrorMessage("Date of birth cannot be in the future");
          return false;
        }
        
        // Check if date is too old (more than 100 years)
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);
        if (date < hundredYearsAgo) {
          setInternalError(true);
          setErrorMessage("Date of birth seems too old (max 100 years)");
          return false;
        }
        
        // Check if age is reasonable (minimum 18 years for employment)
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
        if (date > eighteenYearsAgo) {
          setInternalError(true);
          setErrorMessage("Employee must be at least 18 years old");
          return false;
        }
      }
      
      if (type === "special_day") {
        // Special days (birthdays, anniversaries) cannot be in the future
        if (date > today) {
          setInternalError(true);
          setErrorMessage("Date cannot be in the future");
          return false;
        }
      }
      
      setInternalError(false);
      setErrorMessage("");
      return true;
    };

    const handleDateChange = (date) => {
      setSelectedDate(date);
      
      if (validateDate(date)) {
        if (onChange) {
          if (date && date instanceof Date && !isNaN(date.getTime())) {
            // Format as YYYY-MM-DD for form state
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            onChange(`${year}-${month}-${day}`);
          } else {
            onChange("");
          }
        }
      } else {
        // Clear the form value when invalid date is selected
        if (onChange) {
          onChange("");
        }
      }
    };

    const handleBlur = (e) => {
      if (onBlur) onBlur(e);
    };

    // Update selectedDate when value changes externally
    useEffect(() => {
      const newDate = parseDate(value);
      setSelectedDate(newDate);
      
      if (newDate) {
        validateDate(newDate);
      } else {
        setInternalError(false);
        setErrorMessage("");
      }
    }, [value]);

    // Custom input component - FIXED: Added onChange parameter
    const CustomInput = forwardRef(({ value: inputValue, onClick, onChange: onInputChange, onBlur: inputOnBlur }, customRef) => {
      // Format the display value as DD/MM/YYYY
      let displayValue = "";
      if (inputValue) {
        // If inputValue is a Date object
        if (inputValue instanceof Date && !isNaN(inputValue.getTime())) {
          const day = String(inputValue.getDate()).padStart(2, "0");
          const month = String(inputValue.getMonth() + 1).padStart(2, "0");
          const year = inputValue.getFullYear();
          displayValue = `${day}/${month}/${year}`;
        } 
        // If inputValue is a string in YYYY-MM-DD format
        else if (typeof inputValue === "string" && inputValue.includes("-")) {
          const [year, month, day] = inputValue.split("-");
          displayValue = `${day}/${month}/${year}`;
        }
        // If inputValue is already in DD/MM/YYYY format
        else if (typeof inputValue === "string" && inputValue.includes("/")) {
          displayValue = inputValue;
        }
        // If it's something else, try to convert
        else if (typeof inputValue === "string") {
          displayValue = inputValue;
        }
      }

      const showError = error || internalError;

      // Determine placeholder text based on type
      const getPlaceholder = () => {
        if (type === "dob") return "dd/mm/yyyy";
        if (type === "special_day") return "dd/mm/yyyy";
        return placeholder;
      };

      return (
        <div className="relative w-full">
          <input
            ref={customRef}
            type="text"
            value={displayValue}
            onClick={onClick}
            onChange={onInputChange} // This is required by forwardRef
            onBlur={(e) => {
              inputOnBlur?.(e);
              handleBlur(e);
            }}
            placeholder={getPlaceholder()}
            readOnly
            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:ring-2 cursor-pointer ${
              showError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20"
            } ${className}`}
            {...props}
          />
        </div>
      );
    });

    CustomInput.displayName = "CustomInput";

    // Inject custom styles for react-datepicker to match header colors
    useEffect(() => {
      // Add style element for customizing react-datepicker appearance
      const styleId = "react-datepicker-custom-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          /* Override react-datepicker default styles to match theme */
          .react-datepicker {
            font-family: 'Poppins', sans-serif !important;
            background-color: var(--surface) !important;
            border-color: var(--border) !important;
            border-radius: 18px !important;
            box-shadow: var(--shadow-lg) !important;
          }
          
          .react-datepicker__header {
            background-color: var(--surface2) !important;
            border-bottom-color: var(--border) !important;
            border-radius: 18px 18px 0 0 !important;
          }
          
          .react-datepicker__current-month,
          .react-datepicker-time__header,
          .react-datepicker-year-header {
            color: var(--text) !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
          }
          
          .react-datepicker__day-name,
          .react-datepicker__day,
          .react-datepicker__time-name {
            color: var(--text) !important;
          }
          
          .react-datepicker__day-name {
            color: var(--muted) !important;
            font-weight: 500 !important;
          }
          
          .react-datepicker__day:hover,
          .react-datepicker__month-text:hover,
          .react-datepicker__quarter-text:hover,
          .react-datepicker__year-text:hover {
            background-color: var(--primary-very-light) !important;
            color: var(--primary-dark) !important;
          }
          
          .dark .react-datepicker__day:hover,
          .dark .react-datepicker__month-text:hover,
          .dark .react-datepicker__quarter-text:hover,
          .dark .react-datepicker__year-text:hover {
            background-color: rgba(46, 204, 113, 0.2) !important;
            color: var(--primary-color) !important;
          }
          
          .react-datepicker__day--selected,
          .react-datepicker__day--in-selecting-range,
          .react-datepicker__day--in-range,
          .react-datepicker__month-text--selected,
          .react-datepicker__month-text--in-selecting-range,
          .react-datepicker__month-text--in-range,
          .react-datepicker__quarter-text--selected,
          .react-datepicker__quarter-text--in-selecting-range,
          .react-datepicker__quarter-text--in-range,
          .react-datepicker__year-text--selected,
          .react-datepicker__year-text--in-selecting-range,
          .react-datepicker__year-text--in-range {
            background-color: var(--primary-color) !important;
            color: white !important;
          }
          
          .react-datepicker__day--keyboard-selected,
          .react-datepicker__month-text--keyboard-selected,
          .react-datepicker__quarter-text--keyboard-selected,
          .react-datepicker__year-text--keyboard-selected {
            background-color: var(--primary-light) !important;
            color: var(--primary-dark) !important;
          }
          
          .react-datepicker__day--today {
            font-weight: bold !important;
            position: relative !important;
          }
          
          .react-datepicker__day--today:not(.react-datepicker__day--selected) {
            color: var(--primary-color) !important;
          }
          
          .react-datepicker__navigation-icon::before {
            border-color: var(--muted) !important;
          }
          
          .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
            border-color: var(--primary-color) !important;
          }
          
          .react-datepicker__year-dropdown,
          .react-datepicker__month-dropdown,
          .react-datepicker__year-dropdown-container select,
          .react-datepicker__month-dropdown-container select {
            background-color: var(--surface) !important;
            border-color: var(--border) !important;
            color: var(--text) !important;
            border-radius: 10px !important;
          }
          
          .react-datepicker__year-dropdown,
          .react-datepicker__month-dropdown {
            background-color: var(--surface) !important;
            border-color: var(--border) !important;
            box-shadow: var(--shadow) !important;
          }
          
          .react-datepicker__year-option:hover,
          .react-datepicker__month-option:hover {
            background-color: var(--primary-very-light) !important;
            color: var(--primary-dark) !important;
          }
          
          .dark .react-datepicker__year-option:hover,
          .dark .react-datepicker__month-option:hover {
            background-color: rgba(46, 204, 113, 0.2) !important;
          }
          
          .react-datepicker__close-icon::after {
            background-color: var(--primary-color) !important;
          }
          
          .react-datepicker__triangle {
            display: none !important;
          }
          
          .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle,
          .react-datepicker-popper[data-placement^="top"] .react-datepicker__triangle {
            display: none !important;
          }
          
          /* Month/year dropdown header styling */
          .react-datepicker__header__dropdown {
            margin-top: 8px !important;
          }
          
          .react-datepicker__header__dropdown--scroll select {
            background-color: var(--surface2) !important;
            border: 1px solid var(--border) !important;
            color: var(--text) !important;
            padding: 4px 8px !important;
            border-radius: 8px !important;
            font-size: 0.85rem !important;
            cursor: pointer !important;
          }
          
          .react-datepicker__header__dropdown--scroll select:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
          }
          
          /* Day picker container */
          .react-datepicker__month-container {
            background-color: var(--surface) !important;
            border-radius: 18px !important;
            overflow: hidden !important;
          }
          
          /* Week days */
          .react-datepicker__day-names {
            background-color: var(--surface2) !important;
            padding-top: 8px !important;
          }
          
          /* Disabled days */
          .react-datepicker__day--disabled,
          .react-datepicker__month-text--disabled,
          .react-datepicker__quarter-text--disabled,
          .react-datepicker__year-text--disabled {
            color: var(--muted) !important;
            opacity: 0.5 !important;
          }
          
          /* Outside month days */
          .react-datepicker__day--outside-month {
            color: var(--muted) !important;
            opacity: 0.6 !important;
          }
        `;
        document.head.appendChild(style);
      }
    }, []);

    return (
      <div className="relative w-full">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          onBlur={handleBlur}
          dateFormat="dd/MM/yyyy"
          placeholderText={type === "dob" ? "dd/mm/yyyy" : type === "special_day" ? "dd/mm/yyyy" : placeholder}
          customInput={<CustomInput />}
          minDate={getMinDate()}
          maxDate={getMaxDate()}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className="w-full"
          calendarClassName="shadow-soft-lg rounded-lg border border-gray-200 dark:border-gray-700"
          popperClassName="z-50"
          {...props}
        />
        {internalError && errorMessage && (
          <p className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;