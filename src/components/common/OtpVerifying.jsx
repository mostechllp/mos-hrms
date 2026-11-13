// src/components/common/OtpVerifying.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "../../hooks/useSound";

/**
 * OTP verify animation (matches the "gyre" reference video):
 *  1. "row"      digits sit in a row
 *  2. "ring"     a thin circle draws itself, the digits glide up onto it
 *                and chord lines connect them to each other
 *  3. "spin"     the whole ring spins, boxes tilt, everything turns green
 *  4. "collapse" ring shrinks into a glowing dot at the centre
 *  5. "check"    a rounded square draws itself, tick draws inside,
 *                ripples + particles burst out
 */

const SIZE = 260;
const C = SIZE / 2;
const RING_RADIUS = 78;
const BOX_W = 44;
const BOX_H = 56;
const NEUTRAL = "rgba(148,163,184,0.45)";

const OtpVerifying = ({
  digits = ["1", "2", "3", "4", "5", "6"],
  primaryColor = "#10b981",
  onDone,
}) => {
  const [phase, setPhase] = useState("row"); // row → ring → spin → collapse → check
  const [lit, setLit] = useState(false); // boxes/lines turn green
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("ring"), 450),
      setTimeout(() => setPhase("spin"), 1350),
      setTimeout(() => setLit(true), 1900),
      setTimeout(() => setPhase("collapse"), 2500),
      setTimeout(() => {
        setPhase("check");
        sounds.success();
      }, 3000),
      setTimeout(() => doneRef.current?.(), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const n = digits.length;
  const gap = Math.min(54, (SIZE - 20 - BOX_W) / Math.max(n - 1, 1));

  // slot on the ring for each digit
  const slots = useMemo(
    () =>
      digits.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(a) * RING_RADIUS, y: Math.sin(a) * RING_RADIUS };
      }),
    [digits, n]
  );

  // particles are generated once so they don't re-roll on every render
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2 + Math.random() * 0.3;
        const d = 70 + Math.random() * 70;
        return {
          id: i,
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          size: 2 + Math.random() * 4,
          delay: Math.random() * 0.12,
          color: [primaryColor, "#34d399", "#6ee7b7", "#a7f3d0"][i % 4],
        };
      }),
    [primaryColor]
  );

  const onRing = phase !== "row";
  const spinning = phase === "spin" || phase === "collapse";
  const accent = lit ? primaryColor : NEUTRAL;

  // spin wrapper values per phase
  const wrapperAnimate = {
    row: { rotate: 0, scale: 1, opacity: 1 },
    ring: { rotate: 0, scale: 1, opacity: 1 },
    spin: { rotate: 360, scale: 1, opacity: 1 },
    collapse: { rotate: 520, scale: 0, opacity: 1 },
  }[phase];

  const wrapperTransition = {
    row: { duration: 0 },
    ring: { duration: 0 },
    spin: { duration: 1.15, ease: [0.65, 0, 0.35, 1] },
    collapse: { duration: 0.5, ease: [0.5, 0, 0.9, 0.4] },
  }[phase];

  return (
    <div className="relative flex flex-col items-center justify-center py-8 min-h-[360px] overflow-hidden">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* ---------- spinning ring + digits ---------- */}
        {phase !== "check" && (
          <motion.div
            className="absolute inset-0"
            initial={{ rotate: 0, scale: 1 }}
            animate={wrapperAnimate}
            transition={wrapperTransition}
          >
            {/* circle + chords */}
            <svg
              className="absolute inset-0"
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              fill="none"
              style={{ overflow: "visible" }}
            >
              <motion.circle
                cx={C}
                cy={C}
                r={RING_RADIUS}
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0, stroke: NEUTRAL }}
                animate={{
                  pathLength: onRing ? 1 : 0,
                  opacity: onRing ? 1 : 0,
                  stroke: accent,
                }}
                transition={{
                  pathLength: { duration: 0.9, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                  stroke: { duration: 0.5 },
                }}
                style={{ rotate: -90, transformOrigin: "50% 50%" }}
              />
              {slots.map((s, i) => {
                const t = slots[(i + 1) % n];
                return (
                  <motion.line
                    key={i}
                    x1={C + s.x}
                    y1={C + s.y}
                    x2={C + t.x}
                    y2={C + t.y}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0, stroke: NEUTRAL }}
                    animate={{
                      pathLength: onRing ? 1 : 0,
                      opacity: onRing ? 0.8 : 0,
                      stroke: accent,
                    }}
                    transition={{
                      pathLength: { duration: 0.6, delay: 0.35 + i * 0.07 },
                      opacity: { duration: 0.2, delay: 0.35 + i * 0.07 },
                      stroke: { duration: 0.5 },
                    }}
                  />
                );
              })}
              {/* centre dot */}
              <motion.circle
                cx={C}
                cy={C}
                r="3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: onRing ? 1 : 0,
                  opacity: onRing ? 1 : 0,
                  fill: accent,
                }}
                transition={{ duration: 0.35, delay: onRing ? 0.7 : 0 }}
                style={{ transformOrigin: "50% 50%" }}
              />
            </svg>

            {/* digit boxes */}
            {digits.map((d, i) => (
              <motion.div
                key={i}
                className="absolute flex items-center justify-center rounded-xl border-2 text-lg font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-lg"
                style={{
                  left: "50%",
                  top: "50%",
                  width: BOX_W,
                  height: BOX_H,
                  marginLeft: -BOX_W / 2,
                  marginTop: -BOX_H / 2,
                }}
                initial={{
                  x: (i - (n - 1) / 2) * gap,
                  y: 0,
                  rotate: 0,
                  borderColor: NEUTRAL,
                }}
                animate={{
                  x: onRing ? slots[i].x : (i - (n - 1) / 2) * gap,
                  y: onRing ? slots[i].y : 0,
                  // boxes tilt while the ring spins, then settle
                  rotate: spinning ? [0, i % 2 ? 22 : -22, 0] : 0,
                  borderColor: accent,
                  boxShadow: lit
                    ? `0 0 18px -4px ${primaryColor}99`
                    : "0 4px 12px -4px rgba(0,0,0,0.25)",
                }}
                transition={{
                  x: { type: "spring", stiffness: 110, damping: 15, delay: i * 0.05 },
                  y: { type: "spring", stiffness: 110, damping: 15, delay: i * 0.05 },
                  rotate: { duration: 1.15, ease: "easeInOut" },
                  borderColor: { duration: 0.5 },
                  boxShadow: { duration: 0.5 },
                }}
              >
                {d}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ---------- glow flash as ring collapses ---------- */}
        <AnimatePresence>
          {phase === "collapse" && (
            <motion.span
              key="flash"
              className="absolute rounded-full"
              style={{
                left: C - 8,
                top: C - 8,
                width: 16,
                height: 16,
                backgroundColor: primaryColor,
                boxShadow: `0 0 28px 10px ${primaryColor}99`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 0.8], opacity: [0, 1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            />
          )}
        </AnimatePresence>

        {/* ---------- check badge ---------- */}
        {phase === "check" && (
          <>
            {/* particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ x: p.x, y: p.y, opacity: [1, 1, 0], scale: [0, 1.2, 0.6] }}
                  transition={{
                    duration: 1.1,
                    delay: p.delay,
                    ease: [0.2, 0.7, 0.3, 1],
                  }}
                />
              ))}
            </div>

            {/* ripples: rounded squares fading outward */}
            {[0, 1].map((k) => (
              <motion.span
                key={k}
                className="absolute"
                style={{
                  left: C - 48,
                  top: C - 48,
                  width: 96,
                  height: 96,
                  borderRadius: 30,
                  border: `1.5px solid ${primaryColor}`,
                }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.9 + k * 0.5, opacity: 0 }}
                transition={{ duration: 1.3, delay: 0.25 + k * 0.18, ease: "easeOut" }}
              />
            ))}

            {/* the badge itself */}
            <motion.div
              className="absolute flex items-center justify-center"
              style={{ left: C - 48, top: C - 48, width: 96, height: 96 }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ borderRadius: 30 }}
                initial={{ backgroundColor: `${primaryColor}00`, boxShadow: `0 0 0 0 ${primaryColor}00` }}
                animate={{
                  backgroundColor: `${primaryColor}1f`,
                  boxShadow: `0 0 32px -4px ${primaryColor}77`,
                }}
                transition={{ duration: 0.5, delay: 0.35 }}
              />
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="absolute inset-0">
                <motion.rect
                  x="2"
                  y="2"
                  width="92"
                  height="92"
                  rx="30"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                />
              </svg>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="relative">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke={primaryColor}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      {/* ---------- text ---------- */}
      <div className="text-center mt-2 h-14">
        <AnimatePresence mode="wait">
          {phase === "check" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
                Verified successfully
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Signing you in…</p>
            </motion.div>
          ) : (
            <motion.div
              key="busy"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Verifying your code…
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please wait</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OtpVerifying;