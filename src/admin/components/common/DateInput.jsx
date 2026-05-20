import { forwardRef, useState } from "react";
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
      ...props
    },
  ) => {
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

    const handleDateChange = (date) => {
      setSelectedDate(date);
      if (onChange) {
        // Format as YYYY-MM-DD for backend
        if (date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          onChange(`${year}-${month}-${day}`);
        } else {
          onChange("");
        }
      }
    };

    // Custom input component that triggers calendar on click
    const CustomInput = forwardRef(({ value: inputValue, onClick, onBlur: inputOnBlur }, customRef) => {
      // Format display value as DD/MM/YYYY
      const displayValue = inputValue ? (() => {
        if (inputValue.includes("-")) {
          const [year, month, day] = inputValue.split("-");
          return `${day}/${month}/${year}`;
        }
        return inputValue;
      })() : "";

      return (
        <input
          ref={customRef}
          type="text"
          value={displayValue}
          onClick={onClick}
          onBlur={inputOnBlur}
          placeholder={placeholder}
          readOnly
          className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 cursor-pointer ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          } ${className}`}
          {...props}
        />
      );
    });

    CustomInput.displayName = "CustomInput";

    return (
      <div className="relative w-full">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          onBlur={onBlur}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          customInput={<CustomInput />}
          minDate={minDate}
          maxDate={maxDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          className="w-full"
          calendarClassName="shadow-soft-lg rounded-lg border border-gray-200"
          popperClassName="z-50"
          {...props}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;