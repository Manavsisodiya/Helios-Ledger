import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Activity,
  Settings,
  Search,
  Bell,
  ChevronDown,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  Lock,
  Globe,
  CircleDollarSign,
  Building2,
  Eye,
  EyeOff,
  Hash,
  Zap,
  Server,
  Database,
  HardDrive,
  SkipForward,
  RotateCcw
} from "lucide-react";


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const CURRENCY_META = {
  GBP: { symbol: "\u00A3", locale: "en-GB", flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "British Pound" },
  USD: { symbol: "$", locale: "en-US", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "US Dollar" },
  EUR: { symbol: "\u20AC", locale: "de-DE", flag: "\uD83C\uDDEA\uD83C\uDDFA", name: "Euro" },
  JPY: { symbol: "\u00A5", locale: "ja-JP", flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "Japanese Yen" },
  CHF: { symbol: "Fr", locale: "de-CH", flag: "\uD83C\uDDE8\uD83C\uDDED", name: "Swiss Franc" },
  SGD: { symbol: "S$", locale: "en-SG", flag: "\uD83C\uDDF8\uD83C\uDDEC", name: "Singapore Dollar" },
  AUD: { symbol: "A$", locale: "en-AU", flag: "\uD83C\uDDE6\uD83C\uDDFA", name: "Australian Dollar" },
  CAD: { symbol: "C$", locale: "en-CA", flag: "\uD83C\uDDE8\uD83C\uDDE6", name: "Canadian Dollar" },
  HKD: { symbol: "HK$", locale: "en-HK", flag: "\uD83C\uDDED\uD83C\uDDF0", name: "Hong Kong Dollar" },
};

const getCurrencyMeta = (code) =>
  CURRENCY_META[code] || { symbol: code + " ", locale: "en-US", flag: "\uD83C\uDF10", name: code };

const formatMoney = (amount, currency) => {
  const meta = getCurrencyMeta(currency);
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch (e) {
    return `${meta.symbol}${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
};

const ToastContext = React.createContext({ push: () => {}, dismiss: () => {} });

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  const push = useCallback(
    (toast) => {
      idRef.current += 1;
      const id = idRef.current;
      const next = { id, exiting: false, duration: 5000, ...toast };
      setToasts((prev) => [...prev, next]);
      if (next.duration > 0) {
        setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const { type = "info", title, description, exiting } = toast;
  const styles = {
    success: {
      ring: "ring-emerald-500/30",
      bg: "from-emerald-500/10 to-emerald-500/5",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      bar: "bg-emerald-400",
    },
    error: {
      ring: "ring-rose-500/30",
      bg: "from-rose-500/10 to-rose-500/5",
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      bar: "bg-rose-400",
    },
    warning: {
      ring: "ring-amber-500/30",
      bg: "from-amber-500/10 to-amber-500/5",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bar: "bg-amber-400",
    },
    info: {
      ring: "ring-sky-500/30",
      bg: "from-sky-500/10 to-sky-500/5",
      icon: <Sparkles className="w-5 h-5 text-sky-400" />,
      bar: "bg-sky-400",
    },
  }[type];

  return (
    <div
      data-testid="treasury-toast"
      className={`${
        exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      } transition-all duration-300 relative overflow-hidden rounded-xl ring-1 ${styles.ring} bg-gradient-to-br ${styles.bg} backdrop-blur-xl shadow-2xl border border-zinc-800/80`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`} />
      <div className="flex items-start gap-3 p-4 pl-5">
        <div className="shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-zinc-100 leading-tight">{title}</p>
          )}
          {description && (
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed break-words">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const useToast = () => React.useContext(ToastContext);

const NAV_ITEMS = [
  { key: "section-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "section-vault", label: "The Vault", icon: Wallet },
  { key: "section-transfers", label: "Transfers", icon: ArrowLeftRight },
  { key: "section-activity", label: "Activity", icon: Activity },
  { key: "section-architecture", label: "Backend Flow", icon: Server, badge: "Sim" },
  { key: "section-settings", label: "Settings", icon: Settings },
];

function Sidebar({ activeSection }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside
      data-testid="treasury-sidebar"
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl"
    >
      <div className="px-5 py-5 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-emerald shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <CircleDollarSign className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100 tracking-tight">Helios</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
              Treasury OS
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              data-testid={`treasury-nav-${item.key}`}
              onClick={() => scrollToSection(item.key)}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-300 ring-1 ring-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                />
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                  {item.badge}
                </span>
              )}
              {isActive && !item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800/70">
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">PCI-DSS Certified</p>
            <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
              SOC 2 Type II &middot; ISO 27001
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onRefresh, refreshing, lastSync, showBalances, setShowBalances }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-zinc-950/70 border-b border-zinc-800/70">
      <div className="flex items-center gap-4 px-5 lg:px-8 h-16">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search accounts, transactions, counterparties..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus-ring transition outline-none focus:border-emerald-500/50"
            />
            <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800/80 rounded border border-zinc-700">
              &#8984;K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalances((v) => !v)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition border border-transparent hover:border-zinc-800"
            title={showBalances ? "Hide balances" : "Show balances"}
          >
            {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showBalances ? "Hide" : "Show"}</span>
          </button>

          <button
            data-testid="treasury-refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg transition border border-zinc-800 disabled:opacity-60"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              Live &middot; {lastSync ? new Date(lastSync).toLocaleTimeString() : "\u2014"}
            </span>
          </div>

          <button className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-[11px] font-bold text-zinc-950">
              EM
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-zinc-200 leading-tight">Elena Marchetti</p>
              <p className="text-[10px] text-zinc-500 leading-tight">Treasury Lead</p>
            </div>
            <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
      </div>
    </header>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone = "emerald", trend }) {
  const toneMap = {
    emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/10 ring-sky-500/20",
    violet: "text-violet-400 bg-violet-500/10 ring-violet-500/20",
    amber: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  };
  return (
    <div className="relative glass-card glass-card-hover rounded-2xl p-5 transition-all duration-300 overflow-hidden border border-zinc-800 bg-zinc-900/40">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-50 tracking-tight tabular-nums">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ring-1 ${toneMap[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
          {trend.up ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className={trend.up ? "text-emerald-400" : "text-rose-400"}>{trend.value}</span>
          <span className="text-zinc-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

function AccountCard({ account, showBalance, pulse }) {
  const meta = getCurrencyMeta(account.currency);
  const region = (account.id || "").split("-")[1] || "GLB";

  return (
    <div
      data-testid={`treasury-account-card-${account.id}`}
      className={`group relative glass-card glass-card-hover rounded-2xl p-5 transition-all duration-300 overflow-hidden border border-zinc-800 bg-zinc-900/40 ${
        pulse ? "ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.1)]" : ""
      }`}
    >
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none">
        <Globe className="w-full h-full" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center text-lg">
            <span aria-hidden="true">{meta.flag}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-semibold">
              {region} Account
            </p>
            <p className="text-sm font-semibold text-zinc-100 font-mono">{account.id}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700">
          {account.currency}
        </span>
      </div>

      <div className="relative mt-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
          Available Balance
        </p>
        <p className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
          {showBalance ? formatMoney(account.balance, account.currency) : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {meta.name} &middot; {account.currency}
        </p>
      </div>

      <div className="relative mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <Lock className="w-3 h-3" />
          <span>
            Opened{" "}
            {account.created_at ? new Date(account.created_at).toLocaleDateString() : "\u2014"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Active
        </div>
      </div>
    </div>
  );
}

function AccountCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-2.5 w-24 rounded bg-zinc-800 animate-pulse" />
        <div className="h-8 w-40 rounded bg-zinc-800 animate-pulse" />
      </div>
      <div className="mt-5 h-3 w-full rounded bg-zinc-800 animate-pulse" />
    </div>
  );
}

function TransferForm({ accounts, onSuccess }) {
  const { push } = useToast();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastIdempotencyKey, setLastIdempotencyKey] = useState(null);

  useEffect(() => {
    if (!accounts || accounts.length === 0) return;
    if (!fromAccountId) setFromAccountId(accounts[0].id);
    if (!toAccountId && accounts.length > 1) setToAccountId(accounts[1].id);
  }, [accounts, fromAccountId, toAccountId]);

  useEffect(() => {
    const acc = accounts.find((a) => a.id === fromAccountId);
    if (acc && !currency) setCurrency(acc.currency);
  }, [fromAccountId, accounts, currency]);

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId),
    [accounts, fromAccountId]
  );
  const toAccount = useMemo(
    () => accounts.find((a) => a.id === toAccountId),
    [accounts, toAccountId]
  );

  const numericAmount = parseFloat(amount);
  const insufficientFunds =
    fromAccount && !isNaN(numericAmount) && numericAmount > Number(fromAccount.balance);
  const sameAccount = fromAccountId && toAccountId && fromAccountId === toAccountId;
  const formValid =
    fromAccountId &&
    toAccountId &&
    !sameAccount &&
    !isNaN(numericAmount) &&
    numericAmount > 0 &&
    currency &&
    !insufficientFunds;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid || submitting) return;

    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
            .toString(36)
            .slice(2)}`;
    setLastIdempotencyKey(idempotencyKey);
    setSubmitting(true);

    const payload = {
      fromAccountId,
      toAccountId,
      amount: parseFloat(numericAmount.toFixed(2)),
      currency,
    };

    try {
      const res = await fetch(`${API_BASE}/api/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let body = null;
      if (contentType.includes("application/json")) {
        body = await res.json().catch(() => null);
      } else {
        body = await res.text().catch(() => null);
      }

      if (res.ok) {
        push({
          type: "success",
          title: "Transfer executed",
          description: `${formatMoney(payload.amount, payload.currency)} sent from ${
            payload.fromAccountId
          } \u2192 ${payload.toAccountId}`,
        });
        setAmount("");
        onSuccess && onSuccess();
      } else {
        const message =
          (body && typeof body === "object" && (body.message || body.error || body.detail)) ||
          (typeof body === "string" && body) ||
          `Transfer failed (HTTP ${res.status})`;

        if (res.status === 409) {
          push({
            type: "warning",
            title: "Duplicate transaction blocked",
            description: String(message),
          });
        } else if (res.status === 400) {
          push({
            type: "error",
            title: "Transfer rejected",
            description: String(message),
          });
        } else {
          push({
            type: "error",
            title: `Transfer failed \u00b7 ${res.status}`,
            description: String(message),
          });
        }
      }
    } catch (err) {
      push({
        type: "error",
        title: "Network error",
        description:
          err && err.message
            ? `${err.message}. Check that the backend is reachable at ${API_BASE}.`
            : `Unable to reach ${API_BASE}.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const swap = () => {
    setFromAccountId(toAccountId);
    setToAccountId(fromAccountId);
  };

  return (
    <form
      data-testid="treasury-transfer-form"
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl p-6 relative overflow-hidden border border-zinc-800 bg-zinc-900/40"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Settlement Engine</h3>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            Execute idempotent inter-account transfers with cryptographic deduplication.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800">
          <Hash className="w-3 h-3" /> Idempotent
        </span>
      </div>

      <div className="relative space-y-4">
        <FieldShell
          label="From Account"
          hint={
            fromAccount
              ? formatMoney(fromAccount.balance, fromAccount.currency) + " available"
              : null
          }
        >
          <AccountSelect
            testId="treasury-transfer-from"
            value={fromAccountId}
            onChange={setFromAccountId}
            accounts={accounts}
            placeholder="Select source account"
          />
        </FieldShell>

        <div className="flex justify-center -my-2">
          <button
            type="button"
            onClick={swap}
            disabled={!fromAccountId || !toAccountId}
            className="p-2 rounded-full bg-zinc-900 ring-1 ring-zinc-800 hover:ring-emerald-500/40 hover:text-emerald-400 text-zinc-400 transition disabled:opacity-40"
            title="Swap accounts"
            aria-label="Swap accounts"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <FieldShell
          label="To Account"
          error={sameAccount ? "Source and destination cannot be the same" : null}
        >
          <AccountSelect
            testId="treasury-transfer-to"
            value={toAccountId}
            onChange={setToAccountId}
            accounts={accounts}
            placeholder="Select destination account"
          />
        </FieldShell>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FieldShell label="Amount" error={insufficientFunds ? "Insufficient funds" : null}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                  {getCurrencyMeta(currency).symbol}
                </span>
                <input
                  data-testid="treasury-transfer-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-sm font-semibold tabular-nums outline-none focus:border-emerald-500/50 transition"
                />
              </div>
            </FieldShell>
          </div>
          <div>
            <FieldShell label="Currency">
              <div className="relative">
                <input
                  data-testid="treasury-transfer-currency"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 4))}
                  list="currency-list"
                  placeholder="GBP"
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 placeholder-zinc-600 text-sm font-semibold uppercase outline-none transition"
                  readOnly
                />
                <datalist id="currency-list">
                  {Object.keys(CURRENCY_META).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </FieldShell>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 ring-1 ring-zinc-800 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Each submission generates a unique X-Idempotency-Key.</span>
          </div>
          {lastIdempotencyKey && (
            <code className="hidden md:inline text-[10px] text-zinc-600 font-mono truncate max-w-[140px]">
              {lastIdempotencyKey.slice(0, 8)}&hellip;
            </code>
          )}
        </div>

        <button
          data-testid="treasury-transfer-submit"
          type="submit"
          disabled={!formValid || submitting}
          className="group relative w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 text-sm font-bold tracking-tight transition hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Settling transfer&hellip;</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute Transfer</span>
              {fromAccount && toAccount && numericAmount > 0 && (
                <span className="opacity-80 font-mono">
                  &middot; {formatMoney(numericAmount, currency)}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FieldShell({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-semibold">
          {label}
        </label>
        {hint && !error && <span className="text-[10px] text-zinc-500 tabular-nums">{hint}</span>}
        {error && <span className="text-[10px] text-rose-400 font-medium">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function AccountSelect({ value, onChange, accounts, placeholder, testId }) {
  return (
    <div className="relative">
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-9 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm font-medium outline-none focus:border-emerald-500/50 transition cursor-pointer"
      >
        <option value="" disabled className="bg-zinc-900">
          {placeholder}
        </option>
        {accounts.map((a) => {
          const meta = getCurrencyMeta(a.currency);
          return (
            <option key={a.id} value={a.id} className="bg-zinc-900">
              {meta.flag} {a.id} &mdash; {formatMoney(a.balance, a.currency)}
            </option>
          );
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
    </div>
  );
}

function ActivityPanel({ activity }) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-zinc-800 bg-zinc-900/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-500/10 ring-1 ring-sky-500/20">
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Live Activity</h3>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-semibold">
          Session
        </span>
      </div>

      <div className="mt-5 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {activity.length === 0 && (
          <div className="py-10 text-center border border-dashed border-zinc-800/80 rounded-xl">
            <div className="mx-auto w-10 h-10 rounded-full bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500">No activity yet</p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Events will appear here in real time
            </p>
          </div>
        )}
        {activity.map((event) => (
          <div
            key={event.id || event.at}
            className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/40 ring-1 ring-zinc-800/80"
          >
            <div
              className={`mt-0.5 p-1.5 rounded-md ring-1 ${
                event.type === "success"
                  ? "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400"
                  : event.type === "warning"
                  ? "bg-amber-500/10 ring-amber-500/20 text-amber-400"
                  : event.type === "error"
                  ? "bg-rose-500/10 ring-rose-500/20 text-rose-400"
                  : "bg-sky-500/10 ring-sky-500/20 text-sky-400"
              }`}
            >
              {event.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : event.type === "warning" ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : event.type === "error" ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <RefreshCcw className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 leading-tight">{event.title}</p>
              {event.description && (
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed break-words">
                  {event.description}
                </p>
              )}
              <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                {new Date(event.at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCENARIOS = {
  fetch_miss: {
    title: "Account Sync (Database Fetch)",
    steps: [
      { actor: "React Client", icon: Globe, query: "GET /api/accounts", desc: "User requests latest ledger balances from dashboard.", color: "text-blue-400" },
      { actor: "Spring Boot API", icon: Server, query: "Route matched", desc: "API receives request and opens Database Context connection.", color: "text-zinc-300" },
      { actor: "PostgreSQL DB", icon: Database, query: "SELECT * FROM accounts", desc: "Executes standard SQL query to retrieve all active account records.", color: "text-indigo-400" },
      { actor: "Spring Boot API", icon: Server, query: "gson.toJson()", desc: "Java processes jOOQ ResultSet and flattens into clean JSON Array.", color: "text-zinc-300" },
      { actor: "React Client", icon: Globe, query: "HTTP 200 OK", desc: "Dashboard receives data, parses it, and dynamically populates The Vault UI.", color: "text-emerald-400" }
    ]
  },
  transfer_acid: {
    title: "Idempotent Transfer (ACID Write)",
    steps: [
      { actor: "React Client", icon: Globe, query: "POST /api/transfer", desc: "Transfer payload sent with cryptographic X-Idempotency-Key header.", color: "text-blue-400" },
      { actor: "Redis Cache", icon: HardDrive, query: "SETNX tx:uuid processing", desc: "Attempts distributed lock. If key exists, reject instantly as duplicate double-spend.", color: "text-rose-400" },
      { actor: "PostgreSQL DB", icon: Database, query: "BEGIN", desc: "Opens strict ACID transaction block.", color: "text-indigo-400" },
      { actor: "PostgreSQL DB", icon: Database, query: "UPDATE accounts SET balance = balance - X", desc: "Deducts sender. Throws exception and fails safely if insufficient funds.", color: "text-amber-400" },
      { actor: "PostgreSQL DB", icon: Database, query: "UPDATE accounts SET balance = balance + X", desc: "Credits receiver account seamlessly.", color: "text-amber-400" },
      { actor: "PostgreSQL DB", icon: Database, query: "INSERT INTO ledger_entries", desc: "Writes immutable transaction audit log to history table.", color: "text-indigo-400" },
      { actor: "PostgreSQL DB", icon: Database, query: "COMMIT", desc: "Persists all database changes atomically to hard disk.", color: "text-emerald-400" },
      { actor: "Spring Boot API", icon: Server, query: "return 200 OK", desc: "Closes DB connection, keeps Redis lock for 24h, and notifies React frontend.", color: "text-zinc-300" }
    ]
  }
};

function ArchitecturePanel() {
  const [scenarioKey, setScenarioKey] = useState("transfer_acid");
  const [currentStep, setCurrentStep] = useState(0);
  const scenario = SCENARIOS[scenarioKey];

  useEffect(() => { setCurrentStep(0); }, [scenarioKey]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 bg-zinc-900/30 border border-zinc-800 h-fit">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Architecture Sim</h2>
        <p className="text-xs text-zinc-500 mb-6">Trace the execution flow of your stack.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase text-zinc-500 font-semibold mb-2 block">Scenario</label>
            <select value={scenarioKey} onChange={(e) => setScenarioKey(e.target.value)} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 outline-none focus:border-emerald-500 transition">
              <option value="transfer_acid">Idempotent Transfer (ACID Write)</option>
              <option value="fetch_miss">Account Sync (Database Fetch)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setCurrentStep(prev => Math.min(prev + 1, scenario.steps.length - 1))} disabled={currentStep === scenario.steps.length - 1} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-zinc-950 font-bold text-sm rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition">
              {currentStep === scenario.steps.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
              {currentStep === scenario.steps.length - 1 ? "Flow Complete" : "Execute Next Step"}
            </button>
            <button onClick={() => setCurrentStep(0)} className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 glass-card rounded-2xl p-6 bg-zinc-950/50 border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Server className="w-40 h-40" /></div>
        <div className="relative space-y-0 pl-2">
          {scenario.steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            const isPending = idx > currentStep;

            return (
              <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                {idx !== scenario.steps.length - 1 && <div className={`absolute left-4 top-8 bottom-[-8px] w-0.5 ${isCompleted ? 'bg-emerald-500/50' : 'bg-zinc-800'} transition-colors duration-500`} />}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : isCompleted ? 'bg-zinc-900 border-emerald-500/50 text-emerald-500/80' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className={`flex-1 pt-1 transition-opacity duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="flex items-baseline gap-2"><span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">{step.actor}</span></div>
                  <div className={`mt-1 font-mono text-xs font-semibold ${isActive ? step.color : isCompleted ? 'text-zinc-400' : 'text-zinc-500'}`}>&gt;_ {step.query}</div>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-sm">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardInner() {
  const { push } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showBalances, setShowBalances] = useState(true);
  const [activeSection, setActiveSection] = useState("section-dashboard");
  const [pulseIds, setPulseIds] = useState(new Set());
  const [activity, setActivity] = useState([]);
  const activityIdRef = useRef(0);
  const previousBalancesRef = useRef(new Map());
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.6 });

    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.key);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [accounts]);

  const addActivity = useCallback((entry) => {
    activityIdRef.current += 1;
    setActivity((prev) =>
      [{ id: activityIdRef.current, at: Date.now(), ...entry }, ...prev].slice(0, 50)
    );
  }, []);

  const fetchAccounts = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setRefreshing(true);
      try {
        const res = await fetch(`${API_BASE}/api/accounts`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${text || ""}`.trim());
        }
        
        const rawData = await res.json();
        
        const list = (Array.isArray(rawData) ? rawData : []).map(item => {
          const keys = Object.keys(item);
          const idKey = keys.find(k => k.toLowerCase() === 'id') || 'id';
          const balanceKey = keys.find(k => k.toLowerCase() === 'balance') || 'balance';
          const currencyKey = keys.find(k => k.toLowerCase() === 'currency') || 'currency';
          const createdKey = keys.find(k => k.toLowerCase() === 'created_at') || 'created_at';

          return {
            ...item,
            id: String(item[idKey] || ""),
            balance: Number(item[balanceKey] || 0),
            currency: String(item[currencyKey] || "GBP"),
            created_at: item[createdKey] || null
          };
        });

        const changed = new Set();
        list.forEach((acc) => {
          const prev = previousBalancesRef.current.get(acc.id);
          if (prev !== undefined && Number(prev) !== Number(acc.balance)) {
            changed.add(acc.id);
          }
          previousBalancesRef.current.set(acc.id, acc.balance);
        });

        setAccounts(list);
        setLastSync(Date.now());
        setError(null);

        if (changed.size > 0) {
          setPulseIds(changed);
          setTimeout(() => setPulseIds(new Set()), 1800);
        }

        if (!silent) {
          addActivity({
            type: "info",
            title: "Accounts synced",
            description: `${list.length} account${list.length === 1 ? "" : "s"} loaded from /api/accounts`,
          });
        }
      } catch (err) {
        const msg = err && err.message ? err.message : "Unknown error";
        setError(msg);
        if (!silent) {
          push({
            type: "error",
            title: "Failed to load accounts",
            description: `${msg}. Verify the backend is running at ${API_BASE}.`,
          });
          addActivity({
            type: "error",
            title: "Sync failed",
            description: msg,
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [push, addActivity]
  );

  useEffect(() => {
    fetchAccounts({ silent: true });
  }, []);

  const totalsByCurrency = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => {
      map.set(a.currency, (map.get(a.currency) || 0) + Number(a.balance || 0));
    });
    return Array.from(map.entries());
  }, [accounts]);

  const primaryTotal = totalsByCurrency[0];
  const totalAccounts = accounts.length;
  const uniqueCurrencies = new Set(accounts.map((a) => a.currency)).size;

  const handleTransferSuccess = useCallback(() => {
    addActivity({
      type: "success",
      title: "Transfer settled",
      description: "Balance refresh triggered",
    });
    fetchAccounts();
  }, [fetchAccounts, addActivity]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex selection:bg-emerald-500/30 bg-grid-pattern">
      <Sidebar activeSection={activeSection} />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto scroll-smooth">
        <Topbar onRefresh={() => fetchAccounts()} refreshing={refreshing} lastSync={lastSync} showBalances={showBalances} setShowBalances={setShowBalances} />

        <div className="px-5 lg:px-8 py-8 max-w-[1600px] mx-auto space-y-16 pb-32">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>Helios Corp &middot; Global Treasury</span>
              </div>
              <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight text-zinc-50">
                Treasury <span className="gradient-text">Operations</span>
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 max-w-xl">
                Real-time visibility into multi-currency positions and instant settlement across
                your corporate accounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-800 text-[11px] text-zinc-400 font-mono">
                ENV &middot; <span className="text-emerald-400">production</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-800 text-[11px] text-zinc-400">
                API &middot; <span className="font-mono">localhost:8080</span>
              </div>
            </div>
          </div>

          {error && !loading && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/5 ring-1 ring-rose-500/30">
              <div className="p-1.5 rounded-md bg-rose-500/10 ring-1 ring-rose-500/20">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-rose-200">
                  Unable to reach treasury backend
                </p>
                <p className="mt-1 text-xs text-rose-300/80 break-words">
                  {error}. Ensure the Java microservice is running and exposed at{" "}
                  <span className="font-mono">{API_BASE}</span>.
                </p>
              </div>
              <button
                onClick={() => fetchAccounts()}
                className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/20 transition"
              >
                Retry
              </button>
            </div>
          )}

          <section id="section-dashboard" className="space-y-6 pt-4 scroll-mt-24">
            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-zinc-500"/> Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard icon={Wallet} tone="emerald" label="Primary Position" value={showBalances && primaryTotal ? formatMoney(primaryTotal[1], primaryTotal[0]) : showBalances ? "\u2014" : "\u2022\u2022\u2022\u2022\u2022\u2022"} sub={primaryTotal ? `${primaryTotal[0]} \u00b7 aggregated` : "No accounts"} trend={{ up: true, value: "+0.42%", label: "vs yesterday" }} />
              <KpiCard icon={Globe} tone="sky" label="Currencies" value={uniqueCurrencies} sub="Active corridors" />
              <KpiCard icon={Building2} tone="violet" label="Accounts" value={totalAccounts} sub="Across all entities" />
              <KpiCard icon={TrendingUp} tone="amber" label="Settlement SLA" value="< 240ms" sub="P95 last 24h" trend={{ up: true, value: "-12ms", label: "improvement" }} />
            </div>
          </section>

          <section id="section-vault" className="space-y-6 pt-4 scroll-mt-24">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                   <Wallet className="w-5 h-5 text-emerald-400"/> The Vault
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Live balances across your corporate accounts.</p>
              </div>
              {!loading && accounts.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                  <span className="tabular-nums">{accounts.length}</span>
                  <span className="text-zinc-600">accounts</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading && accounts.length === 0 && (
                <><AccountCardSkeleton /><AccountCardSkeleton /><AccountCardSkeleton /></>
              )}
              {!loading && accounts.length === 0 && !error && (
                <div className="col-span-full glass-card rounded-2xl p-10 text-center border border-zinc-800">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center mb-4"><Wallet className="w-5 h-5 text-zinc-500" /></div>
                  <p className="text-sm font-semibold text-zinc-300">No accounts found</p>
                  <p className="text-xs text-zinc-500 mt-1">The backend returned an empty list. Provision an account to get started.</p>
                </div>
              )}
              {accounts.map((acc) => (
                <AccountCard key={acc.id} account={acc} showBalance={showBalances} pulse={pulseIds.has(acc.id)} />
              ))}
            </div>

            {totalsByCurrency.length > 1 && (
              <div className="glass-card rounded-2xl p-5 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-200">Aggregated by currency</h3>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 font-semibold">Totals</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {totalsByCurrency.map(([cur, total]) => (
                    <div key={cur} className="p-3 rounded-lg bg-zinc-950/50 ring-1 ring-zinc-800">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                        <span>{getCurrencyMeta(cur).flag}</span>
                        <span>{cur}</span>
                      </div>
                      <p className="mt-1 text-base font-bold tabular-nums text-zinc-100">
                        {showBalances ? formatMoney(total, cur) : "\u2022\u2022\u2022\u2022\u2022\u2022"}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {showBalances ? `\u2248 ${formatCompact(total)} ${cur}` : "\u2014"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="section-transfers" className="space-y-6 pt-4 scroll-mt-24">
            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-zinc-500"/> Operations Desk
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               <TransferForm accounts={accounts} onSuccess={handleTransferSuccess} />
               <div id="section-activity" className="scroll-mt-24">
                  <ActivityPanel activity={activity} />
               </div>
            </div>
          </section>

          <section id="section-architecture" className="space-y-6 pt-4 scroll-mt-24">
            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-5 h-5 text-zinc-500"/> Backend Flow Visualization
            </h2>
            <ArchitecturePanel />
          </section>

          <section id="section-settings" className="space-y-6 pt-4 scroll-mt-24">
            <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-500"/> System Parameters
            </h2>
            <div className="p-6 border border-zinc-800 bg-zinc-900/10 rounded-2xl max-w-2xl">
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                    <span className="text-sm font-semibold text-zinc-300">API Connection</span>
                    <code className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">{API_BASE}</code>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                    <span className="text-sm font-semibold text-zinc-300">Deduplication Guard</span>
                    <span className="text-xs text-zinc-400">Redis Distributed Lock Active</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-300">Persistence Target</span>
                    <span className="text-xs text-zinc-400">PostgreSQL ACID Commit Block</span>
                 </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default function TreasuryDashboard() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}
