function LivingCard({
  children,
  className = "",
  accent = "#0B6B6B",
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motionState = useLocalCardMotion(ref);
  const borderOpacity = useSpring(useTransform(motionState.speed, [0, 0.7], [0.26, 0.9]), { stiffness: 220, damping: 26 });

  return (
    <motion.div
      ref={ref}
      onPointerMove={motionState.onPointerMove}
      onPointerLeave={motionState.onPointerLeave}
      className={`relative rounded-2xl border p-px [perspective:1400px] gpu ${className}`}
      style={{
        rotateX: motionState.rotateX,
        rotateY: motionState.rotateY,
        borderColor: `${accent}22`,
        transformStyle: "preserve-3d", // Crucial for multi-layered depth
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          opacity: borderOpacity,
          background: `linear-gradient(120deg, transparent, ${accent}66, #B8914266, transparent)`,
        }}
      />
      <motion.div
        className="relative h-full rounded-2xl border border-white/70 p-6 shadow-[0_28px_90px_rgba(11,107,107,.10),0_2px_18px_rgba(26,31,46,.06)] transition-all duration-300 ease-out group hover:shadow-[0_42px_120px_rgba(11,107,107,.18)]"
        style={{ 
          background: motionState.background, 
          transform: "translateZ(20px)",
          transformStyle: "preserve-3d" 
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}