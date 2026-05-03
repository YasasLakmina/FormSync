/**
 * Landing Page - FormSync Pipeline System Showcase
 * Enhanced with: scroll progress, word cycling, particle grid, stats strip,
 * tech marquee, cursor spotlight, SRS section, parallax blobs, scroll-to-top
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Code2,
  FileCode,
  Server,
  Database,
  TestTube,
  Check,
  Play,
  Shield,
  FileJson,
  Workflow,
  BookOpen,
  Layout,
  Wand2,
  Package,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Users,
  Zap,
  Star,
  FileText,
  Upload,
  Layers,
  GitBranch,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Footer } from "../components/layout/Footer";

// ─────────────────────────────────────────────
// Scroll Progress Bar
// ─────────────────────────────────────────────
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 z-[9999]"
    />
  );
};

// ─────────────────────────────────────────────
// Scroll To Top Button
// ─────────────────────────────────────────────
const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/30 hover:shadow-xl flex items-center justify-center transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// Particle / Dot Grid Background
// ─────────────────────────────────────────────
const ParticleGrid = () => {
  const dots = Array.from({ length: 80 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400/20 dark:bg-purple-500/10"
          style={{
            left: `${(i % 10) * 10 + Math.random() * 5}%`,
            top: `${Math.floor(i / 10) * 12.5 + Math.random() * 5}%`,
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.4, 1] }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: (i % 7) * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────
const AnimatedCounter = ({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

// ─────────────────────────────────────────────
// Stats Strip
// ─────────────────────────────────────────────
const stats = [
  { icon: FileJson, label: "Schemas Validated", value: 12400, suffix: "+" },
  { icon: Code2, label: "Forms Generated", value: 58000, suffix: "+" },
  { icon: Users, label: "Developers", value: 3200, suffix: "+" },
  { icon: Zap, label: "Time Saved (hrs)", value: 21000, suffix: "+" },
];

const StatsStrip = () => (
  <section className="relative z-10 py-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 overflow-hidden">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ icon: Icon, label, value, suffix }) => (
          <motion.div
            key={label}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <Icon className="h-7 w-7 mx-auto mb-2 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter target={value} suffix={suffix} />
            </div>
            <div className="text-sm text-white/70">{label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// Tech Logos Marquee
// ─────────────────────────────────────────────
const techLogos = [
  { name: "React", color: "text-cyan-500" },
  { name: "TypeScript", color: "text-blue-500" },
  { name: "NestJS", color: "text-red-500" },
  { name: "Node.js", color: "text-green-500" },
  { name: "JSON Schema", color: "text-yellow-500" },
  { name: "GPT-4", color: "text-purple-500" },
  { name: "Docker", color: "text-blue-400" },
  { name: "Vite", color: "text-violet-500" },
  { name: "Express", color: "text-neutral-500" },
  { name: "Zod", color: "text-indigo-500" },
  { name: "Prisma", color: "text-teal-500" },
  { name: "Swagger", color: "text-green-400" },
];

const TechMarquee = () => {
  const doubled = [...techLogos, ...techLogos];
  return (
    <section className="relative z-10 py-8 bg-neutral-50/80 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <p className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
        Powered by
      </p>
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-10 whitespace-nowrap w-max"
        >
          {doubled.map((t, i) => (
            <span
              key={i}
              className={`text-sm font-semibold ${t.color} opacity-70 hover:opacity-100 transition-opacity cursor-default select-none`}
            >
              {t.name}
            </span>
          ))}
        </motion.div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent" />
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Cursor Spotlight Feature Card
// ─────────────────────────────────────────────
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="h-full relative group"
      >
        {/* Cursor spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) =>
                `radial-gradient(250px circle at ${x}px ${y}px, rgba(147,51,234,0.12), transparent 80%)`
            ),
          }}
        />
        <Card className="h-full border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4"
            >
              {feature.icon}
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// SRS Section
// ─────────────────────────────────────────────
const SRSSection = () => {
  const srsSteps = [
    {
      icon: Upload,
      title: "Upload SRS Document",
      desc: "Drop in a PDF or DOCX Software Requirements Specification",
      color: "purple",
    },
    {
      icon: Sparkles,
      title: "AI Extracts Stories",
      desc: "GPT-4 identifies and categorises every user story with confidence scores",
      color: "indigo",
    },
    {
      icon: Layers,
      title: "Select & Generate",
      desc: "Pick the stories you want and auto-generate JSON schemas for each",
      color: "blue",
    },
    {
      icon: GitBranch,
      title: "Save to Project",
      desc: "Organise all generated schemas into a named project for your team",
      color: "violet",
    },
  ];

  return (
    <section className="relative z-10 px-4 py-20 md:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/30 mb-6"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                SRS Import — AI-Powered
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Turn Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Requirements Docs
              </span>{" "}
              into Schemas Instantly
            </h2>

            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
              Upload any SRS document and let FormSync&rsquo;s AI pipeline extract
              every user story, score it by confidence, and generate validated
              JSON schemas in seconds.
            </p>

            <div className="space-y-4">
              {srsSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl bg-${step.color}-100 dark:bg-${step.color}-950/40 flex items-center justify-center`}
                  >
                    <step.icon
                      className={`h-5 w-5 text-${step.color}-600 dark:text-${step.color}-400`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                      {step.title}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-5 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                    <Upload className="mr-2 h-4 w-4" />
                    Try SRS Import
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Right: visual mockup */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl blur-3xl opacity-15" />
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
              {/* Mock SRS parser UI */}
              <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-neutral-500 ml-2 font-mono">
                  srs-parser.ai
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Upload zone */}
                <motion.div
                  animate={{ borderColor: ["#a855f7", "#6366f1", "#a855f7"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="border-2 border-dashed border-purple-400 rounded-xl p-6 text-center bg-purple-50/50 dark:bg-purple-950/20"
                >
                  <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    requirements.pdf
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">2.4 MB • PDF</p>
                </motion.div>

                {/* Extracted stories */}
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Extracted User Stories
                  </p>
                  <div className="space-y-2">
                    {[
                      { story: "User can register with email", conf: 97, sel: true },
                      { story: "User can upload profile photo", conf: 91, sel: true },
                      { story: "Admin can manage roles", conf: 84, sel: false },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs ${
                          item.sel
                            ? "border-purple-200 bg-purple-50/70 dark:bg-purple-950/20 dark:border-purple-800"
                            : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                            item.sel
                              ? "bg-purple-600"
                              : "border border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          {item.sel && (
                            <Check className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                        <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                          {item.story}
                        </span>
                        <span
                          className={`font-semibold ${
                            item.conf >= 90
                              ? "text-green-600"
                              : item.conf >= 80
                              ? "text-yellow-600"
                              : "text-orange-600"
                          }`}
                        >
                          {item.conf}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generate 2 Schemas
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Hero Cycling Words
// ─────────────────────────────────────────────
const cycleWords = [
  "Production Code",
  "React Forms",
  "Backend APIs",
  "TypeScript DTOs",
  "Test Suites",
];

const CyclingWord = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setWordIndex((i) => (i + 1) % cycleWords.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={wordIndex}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent inline-block"
        style={{ backgroundSize: "200% auto" }}
      >
        {cycleWords[wordIndex]}
      </motion.span>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// Animated connector for How It Works
// ─────────────────────────────────────────────
const AnimatedConnector = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute top-12 hidden md:block"
      style={{ left: "12.5%", right: "12.5%" }}
    >
      <div className="relative h-0.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <motion.div
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.4 }}
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
        />
        {/* Travelling dot */}
        <motion.div
          initial={{ left: "0%" }}
          animate={isVisible ? { left: "100%" } : {}}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
            delay: 0.4,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-purple-500 shadow-md shadow-purple-400/50"
          style={{ marginLeft: "-6px" }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Landing Page
// ─────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  const blob1Y = useTransform(scrollY, [0, 800], [0, -120]);
  const blob2Y = useTransform(scrollY, [0, 800], [0, -80]);
  const blob3Y = useTransform(scrollY, [0, 800], [0, -60]);

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <ScrollProgressBar />
      <ScrollToTopButton />

      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <motion.div
          style={{ y: blob1Y }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
        />
        <motion.div
          style={{ y: blob2Y }}
          className="absolute top-20 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        />
        <motion.div
          style={{ y: blob3Y }}
          className="absolute -bottom-32 left-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 px-4 pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        <ParticleGrid />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/30 mb-8 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  AI-Powered Schema Automation
                </span>
              </motion.div>

              {/* Headline with cycling words */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                Transform Schemas into
                <br />
                <CyclingWord />
              </h1>

              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed max-w-xl">
                Validate, enhance, and generate full-stack applications from
                JSON Schema. Create forms, APIs, DTOs, and tests—all powered by
                AI.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link to="/editor">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl text-white px-8 py-6 text-base font-semibold rounded-lg transition-all overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center">
                        <Play className="mr-2 h-5 w-5" />
                        Get Started
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/docs">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 text-base font-semibold rounded-lg border-2 border-neutral-300 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-neutral-700 dark:text-neutral-300 backdrop-blur-sm"
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      View Documentation
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {[
                  { icon: Check, text: "Multi-format support" },
                  { icon: Check, text: "AI-enhanced validation" },
                  { icon: Check, text: "Production-ready" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4 text-green-600" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Carousel with floating stats */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Floating stat badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 z-20"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Validated
                  </span>
                </div>
              </motion.div>

              {/* Stat badge: forms */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -right-4 z-20"
              >
                <div className="bg-purple-600 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium text-white">
                    AI Enhanced
                  </span>
                </div>
              </motion.div>

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-3xl"
                />
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden backdrop-blur-sm bg-opacity-90"
                >
                  <CodeEditorCarousel />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1 cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-purple-500 transition-colors"
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
              }
            >
              <span className="text-xs font-medium tracking-widest uppercase">
                Scroll
              </span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Complete System Overview ── */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Complete{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Schema Automation
              </span>{" "}
              Platform
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              From schema creation to production code generation—all in one
              powerful workflow
            </p>
          </motion.div>

          {systemFeatures.map((feature, index) => (
            <SystemFeatureBlock key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="relative z-10 px-4 py-20 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Everything You Need to Build Faster
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Powerful features that automate your development workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              How{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                FormSync
              </span>{" "}
              Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Four simple steps from schema to production code
            </p>
          </motion.div>

          <div className="relative">
            <AnimatedConnector />
            <div className="grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <ProcessStep key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SRS Section ── */}
      <SRSSection />

      {/* ── Code Generation Outputs ── */}
      <section className="relative z-10 px-4 py-20 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Complete{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Application
              </span>{" "}
              Generation
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              From one validated schema to a complete, production-ready codebase
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outputs.map((output, index) => (
              <OutputCard key={output.title} output={output} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Rotating gradient border */}
            <div className="relative p-[2px] rounded-2xl overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 bg-gradient-conic from-purple-600 via-indigo-400 to-blue-600 opacity-60 blur-sm"
              />
              <Card className="relative border-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-neutral-900 dark:to-blue-950/20 shadow-2xl rounded-2xl overflow-hidden">
                <motion.div
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10"
                  style={{ backgroundSize: "200% 200%" }}
                />

                <CardContent className="p-12 md:p-16 text-center relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block mb-4"
                  >
                    <Globe className="h-10 w-10 text-purple-500 mx-auto" />
                  </motion.div>
                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
                  >
                    Ready to Build Faster?
                  </motion.h2>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl mx-auto"
                  >
                    Join developers automating their workflow with FormSync
                  </motion.p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/editor">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl text-white px-12 py-6 text-lg font-semibold rounded-lg transition-all group overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center">
                            Start Creating
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </motion.div>
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 blur-xl transition-opacity" />
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/docs">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="px-10 py-6 text-lg font-semibold rounded-lg border-2 border-neutral-300 dark:border-neutral-700 hover:border-purple-400 transition-all"
                        >
                          <BookOpen className="mr-2 h-5 w-5" />
                          Read Docs
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────
// Badge Helpers
// ─────────────────────────────────────────────
type BadgeVariant = "purple" | "green" | "blue";
const BADGE_CLASSES: Record<BadgeVariant, string> = {
  purple: "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800",
  green: "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800",
  blue: "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800",
};
const BADGE_TEXT_CLASSES: Record<BadgeVariant, string> = {
  purple: "text-purple-700 dark:text-purple-400",
  green: "text-green-700 dark:text-green-400",
  blue: "text-blue-700 dark:text-blue-400",
};

// ─────────────────────────────────────────────
// Code Editor Shell
// ─────────────────────────────────────────────
const CodeEditorShell = ({
  filename,
  label,
  children,
  badges,
}: {
  filename: string;
  label?: { icon: React.ReactNode; text: string };
  children: React.ReactNode;
  badges: Array<{ icon: React.ReactNode; text: string; variant?: BadgeVariant }>;
}) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <span className="text-xs text-neutral-500">{filename}</span>
    </div>
    {label && (
      <div className="mb-3 flex items-center gap-2">
        {label.icon}
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
          {label.text}
        </span>
      </div>
    )}
    <div className="font-mono text-xs space-y-1 text-neutral-700 dark:text-neutral-300 max-h-64 overflow-y-auto">
      {children}
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {badges.map((badge) => {
        const v = badge.variant ?? "purple";
        return (
          <div
            key={badge.text}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${BADGE_CLASSES[v]}`}
          >
            {badge.icon}
            <span className={`text-xs font-medium ${BADGE_TEXT_CLASSES[v]}`}>
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Carousel Slide Contents
// ─────────────────────────────────────────────
const SchemaSlideContent = () => (
  <>
    <div><span className="text-purple-600">{"{"}</span></div>
    <div className="pl-4"><span className="text-blue-600">"$schema"</span>: <span className="text-green-600">"http://json-schema.org/draft-07/schema#"</span>,</div>
    <div className="pl-4"><span className="text-blue-600">"title"</span>: <span className="text-green-600">"User Registration"</span>,</div>
    <div className="pl-4"><span className="text-blue-600">"type"</span>: <span className="text-green-600">"object"</span>,</div>
    <div className="pl-4"><span className="text-blue-600">"required"</span>: <span className="text-yellow-600">["username", "email", "password"]</span>,</div>
    <div className="pl-4"><span className="text-blue-600">"properties"</span>: <span className="text-purple-600">{"{"}</span></div>
    <div className="pl-8"><span className="text-blue-600">"username"</span>: <span className="text-purple-600">{"{"}</span></div>
    <div className="pl-12"><span className="text-blue-600">"type"</span>: <span className="text-green-600">"string"</span>,</div>
    <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded"><span className="text-blue-600">"minLength"</span>: <span className="text-orange-600">3</span>,</div>
    <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded"><span className="text-blue-600">"maxLength"</span>: <span className="text-orange-600">20</span>,</div>
    <div className="pl-8"><span className="text-purple-600">{"},"}</span></div>
    <div className="pl-8"><span className="text-blue-600">"email"</span>: <span className="text-purple-600">{"{"}</span></div>
    <div className="pl-12"><span className="text-blue-600">"type"</span>: <span className="text-green-600">"string"</span>,</div>
    <div className="pl-12"><span className="text-blue-600">"format"</span>: <span className="text-green-600">"email"</span>,</div>
    <div className="pl-8"><span className="text-purple-600">{"},"}</span></div>
    <div className="pl-4"><span className="text-purple-600">{"}"}</span></div>
    <div><span className="text-purple-600">{"}"}</span></div>
  </>
);

const BackendSlideContent = () => (
  <>
    <div className="pl-4"><span className="text-blue-600">export</span> <span className="text-blue-600">class</span> <span className="text-green-600">UserRegistrationDto</span><span className="text-purple-600">{" {"}</span></div>
    <div className="pl-6"><span className="text-blue-600">@IsString</span>()</div>
    <div className="pl-6"><span className="text-blue-600">@MinLength</span><span className="text-purple-600">(</span><span className="text-orange-600">3</span><span className="text-purple-600">)</span></div>
    <div className="pl-6"><span className="text-blue-600">username</span>:<span className="text-green-600"> string</span>;</div>
    <div className="pl-6"><span className="text-blue-600">@IsEmail</span>()</div>
    <div className="pl-6"><span className="text-blue-600">email</span>:<span className="text-green-600"> string</span>;</div>
    <div className="pl-6"><span className="text-blue-600">@IsString</span>()</div>
    <div className="pl-6"><span className="text-blue-600">@MinLength</span><span className="text-purple-600">(</span><span className="text-orange-600">8</span><span className="text-purple-600">)</span></div>
    <div className="pl-6"><span className="text-blue-600">password</span>:<span className="text-green-600"> string</span>;</div>
    <div><span className="text-purple-600">{"}"}</span></div>
  </>
);

const FrontendSlideContent = () => (
  <>
    <div><span className="text-blue-600">import</span> <span className="text-purple-600">{"{ useState }"}</span> <span className="text-blue-600">from</span> <span className="text-green-600">"react"</span>;</div>
    <div className="pl-4"><span className="text-blue-600">export default function</span> <span className="text-green-600">SimpleForm</span><span className="text-purple-600">() {"{"}</span></div>
    <div className="pl-6"><span className="text-blue-600">const</span> <span className="text-purple-600">[</span><span className="text-blue-600">formData, setFormData</span><span className="text-purple-600">]</span> <span className="text-blue-600">=</span> <span className="text-green-600">useState</span><span className="text-purple-600">({"{"} </span><span className="text-blue-600">name</span>: <span className="text-green-600">""</span>, <span className="text-blue-600">email</span>: <span className="text-green-600">""</span> <span className="text-purple-600">{"});"}</span></div>
    <div className="pl-6"><span className="text-blue-600">return</span> <span className="text-purple-600">(</span></div>
    <div className="pl-8"><span className="text-purple-600">{"<"}</span><span className="text-green-600">form</span> <span className="text-blue-600">onSubmit</span><span className="text-purple-600">=</span><span className="text-green-600">{"{handleSubmit}"}</span><span className="text-purple-600">{">"}</span></div>
    <div className="pl-10"><span className="text-purple-600">{"<"}</span><span className="text-green-600">input</span> <span className="text-blue-600">name</span><span className="text-purple-600">=</span><span className="text-green-600">"name"</span> <span className="text-blue-600">value</span><span className="text-purple-600">=</span><span className="text-green-600">{"{formData.name}"}</span><span className="text-purple-600">{" />"}</span></div>
    <div className="pl-10"><span className="text-purple-600">{"<"}</span><span className="text-green-600">input</span> <span className="text-blue-600">type</span><span className="text-purple-600">=</span><span className="text-green-600">"email"</span> <span className="text-blue-600">name</span><span className="text-purple-600">=</span><span className="text-green-600">"email"</span><span className="text-purple-600">{" />"}</span></div>
    <div className="pl-10"><span className="text-purple-600">{"<"}</span><span className="text-green-600">button</span> <span className="text-blue-600">type</span><span className="text-purple-600">=</span><span className="text-green-600">"submit"</span><span className="text-purple-600">{">"}</span>Submit<span className="text-purple-600">{"</"}</span><span className="text-green-600">button</span><span className="text-purple-600">{">"}</span></div>
    <div className="pl-8"><span className="text-purple-600">{"</"}</span><span className="text-green-600">form</span><span className="text-purple-600">{">"}</span></div>
    <div className="pl-6"><span className="text-purple-600">);</span></div>
    <div><span className="text-purple-600">{"}"}</span></div>
  </>
);

const CAROUSEL_SLIDES = [
  {
    filename: "user-registration.schema.json",
    label: { icon: <Sparkles className="h-3 w-3 text-purple-600" />, text: "AI Enhanced Schema" },
    badges: [
      { icon: <Sparkles className="h-3 w-3 text-purple-600" />, text: "+6 Validations", variant: "purple" as BadgeVariant },
      { icon: <Check className="h-3 w-3 text-green-600" />, text: "Error Messages", variant: "green" as BadgeVariant },
      { icon: <FileCode className="h-3 w-3 text-blue-600" />, text: "Descriptions", variant: "blue" as BadgeVariant },
    ],
    content: <SchemaSlideContent />,
  },
  {
    filename: "UserRegistrationDto.ts",
    label: { icon: <Server className="h-3 w-3 text-purple-600" />, text: "Generated DTO" },
    badges: [
      { icon: <Check className="h-3 w-3 text-green-600" />, text: "Validation", variant: "green" as BadgeVariant },
      { icon: <FileCode className="h-3 w-3 text-blue-600" />, text: "Types", variant: "blue" as BadgeVariant },
    ],
    content: <BackendSlideContent />,
  },
  {
    filename: "SimpleForm.jsx",
    label: { icon: <Layout className="h-3 w-3 text-purple-600" />, text: "Generated Form" },
    badges: [
      { icon: <Layout className="h-3 w-3 text-blue-600" />, text: "React", variant: "blue" as BadgeVariant },
      { icon: <Check className="h-3 w-3 text-green-600" />, text: "Validation", variant: "green" as BadgeVariant },
    ],
    content: <FrontendSlideContent />,
  },
];

const CodeEditorCarousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = CAROUSEL_SLIDES[index];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const goTo = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };
  const goPrev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };
  const goNext = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-1 z-10 h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 overflow-hidden px-10">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <CodeEditorShell filename={slide.filename} label={slide.label} badges={slide.badges}>
                {slide.content}
              </CodeEditorShell>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-1 z-10 h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-3 pb-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-purple-600 dark:bg-purple-500"
                : "w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// System Feature Block
// ─────────────────────────────────────────────
const SystemFeatureBlock = ({ feature, index }: { feature: any; index: number }) => {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`grid md:grid-cols-2 gap-12 items-center mb-32 last:mb-0 ${!isEven ? "md:grid-flow-dense" : ""}`}
    >
      <div className={isEven ? "" : "md:col-start-2"}>
        <motion.div
          initial={{ x: isEven ? -20 : 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/30 mb-4">
            {feature.icon}
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{feature.badge}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">{feature.title}</h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">{feature.description}</p>
          <ul className="space-y-3">
            {feature.points.map((point: string, i: number) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className={isEven ? "" : "md:col-start-1"}>
        <motion.div
          initial={{ x: isEven ? 20 : -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl blur-2xl opacity-20" />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-2xl">
            {feature.visual}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Process Step
// ─────────────────────────────────────────────
const ProcessStep = ({ step, index }: { step: any; index: number }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2, ease: "easeOut" } }}
    className="flex flex-col items-center text-center relative group cursor-pointer"
  >
    <motion.div
      whileHover={{ boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)", scale: 1.1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg relative z-10"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-50 blur-xl"
      />
      <span className="relative z-10">{index + 1}</span>
    </motion.div>
    <div className="relative">
      <div className="absolute -inset-4 bg-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
      <div className="relative">
        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">{step.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.description}</p>
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// Output Card
// ─────────────────────────────────────────────
const OutputCard = ({ output, index }: { output: any; index: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
  >
    <Card className="h-full border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-neutral-900">
      <CardContent className="p-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4">
          {output.icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{output.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{output.description}</p>
        <ul className="space-y-2">
          {output.features.map((feature: string) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
);

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const features = [
  {
    icon: <FileJson className="h-6 w-6" />,
    title: "Multi-Format Support",
    description: "Import and validate JSON, YAML, or XML schemas. Convert between formats seamlessly.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Enhancement",
    description: "GPT-4 powered suggestions for validation rules, accessibility, and structure improvements.",
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: "Dual Workflow Modes",
    description: "Choose manual step-by-step control or automated one-click pipeline for maximum flexibility.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Quality Assurance",
    description: "Automated validation with quality scoring and detailed suggestions for production readiness.",
  },
];

const systemFeatures = [
  {
    badge: "Schema Creation",
    title: "Build Schemas Visually or with Code",
    description: "Create JSON schemas using our drag-and-drop template builder or write directly in the technical editor with real-time validation.",
    icon: <Layout className="h-4 w-4 text-purple-600" />,
    points: [
      "Visual template builder with pre-built components",
      "Monaco-powered code editor with IntelliSense",
      "Real-time syntax validation and error detection",
      "Import from JSON, YAML, or XML formats",
    ],
    visual: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <Layout className="h-8 w-8 text-purple-600" />
          <div>
            <div className="font-semibold text-sm">Template Builder</div>
            <div className="text-xs text-neutral-500">Drag & drop components</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <Code2 className="h-8 w-8 text-indigo-600" />
          <div>
            <div className="font-semibold text-sm">Technical Editor</div>
            <div className="text-xs text-neutral-500">Write code directly</div>
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Schema Ready</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Valid JSON Schema Draft-7</p>
        </div>
      </div>
    ),
  },
  {
    badge: "Validation Engine",
    title: "Intelligent Syntax Validation & Quick Fix",
    description: "Advanced validation engine detects errors in real-time and offers AI-powered auto-fix suggestions to resolve issues instantly.",
    icon: <Shield className="h-4 w-4 text-purple-600" />,
    points: [
      "Multi-format syntax validation (JSON, YAML, XML)",
      "AI-powered quick fix for common errors",
      "Detailed error messages with line numbers",
      "Format mismatch detection and suggestions",
    ],
    visual: (
      <div className="space-y-3">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Syntax Error Detected</span>
          </div>
          <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Line 12: Missing closing brace</p>
        </div>
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Quick Fix
          </Button>
        </motion.div>
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Fixed Successfully</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: "AI Enhancement",
    title: "GPT-4 Powered Schema Enhancement",
    description: "Leverage advanced AI to automatically improve your schema with validation rules, accessibility features, and structural optimizations.",
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
    points: [
      "AI-generated validation rules and constraints",
      "Accessibility improvements (titles, descriptions)",
      "Structure optimization suggestions",
      "Quality scoring with detailed breakdown",
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">AI Enhancing...</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Quality Score</div>
          <div className="flex gap-2 items-end h-24">
            {[85, 92, 78, 95, 88].map((score, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0, transformOrigin: "bottom" }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t"
                style={{ height: `${score}%` }}
              />
            ))}
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">+ 12 suggestions applied</p>
        </div>
      </div>
    ),
  },
  {
    badge: "Code Generation",
    title: "Full-Stack Code Generation",
    description: "Generate production-ready frontend forms, backend APIs, DTOs, and test cases from your validated schema—all in one click.",
    icon: <Terminal className="h-4 w-4 text-purple-600" />,
    points: [
      "React form components with validation",
      "Express/NestJS backend controllers",
      "TypeScript DTOs with decorators",
      "Complete test suites (unit + integration)",
    ],
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Code2, label: "Forms", color: "blue" },
            { icon: Server, label: "API", color: "green" },
            { icon: Database, label: "DTOs", color: "purple" },
            { icon: TestTube, label: "Tests", color: "orange" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 bg-${item.color}-50 dark:bg-${item.color}-950/20 rounded-lg border border-${item.color}-200 dark:border-${item.color}-800 flex flex-col items-center`}
            >
              <item.icon className={`h-6 w-6 text-${item.color}-600 mb-1`} />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
        <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <Package className="h-4 w-4 mr-2" />
          Download All Code
        </Button>
      </div>
    ),
  },
];

const steps = [
  { title: "Validate", description: "Check syntax and structure of your schema" },
  { title: "Convert", description: "Transform to JSON Schema Draft-7 format" },
  { title: "Enhance", description: "Apply AI-powered improvements and suggestions" },
  { title: "Generate", description: "Create full-stack code automatically" },
];

const outputs = [
  {
    icon: <Code2 className="h-7 w-7" />,
    title: "Frontend Forms",
    description: "Dynamic React components with validation",
    features: ["Form UI Components", "Client Validation", "State Management"],
  },
  {
    icon: <Server className="h-7 w-7" />,
    title: "Backend API",
    description: "REST endpoints with Express/NestJS",
    features: ["Controllers & Routes", "Request Handlers", "Error Middleware"],
  },
  {
    icon: <Database className="h-7 w-7" />,
    title: "DTOs & Types",
    description: "TypeScript interfaces and validation",
    features: ["Type Definitions", "Class Validators", "Transform Decorators"],
  },
  {
    icon: <TestTube className="h-7 w-7" />,
    title: "Test Suites",
    description: "Automated test cases",
    features: ["Unit Tests", "Integration Tests", "Full Coverage"],
  },
];

// ─────────────────────────────────────────────
// Animation Styles
// ─────────────────────────────────────────────
const _style = document.createElement("style");
_style.textContent = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
    33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.8; }
    66% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.6; }
  }
  .animate-blob { animation: blob 8s infinite ease-in-out; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  @property --tw-gradient-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  .bg-gradient-conic {
    background: conic-gradient(from var(--tw-gradient-angle), var(--tw-gradient-stops));
  }
`;
document.head.appendChild(_style);
