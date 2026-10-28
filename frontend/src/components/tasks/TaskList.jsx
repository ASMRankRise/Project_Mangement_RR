import TaskCard from "./TaskCard";
import Pagination from "./Pagination";

function TaskList({
  tasks = [],
  projects = [],
  user,
  page,
  totalPages = 1,
  total = 0,
  loading,
  onPageChange,
  onUpdate,
  onDelete,
}) {
  const isAdmin = user?.role === "admin";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">
          {isAdmin ? "All Tasks" : "My Tasks"}
        </h2>

        <span className="text-sm text-gray-400">Total Tasks: {total}</span>
      </div>

      {loading ? (
        <p className="py-6 text-center text-gray-400">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-gray-700 p-6 text-center">
          <p className="text-gray-300">No tasks found.</p>
          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              projects={projects}
              user={user}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          loading={loading}
          onPageChange={onPageChange}
          
        />
      )}
    </section>
  );
}

export default TaskList;
