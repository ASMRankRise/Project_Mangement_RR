import { useTheme } from "../../context/ThemeContext";
import { Modal } from "./Modal";
import { RoleBadge } from "./Badge";
import { Avatar } from "./Avatar";
import { SunIcon, MoonIcon, ShieldIcon, CheckCircleIcon } from "./Icons";

export function SettingsModal({ isOpen, onClose, user }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workspace Preferences & Account" size="md">
      <div className="space-y-6 text-slate-800 dark:text-slate-200">
        {/* Account Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            User Profile
          </h4>
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <Avatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </span>
                <RoleBadge role={user?.role} size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Appearance
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Choose how ProjectHub looks to you. Select a theme or switch anytime.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-amber-500 shadow-xs border border-slate-200 dark:border-slate-700">
                <SunIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">Light Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Crisp & clear</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                theme === "dark"
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700">
                <MoonIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">Dark Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Obsidian focus</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 py-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Authentication</span>
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">JWT Cookie-Protected</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 py-1.5">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Status</span>
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Connected & Synced</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;

