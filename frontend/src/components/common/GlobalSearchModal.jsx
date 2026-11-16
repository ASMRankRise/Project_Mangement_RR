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
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
      />

      {/* Search dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface text-text-primary shadow-xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-surface-subtle">
          <SearchIcon className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects and tasks..."
            className="w-full bg-transparent text-sm font-normal text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-text-tertiary hover:text-text-primary p-0.5 rounded cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-border bg-surface px-1.5 py-0.5 text-[12px] font-mono font-medium text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {!q ? (
            <div className="py-6 text-center text-sm text-text-tertiary">
              Type to search across projects and tasks...
            </div>
          ) : !hasResults ? (
            <div className="py-6 text-center text-sm text-text-tertiary">
              No matching results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Projects section */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Projects ({matchingProjects.length})
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {matchingProjects.map((p) => (
                      <div
                        key={p._id || p.id}
                        onClick={() => handleProjectClick(p)}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderIcon className="w-4 h-4 text-text-tertiary shrink-0" />
                          <span className="text-[13px] font-medium text-text-primary truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[12px] text-text-tertiary">Open</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks section */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Tasks ({matchingTasks.length})
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {matchingTasks.map((t) => (
                      <div
                        key={t._id || t.id}
                        onClick={handleTaskClick}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckSquareIcon className="w-4 h-4 text-text-tertiary shrink-0" />
                          <span className="text-[13px] font-medium text-text-primary truncate">
                            {t.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={t.status} size="sm" />
                          <PriorityBadge priority={t.priority} size="sm" />
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
