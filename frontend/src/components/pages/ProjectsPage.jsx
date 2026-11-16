import { useEffect, useState } from "react";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import ProjectList from "../projects/ProjectList";
import ProjectWorkspace from "../projects/ProjectWorkspace";
import CreateProjectModal from "../projects/CreateProjectModal";
import Alert from "../common/Alert";
import Button from "../common/Button";
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
      success("Project created successfully");
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
    <div className="space-y-5 text-left">
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary font-heading">
                Projects
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Manage projects, collaborators, and track progress.
              </p>
            </div>

            {user && (
              <Button
                variant="primary"
                size="md"
                icon={PlusIcon}
                onClick={() => setCreateModalOpen(true)}
              >
                New project
              </Button>
            )}
          </div>

          {projectError && <Alert type="error" message={projectError} />}
          {projectSuccess && <Alert type="success" message={projectSuccess} />}

          {/* Projects List */}
          <ProjectList
            projects={projects}
            tasks={taskState.allTasks}
            user={user}
            loading={projectsLoading}
            onRefresh={fetchProjects}
            onSelectProject={(p) => setSelectedProjectId(p._id || p.id)}
            onUpdateProject={updateProject}
            onDeleteProject={handleDeleteProject}
            onAddMember={addMember}
            onRemoveMember={removeMember}
          />

          {/* Create Project Modal */}
          {createModalOpen && (
            <CreateProjectModal
              isOpen={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateProject}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
