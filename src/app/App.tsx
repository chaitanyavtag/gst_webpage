import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  ArrowRight,
  Database,
  Gavel,
  GitBranch,
  Landmark,
  Layers3,
  Network,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const GLOBAL_STYLES = `
  html { scroll-behavior: auto; }
  body { background: #F6F4EF; overscroll-behavior-y: none; }
  * { box-sizing: border-box; }
  @media (pointer: fine) {
    body, button, a { cursor: none; }
  }
  @keyframes flow-dash { to { stroke-dashoffset: -96; } }
  @keyframes node-orbit-a { from { transform: rotate(0deg) translateX(18px) rotate(0deg); } to { transform: rotate(360deg) translateX(18px) rotate(-360deg); } }
  @keyframes node-orbit-b { from { transform: rotate(360deg) translateX(13px) rotate(-360deg); } to { transform: rotate(0deg) translateX(13px) rotate(0deg); } }
  @keyframes data-sweep { 0% { transform: translateX(-130%); opacity: 0; } 18% { opacity: 1; } 82% { opacity: 1; } 100% { transform: translateX(130%); opacity: 0; } }
  @keyframes governance-breathe { 0%, 100% { opacity: .52; transform: scale(1); } 50% { opacity: .92; transform: scale(1.018); } }
  @keyframes route-node { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  @keyframes branch-carousel { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
  @keyframes card-sheen { 0% { transform: translateX(120%); opacity: 0; } 22% { opacity: 1; } 78% { opacity: 1; } 100% { transform: translateX(-120%); opacity: 0; } }
  @keyframes typewriter { 0%, 16% { clip-path: inset(0 100% 0 0); } 58%, 100% { clip-path: inset(0 0 0 0); } }
  @keyframes caret-blink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
  .flow-line { stroke-dasharray: 9 12; }
  .flow-line-slow { stroke-dasharray: 14 18; }
  .branch-carousel-track { animation: branch-carousel 28s linear infinite; }
  .branch-carousel-mask:hover .branch-carousel-track { animation-play-state: paused; }
  .card-sheen { position: relative; overflow: hidden; }
  .card-sheen::before {
    content: "";
    position: absolute;
    inset: 0;
    width: 45%;
    background: linear-gradient(90deg, transparent, rgba(11,107,107,.10), transparent);
    animation: card-sheen 4.4s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  .description-box { position: relative; overflow: hidden; }
  .description-text {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    animation: typewriter 4.2s steps(58, end) infinite;
  }
  .description-text::after {
    content: "";
    display: inline-block;
    height: 1em;
    width: 1px;
    margin-left: 3px;
    background: currentColor;
    vertical-align: -0.14em;
    animation: caret-blink .8s steps(1, end) infinite;
  }
  .citation-chip {
    background: rgba(255,255,255,.82);
    color: rgba(11,107,107,.64);
    transform-style: preserve-3d;
    transition: color .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease;
  }
  .citation-chip:hover {
    background: linear-gradient(135deg, #8A6421 0%, #B89142 48%, #6E4A13 100%);
    color: #fff;
    border-color: rgba(255,255,255,.34);
    box-shadow: 0 22px 46px rgba(95,63,13,.24), 0 10px 24px rgba(11,107,107,.10);
  }
  .citation-chip__dot {
    background: #B89142;
    transition: background-color .22s ease, transform .22s ease;
  }
  .citation-chip:hover .citation-chip__dot {
    background: #fff;
    transform: translateZ(14px) scale(1.14);
  }
  .citation-chip__text {
    color: currentColor;
    transition: color .22s ease, transform .22s ease;
  }
  .citation-chip:hover .citation-chip__text { transform: translateZ(18px); }
  .gpu { transform: translateZ(0); will-change: transform, opacity, filter; }
  .text-balance { text-wrap: balance; }
  .sweep-mask { position: relative; overflow: hidden; }
  .sweep-mask::after {
    content: "";
    position: absolute;
    inset: 0;
    width: 48%;
    background: linear-gradient(90deg, transparent, rgba(224,184,106,.24), transparent);
    animation: data-sweep 7.5s cubic-bezier(.16,1,.3,1) infinite;
    pointer-events: none;
  }
  .governance-breathe { animation: governance-breathe 5.4s ease-in-out infinite; }
  .cursor-ring { box-shadow: 0 0 0 1px rgba(184,145,66,.18), 0 10px 30px rgba(11,107,107,.10); }
`;

const HERO_CITATIONS = [
  ["Section 16(2), CGST Act", "6%", "24%"],
  ["Circular 183/15/2022-GST", "72%", "18%"],
  ["Rule 36(4)", "82%", "54%"],
  ["FORM GST DRC-01", "7%", "68%"],
  ["AAAR Classification Ruling", "68%", "78%"],
  ["Section 73 Limitation", "42%", "14%"],
];

const SYSTEMS = [
  {
    key: "litigation",
    title: "Litigation Intelligence",
    short: "SCN defence, precedent ranking, limitation checks",
    code: "LIT-01",
    cta: "Build defence",
    Icon: Gavel,
    color: "#0B6B6B",
    rows: ["Allegation extraction", "Procedural timeline", "Case-law similarity", "Reply framework"],
  },
  {
    key: "advisory",
    title: "Advisory Intelligence",
    short: "ITC, POS, contracts, transaction structures",
    code: "ADV-02",
    cta: "Map advisory",
    Icon: GitBranch,
    color: "#216E8A",
    rows: ["Supply route mapping", "ITC impact model", "Contract GST alignment", "Risk memorandum"],
  },
  {
    key: "operational",
    title: "Operational Intelligence",
    short: "HSN/SAC, rates, ERP tax controls, SOP retrieval",
    code: "OPS-03",
    cta: "Validate controls",
    Icon: Database,
    color: "#1A7A68",
    rows: ["Classification grid", "Rate validation", "ERP mapping", "Compliance response"],
  },
];

const AUTHORITY_STACK = [
  ["Acts", "CGST / IGST / SGST"],
  ["Rules", "CGST Rules and schedules"],
  ["Notifications", "Rate and exemption orders"],
  ["Circulars", "CBIC interpretive guidance"],
  ["Rulings", "AAR / AAAR decisions"],
  ["Courts", "High Court and Supreme Court"],
  ["Institution", "Internal tax positions"],
  ["Evidence", "Invoices, ledgers, ERP data"],
];

type SmoothContextValue = {
  scrollY: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  viewportH: number;
};

const SmoothContext = createContext<SmoothContextValue | null>(null);

function useSmooth() {
  const value = useContext(SmoothContext);
  if (!value) throw new Error("SmoothContext missing");
  return value;
}

function useMeasureSection(ref: RefObject<HTMLElement | null>) {
  const { viewportH } = useSmooth();
  const [bounds, setBounds] = useState({ top: 0, height: 1 });

  useLayoutEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setBounds({ top: rect.top + window.scrollY, height: rect.height || 1 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);

  return { ...bounds, viewportH };
}

function SmoothScrollShell({ children }: { children: ReactNode }) {
  const scrollY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [viewportH, setViewportH] = useState(900);

  useLayoutEffect(() => {
    const measure = () => {
      setViewportH(window.innerHeight || 900);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scrollY.set(window.scrollY);
    };
    const onPointer = (event: PointerEvent) => {
      mouseX.set((event.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((event.clientY / window.innerHeight - 0.5) * 2);
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [mouseX, mouseY, scrollY]);

  return (
    <SmoothContext.Provider value={{ scrollY, mouseX, mouseY, cursorX, cursorY, viewportH }}>
      <div className="min-h-screen">
        {children}
      </div>
    </SmoothContext.Provider>
  );
}

function ScrollProgress() {
  const { scrollY } = useSmooth();
  const [max, setMax] = useState(1);
  useEffect(() => {
    const update = () => setMax(Math.max(1, document.body.scrollHeight - window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const scaleX = useTransform(scrollY, [0, max], [0, 1]);
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-[#0B6B6B] via-[#B89142] to-[#0B6B6B]"
      style={{ scaleX }}
    />
  );
}

function IntelligenceCursor() {
  const { cursorX, cursorY, mouseX, mouseY } = useSmooth();
  const x = useSpring(useTransform(cursorX, (value) => value - 18), { stiffness: 420, damping: 34 });
  const y = useSpring(useTransform(cursorY, (value) => value - 18), { stiffness: 420, damping: 34 });
  const dotX = useSpring(useTransform(cursorX, (value) => value - 3), { stiffness: 700, damping: 32 });
  const dotY = useSpring(useTransform(cursorY, (value) => value - 3), { stiffness: 700, damping: 32 });
  const rotate = useTransform(mouseX, [-1, 1], [-10, 10]);
  const scale = useTransform(mouseY, [-1, 1], [0.92, 1.08]);

  return (
    <>
      <motion.div
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[120] hidden h-9 w-9 rounded-full border border-[#0B6B6B]/55 bg-[#F6F4EF]/70 md:block"
        style={{ x, y, rotate, scale }}
      >
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#0B6B6B]/18" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#0B6B6B]/18" />
      </motion.div>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[121] hidden h-1.5 w-1.5 rounded-full bg-[#0B6B6B] md:block" style={{ x: dotX, y: dotY }} />
    </>
  );
}

function DepthLayer({
  children,
  scrollRange,
  mouseStrength = 0,
  className = "",
}: {
  children: ReactNode;
  scrollRange: [number, number];
  mouseStrength?: number;
  className?: string;
}) {
  const { scrollY, mouseX, mouseY } = useSmooth();
  const yScroll = useTransform(scrollY, scrollRange, [0, scrollRange[1] - scrollRange[0]]);
  const yDepth = useTransform(yScroll, (value) => -value);
  const xMouse = useSpring(useTransform(mouseX, (value) => value * mouseStrength), { stiffness: 55, damping: 22 });
  const yMouse = useSpring(useTransform(mouseY, (value) => value * mouseStrength * 0.65), { stiffness: 55, damping: 22 });
  const y = useTransform([yDepth, yMouse], ([a, b]) => (a as number) + (b as number));
  return (
    <motion.div className={`absolute inset-0 gpu ${className}`} style={{ x: xMouse, y }}>
      {children}
    </motion.div>
  );
}

function useLocalCardMotion(ref: RefObject<HTMLDivElement | null>) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const speed = useMotionValue(0);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [2.6, -2.6]), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-2.8, 2.8]), { stiffness: 260, damping: 24 });
  const lightX = useTransform(px, [-0.5, 0.5], ["20%", "80%"]);
  const lightY = useTransform(py, [-0.5, 0.5], ["15%", "85%"]);
  const background = useMotionTemplate`radial-gradient(circle at ${lightX} ${lightY}, rgba(11,107,107,.08), transparent 36%), linear-gradient(135deg, rgba(255,255,255,.98), rgba(248,251,251,.94))`;

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const now = performance.now();
    const distance = Math.hypot(event.clientX - last.current.x, event.clientY - last.current.y);
    const dt = Math.max(16, now - last.current.t);
    speed.set(Math.min(1, distance / dt));
    px.set(x);
    py.set(y);
    last.current = { x: event.clientX, y: event.clientY, t: now };
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
    speed.set(0);
  };

  return { rotateX, rotateY, background, px, py, speed, onPointerMove, onPointerLeave };
}

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
      className={`relative rounded-2xl border p-px [perspective:1200px] gpu ${className}`}
      style={{
        rotateX: motionState.rotateX,
        rotateY: motionState.rotateY,
        borderColor: `${accent}18`,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          opacity: borderOpacity,
          background: `linear-gradient(120deg, transparent, ${accent}33, rgba(11,107,107,.16), transparent)`,
        }}
      />
      <motion.div
        className="relative h-full rounded-2xl border border-white/80 p-5 shadow-[0_18px_54px_rgba(11,107,107,.075),0_2px_14px_rgba(26,31,46,.045)]"
        style={{ background: motionState.background, transform: "translateZ(20px)" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function SectionLabel({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "gold" }) {
  const color = tone === "gold" ? "#B89142" : "#0B6B6B";
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10" style={{ backgroundColor: `${color}66` }} />
      <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.16em]" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

function Navbar() {
  const { scrollY } = useSmooth();
  const bg = useTransform(scrollY, [0, 120], ["rgba(246,244,239,0)", "rgba(246,244,239,.92)"]);
  const shadow = useTransform(scrollY, [0, 120], ["0 0 0 rgba(0,0,0,0)", "0 14px 42px rgba(11,107,107,.08)"]);
  return (
    <motion.nav className="fixed left-0 right-0 top-0 z-[70] border-b border-[#0B6B6B]/10 backdrop-blur-sm" style={{ backgroundColor: bg, boxShadow: shadow }}>
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B6B6B] shadow-[0_12px_28px_rgba(11,107,107,.25)]">
            <Scale size={19} className="text-white" strokeWidth={1.6} />
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-[20px] font-semibold text-[#1A1F2E]">GST Intelligence</div>
            <div className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[.18em] text-[#0B6B6B]/55">Cinematic institutional prototype</div>
          </div>
        </div>
        <div className="hidden items-center gap-7 lg:flex">
          {["Core", "Branches", "Governance", "Workflow"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="font-['DM_Sans'] text-[13px] text-[#1A1F2E]/64 transition hover:text-[#0B6B6B]">
              {item}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [activeCitation, setActiveCitation] = useState("Section 16(2), CGST Act");
  const { top, height } = useMeasureSection(ref);
  const start = Math.max(0, top);
  const end = top + height;

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-[#F6F4EF]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F6F4EF_0%,#EDF7F7_52%,#F5F1E9_100%)]" />

        <DepthLayer scrollRange={[start, end]} mouseStrength={5}>
          <motion.div
            className="absolute inset-[-10%] gpu"
            style={{
              opacity: 0.085,
              backgroundImage:
                "linear-gradient(rgba(11,107,107,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,107,107,1) 1px, transparent 1px), radial-gradient(circle at 22% 24%, rgba(184,145,66,.7), transparent 26%)",
              backgroundSize: "62px 62px, 62px 62px, 100% 100%",
            }}
          />
        </DepthLayer>

        <DepthLayer scrollRange={[start, end + 600]} mouseStrength={12}>
          <TopographicInfrastructure />
        </DepthLayer>

        <DepthLayer scrollRange={[start, end + 500]} mouseStrength={20}>
          <RepositoryOrbit activeCitation={activeCitation} onSelect={setActiveCitation} />
        </DepthLayer>

        <MidgroundConnectors start={start} end={end} />

        <motion.div className="absolute left-1/2 top-[8vh] z-10 max-w-[820px] -translate-x-1/2 px-6 text-center gpu">
          <h1 className="text-balance font-['Playfair_Display'] text-[38px] font-semibold leading-[1.03] text-[#1A1F2E] md:text-[46px] lg:text-[64px] xl:text-[70px]">
            One governed GST core evolving into specialist AI systems.
          </h1>
          <p className="mx-auto mt-5 hidden max-w-2xl font-['DM_Sans'] text-[17px] font-light leading-[1.65] text-[#556070] lg:block">
            The homepage behaves as a living institutional reasoning architecture: sources orbit,
            connectors redraw, modules detach, and branches emerge through scroll.
          </p>
        </motion.div>

        <DepthLayer scrollRange={[start, end + 300]} mouseStrength={34}>
          <ForegroundTrails start={start} end={end} />
        </DepthLayer>
      </div>
    </section>
  );
}

function TopographicInfrastructure() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[.12]" viewBox="0 0 1400 900" fill="none">
      {Array.from({ length: 6 }).map((_, index) => (
        <path
          key={index}
          d={`M${-120 + index * 34} ${140 + index * 48} C 220 ${40 + index * 26}, 430 ${260 + index * 8}, 710 ${160 + index * 42} S 1160 ${260 + index * 24}, 1510 ${110 + index * 40}`}
          stroke={index % 3 === 0 ? "#B89142" : "#0B6B6B"}
          strokeWidth="1"
          className="flow-line-slow"
          opacity={0.28}
        />
      ))}
    </svg>
  );
}

function RepositoryOrbit({
  activeCitation,
  onSelect,
}: {
  activeCitation: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="absolute inset-0">
      {HERO_CITATIONS.map(([text, left, top], index) => (
        <motion.button
          type="button"
          key={text}
          whileHover={{
            y: -6,
            scale: 1.08,
            rotateX: index % 2 === 0 ? 24 : -22,
            rotateY: index % 3 === 0 ? -28 : 26,
            rotateZ: index % 2 === 0 ? 2.5 : -2.5,
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          onClick={() => onSelect(text)}
          className={`citation-chip absolute hidden rounded-lg border px-3 py-1.5 text-left shadow-[0_10px_30px_rgba(11,107,107,.07)] backdrop-blur-sm md:block ${
            activeCitation === text ? "border-[#B89142]/45" : "border-[#0B6B6B]/10"
          }`}
          style={{ left, top, transformPerspective: 760, transformStyle: "preserve-3d" }}
        >
          <span className="citation-chip__dot inline-block h-1.5 w-1.5 rounded-full align-middle" />
          <span className="citation-chip__text ml-2 inline-block font-['JetBrains_Mono'] text-[10px]">{text}</span>
        </motion.button>
      ))}
    </div>
  );
}

function MidgroundConnectors({ start, end }: { start: number; end: number }) {
  const { scrollY, mouseX, mouseY } = useSmooth();
  const active = useTransform(scrollY, [start, end], [0.2, 1]);
  const cursorX = useTransform(mouseX, [-1, 1], [530, 870]);
  const cursorY = useTransform(mouseY, [-1, 1], [230, 430]);
  const d1 = useMotionTemplate`M240 570 C420 400 ${cursorX} ${cursorY} 700 460`;
  const d2 = useMotionTemplate`M1150 220 C930 260 ${cursorX} ${cursorY} 700 460`;
  return (
    <motion.svg className="absolute inset-0 z-[8] h-full w-full opacity-70" viewBox="0 0 1400 900" fill="none" style={{ opacity: active }}>
      <motion.path d={d1} stroke="#0B6B6B" strokeWidth="1.2" className="flow-line" fill="none" />
      <motion.path d={d2} stroke="#B89142" strokeWidth="1.2" className="flow-line" fill="none" />
    </motion.svg>
  );
}

function ForegroundTrails({ start, end }: { start: number; end: number }) {
  const { scrollY } = useSmooth();
  const opacity = useTransform(scrollY, [start + 200, end - 300], [0.35, 0.95]);
  const x = useTransform(scrollY, [start, end], [-120, 180]);
  return (
    <motion.div className="absolute inset-0 z-30 pointer-events-none" style={{ opacity }}>
      {[12, 38, 64, 78].map((top, index) => (
        <motion.div
          key={top}
          className="absolute h-px w-40 bg-gradient-to-r from-transparent via-[#B89142]/55 to-transparent"
          style={{ top: `${top}%`, left: `${18 + index * 17}%`, x }}
        />
      ))}
    </motion.div>
  );
}

function BranchMorphStage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollY, mouseX, viewportH } = useSmooth();
  const { top } = useMeasureSection(ref);
  const progress = useTransform(scrollY, [top - viewportH * 0.82, top + viewportH * 0.08], [0, 1]);
  const stageOpacity = useTransform(progress, [0, 0.18], [0.35, 1]);
  const headerY = useTransform(progress, [0, 0.5], [34, 0]);
  const headerOpacity = useTransform(progress, [0, 0.2], [0, 1]);
  const stageX = useTransform(mouseX, (value) => value * 8);

  return (
    <section id="branches" ref={ref} className="relative min-h-screen overflow-hidden bg-[#EEF7F7]">
      <div className="relative min-h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(11,107,107,.12),transparent_28%),linear-gradient(180deg,#EEF7F7_0%,#F5F2EC_100%)]"
          style={{ x: stageX, opacity: stageOpacity }}
        />

        <motion.div
          className="absolute left-1/2 top-[calc(6vh-36px)] z-10 w-[300px] -translate-x-1/2 rounded-2xl border border-[#0B6B6B]/12 bg-white/94 p-4 text-center shadow-[0_18px_54px_rgba(11,107,107,.095)] backdrop-blur-sm gpu"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B6B6B]">
            <Network size={21} className="text-white" />
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] lowercase tracking-[.16em] text-[#B89142]">tagsott.ai</div>
          <div className="mt-1.5 font-['Playfair_Display'] text-[21px] font-semibold text-[#1A1F2E]">Modules detach into branches</div>
        </motion.div>

        <BranchCarousel progress={progress} />
      </div>
    </section>
  );
}

function BranchCarousel({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.08, 0.24], [0, 1]);
  const y = useTransform(progress, [0.08, 0.28], [42, 0]);
  const scale = useTransform(progress, [0.08, 0.28], [0.98, 1]);
  const carouselGroups = [SYSTEMS, SYSTEMS];

  return (
    <motion.div
      className="branch-carousel-mask absolute left-0 right-0 top-[calc(25vh+14px)] z-20 overflow-hidden py-3 gpu"
      style={{ opacity, y, scale }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[12vw] bg-gradient-to-r from-[#F2F5F1] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[12vw] bg-gradient-to-l from-[#F2F5F1] to-transparent" />
      <div className="branch-carousel-track flex w-max">
        {carouselGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex gap-6 pr-6">
            {group.map((system, index) => (
              <BranchCard key={`${groupIndex}-${system.key}`} system={system} index={index} progress={progress} />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BranchCard({
  system,
  index,
  progress,
}: {
  system: (typeof SYSTEMS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const startAt = 0.2 + index * 0.05;
  const y = useTransform(progress, [startAt, startAt + 0.22], [28, 0]);
  const opacity = useTransform(progress, [startAt - 0.05, startAt + 0.12], [0, 1]);
  const Icon = system.Icon;

  return (
    <motion.div className="h-[270px] w-[min(86vw,520px)] flex-none gpu" style={{ y, opacity }}>
      <LivingCard accent={system.color} className="card-sheen h-full">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: system.color }}>
            <Icon size={20} className="text-white" strokeWidth={1.5} />
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#9CA3AF]">{system.code}</span>
        </div>
        <h3 className="font-['Playfair_Display'] text-[22px] font-semibold leading-[1.08] text-[#1A1F2E]">{system.title}</h3>
        <div className="description-box mt-2 rounded-lg border border-[#0B6B6B]/8 bg-[#F4FAFA]/85 px-3 py-2">
          <p className="description-text font-['JetBrains_Mono'] text-[11px] leading-[1.35] text-[#49616B]">{system.short}</p>
        </div>
        <motion.a
          href="#workflow"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg px-4 font-['DM_Sans'] text-[13px] font-medium text-white shadow-[0_14px_28px_rgba(11,107,107,.14)]"
          style={{
            background: `linear-gradient(135deg, ${system.color}, ${system.color})`,
          }}
          whileHover={{
            y: -3,
            scale: 1.035,
            boxShadow: "0 18px 38px rgba(184,145,66,.26), 0 10px 26px rgba(11,107,107,.18)",
            background: `linear-gradient(135deg, ${system.color}, #B89142)`,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 340, damping: 20 }}
        >
          {system.cta}
          <ArrowRight size={15} />
        </motion.a>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {system.rows.slice(0, 2).map((row, rowIndex) => (
            <BranchRow key={row} row={row} rowIndex={rowIndex} progress={progress} color={system.color} />
          ))}
        </div>
      </LivingCard>
    </motion.div>
  );
}

function BranchRow({
  row,
  rowIndex,
  progress,
  color,
}: {
  row: string;
  rowIndex: number;
  progress: MotionValue<number>;
  color: string;
}) {
  const y = useTransform(progress, [0.42 + rowIndex * 0.04, 0.8], [14, 0]);
  return (
    <motion.div className="flex min-h-8 items-center gap-2 rounded-lg border border-[#0B6B6B]/10 bg-[#F8FAFA] px-3 py-1.5" style={{ y }}>
      <CircleDot size={12} style={{ color }} />
      <span className="font-['DM_Sans'] text-[12px] text-[#1A1F2E]">{row}</span>
    </motion.div>
  );
}

function GovernanceLayer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useSmooth();
  const { top, height } = useMeasureSection(ref);
  const structure = useTransform(scrollY, [top - 600, top + height], [0, 1]);
  const bgX = useTransform(structure, [0, 1], ["20%", "80%"]);
  const bg = useMotionTemplate`radial-gradient(circle at ${bgX} 20%, rgba(184,145,66,.16), transparent 30%), linear-gradient(180deg,#F4F2ED,#EEF7F7)`;

  return (
    <section id="governance" ref={ref} className="relative overflow-hidden pb-16 pt-10" style={{ background: "#F4F2ED" }}>
      <motion.div className="absolute inset-0" style={{ background: bg }} />
      <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <SectionLabel tone="gold">Governance Stabilization</SectionLabel>
          <h2 className="mt-6 font-['Playfair_Display'] text-[42px] font-semibold leading-[1.1] text-[#1A1F2E] md:text-[56px]">
            Motion becomes slower, denser, and more controlled.
          </h2>
          <p className="mt-5 font-['DM_Sans'] text-[16px] font-light leading-[1.75] text-[#556070]">
            The environment visually stabilizes as the story enters audit, authority hierarchy,
            source boundaries, and reviewer sign-off.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {AUTHORITY_STACK.map(([label, value], index) => (
            <AuthorityTile key={label} label={label} value={value} index={index} structure={structure} />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            [ShieldCheck, "Controlled Source Corpus", "No generic internet answers. Every assertion resolves to a curated GST authority or approved institutional position."],
            [ClipboardCheck, "Human Review Gate", "Outputs remain draft intelligence until a qualified reviewer approves, edits, or rejects the analysis."],
            [Landmark, "Institutional Audit Trail", "Source versions, prompts, reasoning steps, and reviewer actions remain visible across the matter lifecycle."],
          ].map(([Icon, title, body], index) => {
            const LucideIcon = Icon as typeof ShieldCheck;
            return (
              <GovernanceMotionCard
                key={title as string}
                index={index}
                structure={structure}
                accent={index === 1 ? "#B89142" : "#0B6B6B"}
              >
                <LucideIcon size={24} className="mb-5 text-[#0B6B6B]" strokeWidth={1.5} />
                <h3 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#1A1F2E]">{title as string}</h3>
                <p className="mt-3 font-['DM_Sans'] text-[14px] font-light leading-[1.7] text-[#556070]">{body as string}</p>
              </GovernanceMotionCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AuthorityTile({
  label,
  value,
  index,
  structure,
}: {
  label: string;
  value: string;
  index: number;
  structure: MotionValue<number>;
}) {
  const y = useTransform(structure, [0, 1], [36 + (index % 3) * 12, 0]);
  const x = useTransform(structure, [0, 0.42, 1], [index % 2 === 0 ? -42 : 42, 0, 0]);
  const opacity = useTransform(structure, [0, 0.22 + index * 0.035, 0.48 + index * 0.035], [0, 0, 1]);
  return (
    <motion.div className="rounded-xl border border-[#0B6B6B]/10 bg-white/[0.88] p-5 shadow-[0_10px_34px_rgba(11,107,107,.06)] backdrop-blur-sm" style={{ x, y, opacity }}>
      <Layers3 size={18} className="mb-4 text-[#0B6B6B]" />
      <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.14em] text-[#B89142]">{label}</div>
      <div className="mt-2 font-['DM_Sans'] text-[14px] text-[#1A1F2E]">{value}</div>
    </motion.div>
  );
}

function GovernanceMotionCard({
  children,
  index,
  structure,
  accent,
}: {
  children: ReactNode;
  index: number;
  structure: MotionValue<number>;
  accent: string;
}) {
  const x = useTransform(structure, [0.32 + index * 0.08, 0.62 + index * 0.08], [index === 1 ? 0 : index === 0 ? -70 : 70, 0]);
  const y = useTransform(structure, [0.32 + index * 0.08, 0.62 + index * 0.08], [42, 0]);
  const opacity = useTransform(structure, [0.28 + index * 0.08, 0.58 + index * 0.08], [0, 1]);
  return (
    <motion.div style={{ x, y, opacity }}>
      <LivingCard accent={accent}>
        {children}
      </LivingCard>
    </motion.div>
  );
}

function WorkflowPipeline() {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useSmooth();
  const { top, height } = useMeasureSection(ref);
  const progress = useTransform(scrollY, [top - 500, top + height - 400], [0, 1]);
  const pathLength = useTransform(progress, [0, 1], [0, 1]);
  const steps = [
    ["01", "Intake", "Notice, contract, invoice, filing, or query enters the system."],
    ["02", "Extraction", "Sections, allegations, dates, evidence gaps, and risks are isolated."],
    ["03", "Retrieval", "Acts, Rules, Notifications, Circulars, rulings, and courts are searched."],
    ["04", "Ranking", "Authority, jurisdiction, recency, and factual similarity determine priority."],
    ["05", "Reasoning", "Issue-wise draft analysis forms with citation-linked support."],
    ["06", "Sign-off", "Reviewer approval stabilizes the final institutional output."],
  ];

  return (
    <section id="workflow" ref={ref} className="relative overflow-hidden bg-[#EEF7F7] py-14">
      <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-6 flex justify-center"><SectionLabel>Reasoning Pipeline</SectionLabel></div>
          <h2 className="font-['Playfair_Display'] text-[42px] font-semibold leading-[1.1] text-[#1A1F2E] md:text-[56px]">Workflow animates like live legal reasoning.</h2>
        </div>
        <div className="relative">
          <svg className="absolute left-[6%] right-[6%] top-12 hidden h-20 w-[88%] lg:block" viewBox="0 0 1100 80" fill="none">
            <motion.path style={{ pathLength }} d="M0 40 C160 10 240 70 380 40 S620 10 760 40 S960 72 1100 40" stroke="#0B6B6B" strokeWidth="2" className="flow-line" />
          </svg>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
            {steps.map(([number, title, body], index) => (
              <WorkflowStep key={number} number={number} title={title} body={body} index={index} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({
  number,
  title,
  body,
  index,
  progress,
}: {
  number: string;
  title: string;
  body: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const y = useTransform(progress, [index / 8, 1], [44, 0]);
  const opacity = useTransform(progress, [index / 8, index / 8 + 0.15], [0.3, 1]);
  return (
    <motion.div className="rounded-xl border border-[#0B6B6B]/10 bg-white p-5 text-center shadow-[0_10px_32px_rgba(11,107,107,.06)]" style={{ y, opacity }}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B6B6B] font-['JetBrains_Mono'] text-[14px] text-white shadow-[0_12px_26px_rgba(11,107,107,.25)]">{number}</div>
      <h3 className="font-['Playfair_Display'] text-[18px] font-semibold text-[#1A1F2E]">{title}</h3>
      <p className="mt-3 font-['DM_Sans'] text-[12px] font-light leading-[1.55] text-[#6B7280]">{body}</p>
    </motion.div>
  );
}

function ClosingSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B6B6B] py-16">
      <div className="absolute inset-0 opacity-[.05]" style={{ backgroundImage: "linear-gradient(rgba(224,184,106,1) 1px, transparent 1px), linear-gradient(90deg, rgba(224,184,106,1) 1px, transparent 1px)", backgroundSize: "46px 46px" }} />
      <div className="relative z-10 mx-auto flex max-w-[1380px] flex-col justify-between gap-10 px-6 lg:flex-row lg:items-center lg:px-10">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2">
            <BadgeCheck size={14} className="text-[#E0B86A]" />
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.15em] text-white/72">Institutional motion system</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-[42px] font-semibold leading-[1.08] text-white md:text-[58px]">
            Motion now carries the architecture.
          </h2>
          <p className="mt-5 max-w-xl font-['DM_Sans'] text-[16px] font-light leading-[1.75] text-white/66">
            Scroll controls the core, branches, pipelines, governance rhythm, connector persistence,
            environmental parallax, and card depth response.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Parallax planes", "Morph branches", "Living cards", "Governed pipeline"].map((item) => (
            <div key={item} className="sweep-mask rounded-xl border border-white/12 bg-white/8 p-5">
              <CheckCircle2 size={18} className="mb-3 text-[#E0B86A]" />
              <div className="font-['DM_Sans'] text-[14px] font-medium text-white">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#084F4F] px-6 py-10 lg:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Building2 size={18} className="text-[#E0B86A]" />
          <span className="font-['DM_Sans'] text-[13px] text-white/55">GST Intelligence Framework Prototype</span>
        </div>
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.14em] text-white/35">Secure - Governed - Traceable</span>
      </div>
    </footer>
  );
}

function AppContent() {
  return (
    <>
      <ScrollProgress />
      <IntelligenceCursor />
      <Navbar />
      <Hero />
      <BranchMorphStage />
      <GovernanceLayer />
      <WorkflowPipeline />
      <ClosingSection />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <SmoothScrollShell>
        <AppContent />
      </SmoothScrollShell>
    </>
  );
}
