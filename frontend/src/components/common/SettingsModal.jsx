import { useTheme } from "../../context/ThemeContext";
import { Modal } from "./Modal";
import { RoleBadge } from "./Badge";
import { Avatar } from "./Avatar";
import { SunIcon, MoonIcon, CheckCircleIcon } from "./Icons";
import { Button } from "./Button";

export function SettingsModal({ isOpen, onClose, user }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferences" size="md">
      <div className="space-y-4 text-text-primary">
        {/* Account Info */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Account Profile
          </h4>
          <div className="flex items-center gap-3 p-3.5 rounded-md border border-border bg-surface-subtle">
            <Avatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-text-primary truncate">
                  {user?.name || "User"}
                </span>
                <RoleBadge role={user?.role} size="sm" />
              </div>
              <p className="text-[13px] text-text-secondary truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Appearance
          </h4>
          <p className="text-[13px] text-text-secondary mb-3">
            Select your preferred display theme for this session.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors cursor-pointer ${
                theme === "light"
                  ? "border-brand bg-brand/10 text-text-primary shadow-subtle font-semibold"
                  : "border-border hover:bg-surface-subtle text-text-secondary"
              }`}
            >
              <div className="p-2 rounded bg-surface text-accent border border-border">
                <SunIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block">Light</span>
                <span className="text-[12px] text-text-secondary">Warm Alabaster</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors cursor-pointer ${
                theme === "dark"
                  ? "border-brand bg-brand/10 text-text-primary shadow-subtle font-semibold"
                  : "border-border hover:bg-surface-subtle text-text-secondary"
              }`}
            >
              <div className="p-2 rounded bg-surface text-text-secondary border border-border">
                <MoonIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block">Dark</span>
                <span className="text-[12px] text-text-secondary">Warm Charcoal</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Access */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Session & Access
          </h4>
          <div className="p-3.5 rounded-md border border-border bg-surface-subtle text-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[13px]">Authentication</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-brand text-[13px]">
                <CheckCircleIcon className="w-4 h-4" />
                <span>JWT Secure Cookie</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[13px]">Access Role</span>
              <span className="font-medium text-text-primary text-[13px]">
                {user?.role === "superadmin"
                  ? "Super Administrator"
                  : user?.role === "admin"
                  ? "Administrator"
                  : "Employee"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
