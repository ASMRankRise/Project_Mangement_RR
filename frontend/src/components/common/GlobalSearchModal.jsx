import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, FolderIcon, CheckSquareIcon, XIcon } from "./Icons";
import { StatusBadge, PriorityBadge } from "./Badge";

export function GlobalSearchModal({
  isOpen,
  onClose,
  projects = [],
  tasks = [],
  onSelectProject,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingProjects = q
    ? projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchingTasks = q
    ? tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  const hasResults = matchingProjects.length > 0 || matchingTasks.length > 0;

  const handleProjectClick = (p) => {
    onClose();
    if (onSelectProject) {
      onSelectProject(p);
    }
    navigate("/projects");
  };

  const handleTaskClick = () => {
    onClose();
    navigate("/tasks");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
      />

      {/* Search dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] text-slate-900 dark:text-slate-100 shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <SearchIcon className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, deliverables..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!q ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              Type to search across your accessible workspaces and tasks...
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching projects or tasks found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Projects section */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Workspaces ({matchingProjects.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingProjects.map((p) => (
                      <div
                        key={p._id || p.id}
                        onClick={() => handleProjectClick(p)}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FolderIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Jump to Workspace →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks section */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tasks ({matchingTasks.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingTasks.map((t) => (
                      <div
                        key={t._id || t.id}
                        onClick={handleTaskClick}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckSquareIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {t.project?.name || "Workspace"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={t.status} size="xs" />
                          <PriorityBadge priority={t.priority} size="xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Search your workspaces and deliverables</span>
          <span className="hidden sm:inline">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;

