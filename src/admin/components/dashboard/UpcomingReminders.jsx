import React, { useMemo, useState } from "react";

// ─── Event classification ────────────────────────────────────────────────
const isBirthday = (name = "") => name.toLowerCase().includes("birthday");

const isWorkAnniversary = (name = "") => {
  const k = name.toLowerCase();
  return (
    k.includes("anniversary") ||
    k.includes("joining") ||
    k.includes("work anniversary") ||
    k.includes("work-anniversary")
  );
};

const getEventTheme = (name = "") => {
  if (isBirthday(name)) {
    return {
      icon: "fas fa-birthday-cake",
      chipBg: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
      dateBg: "bg-pink-50 dark:bg-pink-900/20",
      dateBorder: "border-pink-100 dark:border-pink-900/40",
      dateText: "text-pink-600 dark:text-pink-400",
    };
  }
  if (isWorkAnniversary(name)) {
    return {
      icon: "fas fa-award",
      chipBg:
        "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
      dateBg: "bg-violet-50 dark:bg-violet-900/20",
      dateBorder: "border-violet-100 dark:border-violet-900/40",
      dateText: "text-violet-600 dark:text-violet-400",
    };
  }
  return {
    icon: "fas fa-star",
    chipBg:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    dateBg: "bg-amber-50 dark:bg-amber-900/20",
    dateBorder: "border-amber-100 dark:border-amber-900/40",
    dateText: "text-amber-600 dark:text-amber-400",
  };
};

// ─── Date helpers ────────────────────────────────────────────────────────
const parseLocalDate = (str) => {
  if (!str) return null;
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateBadge = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d) return { month: "", day: "" };
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

// ─── Subcomponents ──────────────────────────────────────────────────────
const Avatar = ({ src, name, sizeClass = "w-9 h-9" }) => {
  const [errored, setErrored] = useState(false);
  const showImg = src && !errored;
  return showImg ? (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
    />
  ) : (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
};

const DateChip = ({ month, day, theme }) => (
  <div
    className={`flex flex-col items-center justify-center w-10 rounded-lg border ${theme.dateBg} ${theme.dateBorder} py-1 flex-shrink-0`}
  >
    <span
      className={`text-[8px] font-bold uppercase tracking-wider ${theme.dateText}`}
    >
      {month}
    </span>
    <span
      className={`text-base font-black leading-none ${theme.dateText} mt-0.5`}
    >
      {day}
    </span>
  </div>
);

// ─── Normalizers ─────────────────────────────────────────────────────────
const normalizeBirthday = (b, idx) => ({
  key: `bd-${b.id ?? idx}-${b.date ?? ""}`,
  name: b.employee_name || "Unknown",
  role: b.designation || "Team Member",
  avatar: null,
  event: "Birthday",
  date: b.date,
  daysUntil: typeof b.days_until === "number" ? b.days_until : null,
  isToday: !!b.is_today,
  ...formatDateBadge(b.date),
});

const stripNameFromEvent = (eventName, employeeName) => {
  if (!eventName) return "Special Day";
  if (!employeeName) return eventName;
  const cleaned = eventName
    .replace(new RegExp(`${employeeName}'s`, "i"), "")
    .replace(/^\s+/, "")
    .trim();
  return cleaned || eventName;
};

const normalizeSpecialDay = (s, idx) => {
  const eventLabel = stripNameFromEvent(s.event_name, s.employee_name);
  return {
    key: `sp-${s.id ?? idx}-${s.event_name ?? ""}-${s.date ?? ""}`,
    name: s.employee_name || "Unknown",
    role: s.designation || "Team Member",
    avatar: null,
    event: eventLabel,
    date: s.date,
    daysUntil: typeof s.days_until === "number" ? s.days_until : null,
    isToday: !!s.is_today,
    ...formatDateBadge(s.date),
  };
};

// ─── Tabs config ─────────────────────────────────────────────────────────
const TABS = [
  {
    id: "birthdays",
    label: "Birthdays",
    icon: "fas fa-birthday-cake",
    activeClasses:
      "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400 ring-1 ring-pink-100 dark:ring-pink-900/40",
  },
  {
    id: "specials",
    label: "Special Days",
    icon: "far fa-star",
    activeClasses:
      "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400 ring-1 ring-violet-100 dark:ring-violet-900/40",
  },
];

// ─── Main component ──────────────────────────────────────────────────────
const UpcomingReminders = ({
  birthdays = [],
  specialDays = [],
  maxItems = 10,
}) => {
  const [activeTab, setActiveTab] = useState("birthdays");

  // Build both lists once, sorted by soonest.
  const { birthdayList, specialList } = useMemo(() => {
    const bdays = (birthdays || []).map(normalizeBirthday);

    // Dedupe the specials: some rows duplicate birthdays with `type: "Custom"`
    const seenBirthdayKeys = new Set(
      bdays.map((b) => `${b.name}|${b.date}`),
    );
    const specials = (specialDays || [])
      .map(normalizeSpecialDay)
      .filter(
        (s) =>
          !s.event.toLowerCase().includes("birthday") && // drop re-labeled birthdays
          !seenBirthdayKeys.has(`${s.name}|${s.date}`),
      );

    const sorter = (a, b) => {
      const av = a.daysUntil ?? 99999;
      const bv = b.daysUntil ?? 99999;
      if (av !== bv) return av - bv;
      return a.name.localeCompare(b.name);
    };

    return {
      birthdayList: bdays.sort(sorter).slice(0, maxItems),
      specialList: specials.sort(sorter).slice(0, maxItems),
    };
  }, [birthdays, specialDays, maxItems]);

  const visible = activeTab === "birthdays" ? birthdayList : specialList;
  const totalCounts = {
    birthdays: birthdayList.length,
    specials: specialList.length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700/80">
        <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
          <i className="fas fa-birthday-cake text-pink-500 text-sm"></i>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Birthdays &amp; Special Days
          </h3>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            Let's celebrate our team's moments!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-2 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = totalCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? tab.activeClasses
                    : "bg-gray-50 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                }`}
              >
                <i className={`${tab.icon} text-[9px]`}></i>
                {tab.label}
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    isActive
                      ? "bg-white/60 dark:bg-black/20"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/40 flex items-center justify-center mb-2">
              <i className="fas fa-calendar-check text-gray-400 text-base"></i>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Nothing to show
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {activeTab === "birthdays"
                ? "No upcoming birthdays"
                : "No special days coming up"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((r) => {
              const theme = getEventTheme(r.event);
              return (
                <li
                  key={r.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <Avatar src={r.avatar} name={r.name} sizeClass="w-9 h-9" />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {r.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {r.role}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1 ${theme.chipBg}`}
                    >
                      <i className={`${theme.icon} text-[8px]`}></i>
                      {isBirthday(r.event)
                        ? "Birthday"
                        : isWorkAnniversary(r.event)
                          ? "Anniversary"
                          : r.event}
                    </span>
                  </div>

                  <DateChip month={r.month} day={r.day} theme={theme} />

                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                    {r.isToday || r.daysUntil === 0
                      ? "Today"
                      : r.daysUntil === 1
                        ? "1 day left"
                        : r.daysUntil != null
                          ? `${r.daysUntil} days left`
                          : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingReminders;