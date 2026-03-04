import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { schemaApi } from "../api/schemaApi";
import { toast } from "sonner";
import {
  FileJson2,
  Palette,
  LogOut,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  User,
  Mail,
  KeyRound,
  Pencil,
  X,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const SCHEMA_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ── tiny animation helpers ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.38 },
  }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export const ProfilePage: React.FC = () => {
  const { user, token, logout, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  // Local display state so header + initials update instantly on save
  const [headerName, setHeaderName] = useState<string | null>(null);
  const [headerEmail, setHeaderEmail] = useState<string | null>(null);

  // Sync local display state whenever context user changes (e.g. on load)
  useEffect(() => {
    if (user) {
      setHeaderName(user.name ?? null);
      setHeaderEmail(user.email);
    }
  }, [user?.name, user?.email]);

  // Called by AccountSettings on successful save
  const handleUserUpdated = (updated: any) => {
    updateUser(updated);
    setHeaderName(updated.name ?? null);
    setHeaderEmail(updated.email);
  };

  const [activeTab, setActiveTab] = useState<"schemas" | "templates">(
    "schemas",
  );
  const [schemas, setSchemas] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  /* ── redirect ─────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  /* ── fetch schemas ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    setLoadingSchemas(true);
    fetch(`${SCHEMA_API_URL}/schema?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setSchemas(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load schemas"))
      .finally(() => setLoadingSchemas(false));
  }, [user]);

  /* ── fetch templates ───────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "templates" || !token) return;
    setLoadingTemplates(true);
    authService
      .getMyTemplates(token)
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setLoadingTemplates(false));
  }, [activeTab, token]);

  const handleDeleteSchema = async (id: string) => {
    try {
      await schemaApi.delete(id);
      setSchemas((p) => p.filter((s) => s.id !== id));
      toast.success("Schema deleted");
    } catch {
      toast.error("Failed to delete schema");
    }
  };
  const handleDeleteTemplate = async (id: string) => {
    if (!token) return;
    try {
      await authService.deleteTemplate(token, id);
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  /* ── loading screen ────────────────────────────────────── */
  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse shadow-xl" />
          <p className="text-sm text-neutral-500 animate-pulse">
            Loading your workspace…
          </p>
        </motion.div>
      </div>
    );
  if (!user) return null;

  const displayedName = headerName ?? user.name;
  const displayedEmail = headerEmail ?? user.email;
  const initials = (displayedName || displayedEmail).slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ── Same subtle background as landing page ───────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-32 left-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* ══════════════════════════════════════════════════
          PROFILE HEADER
      ══════════════════════════════════════════════════ */}
      <div className="relative z-10 border-b border-purple-100/80 overflow-hidden">
        {/* ── Layer 1: base soft gradient ─── */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f6f3ff] via-white to-[#eef4ff]" />

        {/* ── Layer 2: animated dot grid (drift down + pulse) ─── */}
        <motion.div
          className="absolute -inset-16 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(139, 92, 246, 0.35) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
          animate={{ y: [0, 26], opacity: [0.38, 1, 0.38] }}
          transition={{
            y: { duration: 4, ease: "linear", repeat: Infinity },
            opacity: { duration: 6, ease: "easeInOut", repeat: Infinity },
          }}
        />

        {/* ── Layer 3: edge & bottom fade-out so dots vanish at borders ─── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, white 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row sm:items-center gap-5"
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 22,
                delay: 0.1,
              }}
              className="relative flex-shrink-0 self-start sm:self-auto"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center select-none shadow-lg shadow-purple-200/60">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {initials}
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
            </motion.div>

            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.38 }}
              className="flex-1 min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {displayedName || "FormSync User"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Pro
                </span>
              </div>
              <p className="text-sm text-neutral-500 mb-2">{displayedEmail}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5" /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <FileJson2 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-medium text-neutral-700">
                    {schemas.length}
                  </span>{" "}
                  schemas
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium text-neutral-700">
                    {templates.length}
                  </span>{" "}
                  templates
                </span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.38 }}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Sign out
              </button>
            </motion.div>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.38 }}
            className="grid grid-cols-3 gap-3 mt-6"
          >
            {[
              {
                label: "JSON Schemas",
                value: schemas.length,
                icon: <FileJson2 className="w-4 h-4 text-purple-500" />,
                accent: "border-purple-100 bg-purple-50/60",
              },
              {
                label: "Templates",
                value: templates.length,
                icon: <Palette className="w-4 h-4 text-indigo-500" />,
                accent: "border-indigo-100 bg-indigo-50/60",
              },
              {
                label: "Total Assets",
                value: schemas.length + templates.length,
                icon: <Sparkles className="w-4 h-4 text-violet-500" />,
                accent: "border-violet-100 bg-violet-50/60",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 + i * 0.06, duration: 0.32 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.accent}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-white flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-neutral-900 leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-6 pb-8">
          {/* ── LEFT: Account Settings ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AccountSettings
              user={user}
              token={token}
              onUserUpdated={handleUserUpdated}
            />
          </motion.div>

          {/* ── RIGHT: Library ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
              {/* Tabs header */}
              <div className="px-5 pt-5 pb-0">
                <h2 className="text-base font-bold text-neutral-900 mb-4">
                  My Library
                </h2>
                <div className="flex gap-1 bg-neutral-100/80 p-1 rounded-xl w-fit mb-0">
                  {(["schemas", "templates"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-purple-100 text-purple-800 shadow-sm border border-purple-200/60"
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {tab === "schemas" ? (
                        <>
                          <FileJson2 className="w-3.5 h-3.5" />
                          JSON Schemas{" "}
                          <TabBadge
                            count={schemas.length}
                            active={activeTab === tab}
                          />
                        </>
                      ) : (
                        <>
                          <Palette className="w-3.5 h-3.5" />
                          Templates{" "}
                          <TabBadge
                            count={templates.length}
                            active={activeTab === tab}
                          />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-5 pt-4 min-h-[320px]">
                <AnimatePresence mode="wait">
                  {activeTab === "schemas" ? (
                    <motion.div
                      key="schemas"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingSchemas ? (
                        <SkeletonGrid />
                      ) : schemas.length === 0 ? (
                        <EmptyState
                          icon={
                            <FileJson2 className="w-9 h-9 text-neutral-300" />
                          }
                          title="No schemas yet"
                          description="Create a schema in the editor, run AI Enhancement and save it."
                          action={
                            <Link
                              to="/editor"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-0.5"
                            >
                              <Plus className="w-4 h-4" />
                              New Schema
                            </Link>
                          }
                        />
                      ) : (
                        <motion.div
                          variants={stagger}
                          initial="hidden"
                          animate="show"
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {schemas.map((s, i) => (
                            <motion.div key={s.id} custom={i} variants={fadeUp}>
                              <SchemaCard
                                schema={s}
                                onDelete={() => handleDeleteSchema(s.id)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="templates"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingTemplates ? (
                        <SkeletonGrid />
                      ) : templates.length === 0 ? (
                        <EmptyState
                          icon={
                            <Palette className="w-9 h-9 text-neutral-300" />
                          }
                          title="No templates saved"
                          description="Build a form in the Form Builder and save it as a template."
                        />
                      ) : (
                        <motion.div
                          variants={stagger}
                          initial="hidden"
                          animate="show"
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {templates.map((t, i) => (
                            <motion.div key={t.id} custom={i} variants={fadeUp}>
                              <TemplateCard
                                template={t}
                                onDelete={() => handleDeleteTemplate(t.id)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACCOUNT SETTINGS SIDEBAR
══════════════════════════════════════════════════════════════ */
const AccountSettings: React.FC<{
  user: any;
  token: string | null;
  onUserUpdated: (u: any) => void;
}> = ({ user, token, onUserUpdated }) => {
  const [editingField, setEditingField] = useState<"name" | "email" | null>(
    null,
  );

  // ── Display state (what appears in the card when NOT editing) ──
  // Managed explicitly — never reset by anything except a successful save
  const [shownName, setShownName] = useState<string>(user.name ?? "");
  const [shownEmail, setShownEmail] = useState<string>(user.email ?? "");

  // ── Edit buffers (only live while editing) ──
  const [nameVal, setNameVal] = useState<string>("");
  const [emailVal, setEmailVal] = useState<string>("");
  const [savingField, setSavingField] = useState(false);

  /* password change state */
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveField = async (field: "name" | "email") => {
    if (!token) return;
    const value = (field === "name" ? nameVal : emailVal).trim();
    if (!value) return toast.error("Value cannot be empty");
    setSavingField(true);
    try {
      const updated = await authService.updateProfile(token, {
        [field]: value,
      });
      // Update the displayed value immediately from server response
      if (field === "name") setShownName(updated.name ?? value);
      else setShownEmail(updated.email ?? value);
      // Propagate to context + page header
      onUserUpdated(updated);
      setEditingField(null);
      toast.success(`${field === "name" ? "Name" : "Email"} updated`);
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSavingField(false);
    }
  };

  const savePassword = async () => {
    if (!token) return;
    setSavingPw(true);
    try {
      await authService.changePassword(token, currentPw, newPw);
      toast.success("Password changed successfully");
      setPwOpen(false);
      setCurrentPw("");
      setNewPw("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Personal Info card */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="font-bold text-sm text-neutral-900">Personal Info</h3>
        </div>

        {/* Name field */}
        <ProfileField
          icon={<User className="w-3.5 h-3.5 text-neutral-400" />}
          label="Display Name"
          value={shownName || "Not set"}
          isEditing={editingField === "name"}
          isSaving={savingField}
          onEdit={() => {
            setNameVal(shownName);
            setEditingField("name");
          }}
          onCancel={() => setEditingField(null)}
          onSave={() => saveField("name")}
        >
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveField("name")}
            className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-900"
            placeholder="Your display name"
          />
        </ProfileField>

        <div className="h-px bg-neutral-100 my-3" />

        {/* Email field */}
        <ProfileField
          icon={<Mail className="w-3.5 h-3.5 text-neutral-400" />}
          label="Email Address"
          value={shownEmail}
          isEditing={editingField === "email"}
          isSaving={savingField}
          onEdit={() => {
            setEmailVal(shownEmail);
            setEditingField("email");
          }}
          onCancel={() => setEditingField(null)}
          onSave={() => saveField("email")}
        >
          <input
            autoFocus
            type="email"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveField("email")}
            className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-900"
            placeholder="your@email.com"
          />
        </ProfileField>
      </div>

      {/* Security card */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6">
        <button
          onClick={() => setPwOpen((o) => !o)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Security</h3>
          </div>
          <motion.div
            animate={{ rotate: pwOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {pwOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  Change your account password
                </div>
                {/* Current password */}
                <PasswordInput
                  label="Current password"
                  value={currentPw}
                  onChange={setCurrentPw}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                />
                {/* New password */}
                <PasswordInput
                  label="New password"
                  value={newPw}
                  onChange={setNewPw}
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                />
                <button
                  onClick={savePassword}
                  disabled={savingPw || !currentPw || !newPw}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPw ? (
                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {savingPw ? "Saving…" : "Update Password"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Profile Field (reusable inline editor) ─────────────── */
const ProfileField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}> = ({
  icon,
  label,
  value,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  children,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs text-neutral-400 flex items-center gap-1">
        {icon}
        {label}
      </label>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      )}
    </div>
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {children}
          <div className="flex gap-2 mt-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isSaving ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.p
          key="value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-neutral-900 truncate py-0.5"
        >
          {value}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ── Password input with show/hide ────────────────────────── */
const PasswordInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}> = ({ label, value, onChange, show, onToggle }) => (
  <div>
    <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
    <div className="relative mx-0.5">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 pr-9 text-sm rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
      >
        {show ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  </div>
);

/* ── Password strength meter ──────────────────────────────── */
/* ═══════════════════════════════════════════════════════════
   LIBRARY CARDS
══════════════════════════════════════════════════════════════ */
const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  published: {
    label: "Published",
    icon: <CheckCircle2 className="w-3 h-3" />,
    cls: "bg-emerald-100 text-emerald-700",
  },
  validated: {
    label: "Validated",
    icon: <CheckCircle2 className="w-3 h-3" />,
    cls: "bg-blue-100 text-blue-700",
  },
  enhanced: {
    label: "Enhanced",
    icon: <Sparkles className="w-3 h-3" />,
    cls: "bg-purple-100 text-purple-700",
  },
  draft: {
    label: "Draft",
    icon: <Clock className="w-3 h-3" />,
    cls: "bg-neutral-100 text-neutral-600",
  },
};

const SchemaCard: React.FC<{ schema: any; onDelete: () => void }> = ({
  schema,
  onDelete,
}) => {
  const status = statusConfig[schema.status] ?? statusConfig.draft;
  const fieldCount = schema.content?.properties
    ? Object.keys(schema.content.properties).length
    : null;
  return (
    <div className="group bg-neutral-50/70 rounded-2xl border border-neutral-200/70 p-4 hover:border-purple-300 hover:bg-white hover:shadow-md hover:shadow-purple-100/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
            <FileJson2 className="w-4 h-4 text-indigo-500" />
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${status.cls}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="font-semibold text-sm text-neutral-900 truncate mb-0.5">
        {schema.name}
      </p>
      {schema.description && (
        <p className="text-xs text-neutral-400 line-clamp-1 flex-1">
          {schema.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-200/60">
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(schema.updatedAt).toLocaleDateString()}
          {fieldCount !== null && (
            <span className="ml-1 px-1.5 py-0.5 bg-neutral-200/60 rounded-md text-neutral-500">
              {fieldCount}f
            </span>
          )}
        </span>
        <Link
          to={`/editor?schemaId=${schema.id}`}
          className="flex items-center gap-0.5 text-xs text-purple-600 font-bold hover:gap-1.5 transition-all group/l"
        >
          Open{" "}
          <ArrowRight className="w-3 h-3 group-hover/l:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const TemplateCard: React.FC<{ template: any; onDelete: () => void }> = ({
  template,
  onDelete,
}) => {
  const fieldCount = template.content?.fields?.length ?? 0;
  return (
    <div className="group bg-neutral-50/70 rounded-2xl border border-neutral-200/70 p-4 hover:border-purple-300 hover:bg-white hover:shadow-md hover:shadow-purple-100/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
          <Palette className="w-4 h-4 text-purple-500" />
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="font-semibold text-sm text-neutral-900 truncate mb-0.5">
        {template.name}
      </p>
      {template.description && (
        <p className="text-xs text-neutral-400 line-clamp-1 flex-1">
          {template.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-200/60">
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(template.createdAt).toLocaleDateString()}
        </span>
        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
        </span>
      </div>
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────── */
const TabBadge: React.FC<{ count: number; active: boolean }> = ({
  count,
  active,
}) => (
  <span
    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-purple-200 text-purple-700" : "bg-neutral-200 text-neutral-500"}`}
  >
    {count}
  </span>
);
const SkeletonGrid: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-neutral-100 rounded-2xl p-4 animate-pulse">
        <div className="flex gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-200" />
          <div className="h-5 w-20 rounded-full bg-neutral-200 self-center" />
        </div>
        <div className="h-4 w-3/4 rounded bg-neutral-200 mb-2" />
        <div className="h-3 w-full rounded bg-neutral-200 mb-4" />
        <div className="flex justify-between pt-2 border-t border-neutral-200/60">
          <div className="h-3 w-16 rounded bg-neutral-200" />
          <div className="h-3 w-10 rounded bg-neutral-200" />
        </div>
      </div>
    ))}
  </div>
);
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-base font-bold text-neutral-800 mb-1">{title}</h3>
    <p className="text-sm text-neutral-400 max-w-xs mb-5">{description}</p>
    {action}
  </div>
);
