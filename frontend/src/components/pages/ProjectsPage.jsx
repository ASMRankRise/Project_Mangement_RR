import { useEffect, useState } from "react";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import ProjectList from "../projects/ProjectList";
import ProjectWorkspace from "../projects/ProjectWorkspace";
import CreateProjectModal from "../projects/CreateProjectModal";
import Alert from "../common/Alert";
import { PlusIcon } from "../common/Icons";
import { useToast } from "../../context/ToastContext";

export function ProjectsPage({ user }) {
  const { success, error: toastError } = useToast();

  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    success: projectSuccess,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  } = useProjects();

  const taskState = useTasks(user, { limit: 100 });
  const { fetchTasks } = taskState;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const selectedProject = projects.find(
    (p) => String(p._id || p.id) === String(selectedProjectId),
  );

  const handleCreateProject = async (name, description) => {
    const res = await createProject(name, description);
    if (res?.success !== false) {
      success("Project workspace created!");
      setCreateModalOpen(false);
    } else {
      toastError(res?.error || "Failed to create project");
    }
    return res;
  };

  const handleDeleteProject = async (projectId) => {
    const res = await deleteProject(projectId);
    if (res?.success !== false) {
      success("Project deleted successfully");
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    } else {
      toastError(res?.error || "Failed to delete project");
    }
    return res;
  };

  return (
    <div className="space-y-6">
      {/* If a project is selected, render the full Project Workspace */}
      {selectedProject ? (
        <ProjectWorkspace
          project={selectedProject}
          allTasks={taskState.allTasks}
          currentUser={user}
          onBack={() => setSelectedProjectId(null)}
          onUpdateProject={updateProject}
          onDeleteProject={handleDeleteProject}
          onTaskCreate={taskState.createTask}
          onTaskUpdate={taskState.updateTask}
          onTaskDelete={taskState.deleteTask}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onRefresh={fetchProjects}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Workspaces & Teams
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Projects
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Organize projects, manage team permissions, and monitor task completion progress.
              </p>
            </div>

            {user && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Project</span>
              </button>
            )}
          </div>

          {projectError && <Alert type="error" message={projectError} />}
          {projectSuccess && <Alert type="success" message={projectSuccess} />}

          {/* Projects Gallery */}
          <ProjectList
            projects={projects}
            tasks={taskState.allTasks}
            user={user}
            loading={projectsLoading}
            onRefresh={fetchProjects}
            onSelectProject={(project) => setSelectedProjectId(project._id || project.id)}
            onUpdateProject={updateProject}
            onDeleteProject={handleDeleteProject}
            onAddMember={addMember}
            onRemoveMember={removeMember}
          />

          {/* Create Project Modal */}
          <CreateProjectModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onCreate={handleCreateProject}
            loading={projectsLoading}
          />
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
