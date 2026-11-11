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
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 transition-opacity"
      />

      {/* Search dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] text-slate-900 dark:text-slate-100 shadow-xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, deliverables..."
            className="w-full bg-transparent text-xs font-normal text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-1.5">
          {!q ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Type to search across workspaces and tasks...
            </div>
          ) : !hasResults ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Projects section */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Workspaces ({matchingProjects.length})
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {matchingProjects.map((p) => (
                      <div
                        key={p._id || p.id}
                        onClick={() => handleProjectClick(p)}
                        className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Open</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks section */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tasks ({matchingTasks.length})
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {matchingTasks.map((t) => (
                      <div
                        key={t._id || t.id}
                        onClick={handleTaskClick}
                        className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckSquareIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {t.title}
                          </span>
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
      </div>
    </div>
  );
}

export default GlobalSearchModal;
