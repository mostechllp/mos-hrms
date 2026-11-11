// src/components/common/OtpInput.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OtpInput = ({
  length = 6,
  value = "",
  onChange,
  onComplete,
  primaryColor = "#10b981",
  disabled = false,
  error = false,
}) => {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const ERROR_COLOR = "#ef4444"; // red-500
  const activeColor = error ? ERROR_COLOR : primaryColor;

  useEffect(() => {
    const arr = (value || "").split("").slice(0, length);
    while (arr.length < length) arr.push("");
    setDigits(arr);
  }, [value, length]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const commit = (newDigits) => {
    const joined = newDigits.join("");
    onChange?.(joined);
    if (joined.length === length && !newDigits.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleChange = (e, idx) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const newDigits = [...digits];
    let cursor = idx;
    for (const ch of raw.split("")) {
      if (cursor >= length) break;
      newDigits[cursor] = ch;
      cursor++;
    }
    setDigits(newDigits);
    commit(newDigits);
    const nextFocus = Math.min(cursor, length - 1);
    inputRefs.current[nextFocus]?.focus();
    setFocusedIndex(nextFocus);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[idx]) {
        newDigits[idx] = "";
      } else if (idx > 0) {
        newDigits[idx - 1] = "";
        inputRefs.current[idx - 1]?.focus();
        setFocusedIndex(idx - 1);
      }
      setDigits(newDigits);
      commit(newDigits);
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      setFocusedIndex(idx - 1);
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
      setFocusedIndex(idx + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const newDigits = Array(length).fill("");
    pasted.split("").forEach((ch, i) => (newDigits[i] = ch));
    setDigits(newDigits);
    commit(newDigits);
    const nextFocus = Math.min(pasted.length, length - 1);
    inputRefs.current[nextFocus]?.focus();
    setFocusedIndex(nextFocus);
  };

  return (
    <motion.div
      // shake whenever `error` flips to true
      key={error ? "err" : "ok"}
      animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center gap-2 sm:gap-3"
    >
      {digits.map((d, i) => {
        const isFocused = focusedIndex === i;
        return (
          <motion.div
            key={i}
            className="relative"
            initial={false}
            animate={
              d
                ? { scale: [0.85, 1.08, 1] }
                : { scale: isFocused ? 1.06 : 1 }
            }
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              disabled={disabled}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              onFocus={() => setFocusedIndex(i)}
              aria-invalid={error}
              className={`
                w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
                rounded-xl border-2 outline-none transition-colors duration-200
                bg-white text-gray-800
                dark:bg-gray-900 dark:text-gray-100
                disabled:opacity-50
                ${
                  error
                    ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                    : d
                      ? "border-gray-300 dark:border-gray-600"
                      : "border-gray-200 dark:border-gray-700"
                }
              `}
              style={{
                borderColor: isFocused ? activeColor : undefined,
                boxShadow: isFocused
                  ? error
                    ? `0 0 0 4px ${ERROR_COLOR}33, 0 8px 20px -8px ${ERROR_COLOR}66`
                    : `0 0 0 4px ${primaryColor}33, 0 8px 20px -8px ${primaryColor}66`
                  : undefined,
              }}
            />
            <AnimatePresence>
              {isFocused && !d && (
                <motion.span
                  key="caret"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-7 pointer-events-none"
                  style={{ backgroundColor: activeColor }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default OtpInput;