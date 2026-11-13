import { useTheme } from "../../context/ThemeContext";
import { Modal } from "./Modal";
import { RoleBadge } from "./Badge";
import { Avatar } from "./Avatar";
import { SunIcon, MoonIcon, CheckCircleIcon } from "./Icons";

export function SettingsModal({ isOpen, onClose, user }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workforce Preferences" size="md">
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* Account Info */}
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Employee Account
          </h4>
          <div className="flex items-center gap-3 p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <Avatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </span>
                <RoleBadge role={user?.role} size="xs" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Appearance
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
            Select your preferred display theme for this browser session.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2.5 p-2.5 rounded-md border text-left transition cursor-pointer ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 shadow-2xs font-semibold"
                  : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="p-1.5 rounded bg-white dark:bg-slate-800 text-amber-500 border border-slate-200 dark:border-slate-700">
                <SunIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold block">Light</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Default clean</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2.5 p-2.5 rounded-md border text-left transition cursor-pointer ${
                theme === "dark"
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 shadow-2xs font-semibold"
                  : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                <MoonIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold block">Dark</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Low light</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security Summary */}
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Security & Session
          </h4>
          <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Authentication</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>JWT Secure Cookie</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Access Privilege</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {user?.role === "admin" ? "Administrator" : "Employee"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
