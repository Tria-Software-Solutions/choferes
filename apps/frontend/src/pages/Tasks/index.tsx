import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  ButtonBase,
  Collapse,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconBellRinging,
  IconCalendarEvent,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconCircleCheck,
  IconLayoutSidebar,
  IconSearch,
  IconSortDescending,
  IconStar,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";
import { EmptyState, LoadingState, PageCard, PageContainer, PageHeader } from "../../components/Layout";
import NavIcon from "../../components/NavIcon/NavIcon.component";
import APPBAR_MENU from "../../constants/appbar.constants";
import DialogComponent from "../../components/Dialog/Dialog.component";
import { Task, TaskList } from "../../models/Task";
import { TASK_REMINDER_EVENT } from "../../context/NotificationContext";
import { useTasks } from "./useTasks";
import {
  formatLongDate,
  groupCompletedTasks,
  groupOpenTasks,
  isListView,
  isOverdue,
  listIdOfView,
  matchesSearch,
  SORT_OPTIONS,
  sortTasks,
  TaskGroup,
  TaskSort,
  TaskView,
  tasksOfView,
  todayISO,
  viewTitle,
} from "./taskUtils";
import TaskSidebar from "./components/TaskSidebar";
import TaskQuickAdd from "./components/TaskQuickAdd";
import TaskItem, { DragGrip } from "./components/TaskItem";
import TaskDetailPanel from "./components/TaskDetailPanel";
import ListDialog from "./components/ListDialog";

const VIEW_KEY = "tasks:view";
const SORT_KEY = "tasks:sort";

const readPref = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
};
const writePref = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode / blocked storage: preferences just don't persist.
  }
};

const EMPTY: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
  today: {
    icon: <IconSun />,
    title: "Todo listo por hoy",
    description: "No tienes tareas para hoy. Agrega una o revisa las próximas.",
  },
  upcoming: {
    icon: <IconCalendarEvent />,
    title: "Nada programado",
    description: "Las tareas con fecha aparecerán aquí, agrupadas por día.",
  },
  important: {
    icon: <IconStar />,
    title: "Sin tareas importantes",
    description: "Marca una tarea con la estrella para tenerla siempre a mano.",
  },
  completed: {
    icon: <IconCircleCheck />,
    title: "Aún no hay tareas completadas",
    description: "Cuando completes una tarea la verás aquí.",
  },
  default: {
    icon: <IconChecklist />,
    title: "Sin tareas pendientes",
    description: "Escribe arriba para agregar tu primera tarea.",
  },
};

interface SortableRowProps {
  task: Task;
  children: (handle: React.ReactNode) => React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({ task, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{ position: "relative", zIndex: isDragging ? 2 : "auto", opacity: isDragging ? 0.85 : 1 }}
    >
      {children(
        <Box
          component="span"
          {...attributes}
          {...listeners}
          aria-label="Arrastrar para reordenar"
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
          sx={{ cursor: "grab", display: "flex", touchAction: "none" }}
        >
          <DragGrip />
        </Box>,
      )}
    </Box>
  );
};

// "Tareas": personal to-do lists with smart views, reminders (delivered as
// in-app + browser notifications), recurrence, steps and notes.
const TasksPage: React.FC = () => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const store = useTasks();
  const { tasks, lists } = store;
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setViewState] = useState<TaskView>(() => readPref<TaskView>(VIEW_KEY, "today"));
  const [sort, setSortState] = useState<TaskSort>(() => readPref<TaskSort>(SORT_KEY, "manual"));
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [listDialog, setListDialog] = useState<{ open: boolean; list: TaskList | null }>({ open: false, list: null });
  const [listToDelete, setListToDelete] = useState<TaskList | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
  );
  const quickAddRef = useRef<HTMLDivElement>(null);

  const setView = useCallback((next: TaskView) => {
    setViewState(next);
    writePref(VIEW_KEY, next);
    setSidebarOpen(false);
    setShowCompleted(false);
  }, []);

  const setSort = (next: TaskSort) => {
    setSortState(next);
    writePref(SORT_KEY, next);
  };

  // A stored view whose list no longer exists falls back to "Hoy".
  useEffect(() => {
    const listId = listIdOfView(view);
    if (!store.isLoading && typeof listId === "number" && !lists.some((list) => list.id === listId)) {
      setView("today");
    }
  }, [view, lists, store.isLoading, setView]);

  // Deep link from a reminder notification: /tasks?task=<id>
  const linkedId = Number(searchParams.get("task")) || null;
  useEffect(() => {
    if (linkedId && tasks.some((task) => task.id === linkedId)) setSelectedId(linkedId);
  }, [linkedId, tasks]);

  const closeDetail = () => {
    setSelectedId(null);
    if (searchParams.has("task")) {
      searchParams.delete("task");
      setSearchParams(searchParams, { replace: true });
    }
  };

  // A reminder just fired: refresh so its task shows "Recordatorio enviado".
  const { reload } = store;
  useEffect(() => {
    const onReminder = () => void reload();
    window.addEventListener(TASK_REMINDER_EVENT, onReminder);
    return () => window.removeEventListener(TASK_REMINDER_EVENT, onReminder);
  }, [reload]);

  // "N" focuses the composer (outside of text fields).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key.toLowerCase() !== "n" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      event.preventDefault();
      quickAddRef.current?.querySelector("input")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const searching = search.trim().length > 0;
  const listView = isListView(view);
  const sortable = listView && sort === "manual" && !searching;

  const scoped = useMemo(() => tasksOfView(view, tasks), [view, tasks]);
  const openGroups: TaskGroup[] = useMemo(() => {
    if (searching) {
      const results = tasks.filter((task) => matchesSearch(task, search));
      const open = sortTasks(results.filter((task) => !task.completedAt), "dueDate");
      const done = results.filter((task) => task.completedAt);
      return [
        { key: "results", label: open.length ? "Pendientes" : "", tasks: open },
        ...(done.length ? [{ key: "results-done", label: "Completadas", tasks: done }] : []),
      ].filter((group) => group.tasks.length > 0);
    }
    if (view === "completed") return groupCompletedTasks(scoped);
    return groupOpenTasks(view, scoped.filter((task) => !task.completedAt), sort);
  }, [searching, search, tasks, view, scoped, sort]);

  const completedInView = useMemo(() => {
    if (searching || view === "completed" || view === "upcoming") return [];
    const today = todayISO();
    return scoped
      .filter((task) => {
        if (!task.completedAt) return false;
        if (view === "today") return task.completedAt.slice(0, 10) === today || (task.dueDate ?? "") === today;
        if (view === "important") return task.isImportant;
        return true;
      })
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  }, [searching, view, scoped]);

  const openCount = tasks.filter((task) => !task.completedAt).length;
  const overdueCount = tasks.filter((task) => isOverdue(task)).length;
  const hasOpenTasks = openGroups.some((group) => group.tasks.length > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = openGroups[0]?.tasks ?? [];
    const from = ordered.findIndex((task) => task.id === active.id);
    const to = ordered.findIndex((task) => task.id === over.id);
    if (from < 0 || to < 0) return;
    void store.reorder(arrayMove(ordered, from, to).map((task) => task.id));
  };

  const requestBrowserNotifications = async () => {
    if (permission === "unsupported") return;
    setPermission(await Notification.requestPermission());
  };

  const renderRow = (task: Task, handle?: React.ReactNode) => (
    <TaskItem
      key={task.id}
      task={task}
      lists={lists}
      selected={task.id === selectedId}
      showList={!listView || searching}
      onOpen={(item) => setSelectedId(item.id)}
      onPatch={(id, input) => void store.patchTask(id, input)}
      onDuplicate={(item) => void store.duplicateTask(item)}
      onDelete={setDeleteTarget}
      dragHandle={handle}
    />
  );

  const renderGroup = (group: TaskGroup, index: number) => (
    <Box key={group.key} component="section" sx={{ mb: 1.5 }} aria-label={group.label || undefined}>
      {group.label && (
        <Typography
          component="h3"
          sx={{
            px: { xs: 1, sm: 1.5 },
            pt: index === 0 ? 0.5 : 1.5,
            pb: 0.5,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: group.tone === "danger" ? colors.error : group.tone === "accent" ? colors.accent : colors.textMuted,
          }}
        >
          {group.label.charAt(0).toUpperCase() + group.label.slice(1)}
          <Box component="span" sx={{ ml: 0.75, fontWeight: 600, color: colors.textSubtle }}>
            {group.tasks.length}
          </Box>
        </Typography>
      )}
      {sortable && index === 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={group.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {group.tasks.map((task) => (
              <SortableRow key={task.id} task={task}>
                {(handle) => renderRow(task, handle)}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        group.tasks.map((task) => renderRow(task))
      )}
    </Box>
  );

  const empty = EMPTY[view] ?? EMPTY.default;
  const title = searching ? "Resultados de búsqueda" : viewTitle(view, lists);
  const subtitle =
    view === "today" && !searching
      ? formatLongDate(todayISO())
      : searching
        ? `“${search.trim()}”`
        : undefined;

  const sidebar = (
    <TaskSidebar
      view={view}
      onViewChange={(next) => {
        setSearch("");
        setView(next);
      }}
      tasks={tasks}
      lists={lists}
      search={search}
      onSearchChange={setSearch}
      onNewList={() => setListDialog({ open: true, list: null })}
      onEditList={(list) => setListDialog({ open: true, list })}
      onDeleteList={setListToDelete}
    />
  );

  const detail = selectedTask && (
    <TaskDetailPanel
      task={selectedTask}
      lists={lists}
      onPatch={(id, input) => void store.patchTask(id, input)}
      onDelete={setDeleteTarget}
      onClose={closeDetail}
    />
  );

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.TASKS} />}
          title="Tareas"
          subtitle={
            store.isLoading
              ? "Cargando…"
              : `${openCount} pendiente${openCount === 1 ? "" : "s"}${overdueCount ? ` · ${overdueCount} vencida${overdueCount === 1 ? "" : "s"}` : ""}`
          }
          actions={
            <>
              {permission === "default" && (
                <Tooltip title="Recibe tus recordatorios aunque estés en otra pestaña o ventana">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconBellRinging size={16} />}
                    onClick={() => void requestBrowserNotifications()}
                  >
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Activar avisos
                    </Box>
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Avisos
                    </Box>
                  </Button>
                </Tooltip>
              )}
              {!isDesktop && (
                <Tooltip title="Listas y vistas">
                  <IconButton aria-label="Abrir listas y vistas" onClick={() => setSidebarOpen(true)}>
                    <IconLayoutSidebar size={20} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          }
        />

        {store.isLoading ? (
          <LoadingState />
        ) : store.loadError ? (
          <EmptyState
            icon={<IconChecklist />}
            title="No se pudieron cargar tus tareas"
            description={store.loadError}
            action={
              <Button variant="outlined" onClick={() => void store.reload()}>
                Reintentar
              </Button>
            }
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: selectedTask ? "248px minmax(0,1fr) 360px" : "248px minmax(0,1fr)",
                lg: selectedTask ? "264px minmax(0,1fr) 400px" : "264px minmax(0,1fr)",
              },
            }}
          >
            {isDesktop && (
              <Box sx={{ p: 1.5, borderRight: borders.hairline, minHeight: 0, overflow: "hidden" }}>{sidebar}</Box>
            )}

            <Box sx={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {/* View header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {!isDesktop && !searching && (
                    <ButtonBase
                      onClick={() => setSidebarOpen(true)}
                      sx={{ gap: 0.5, borderRadius: "8px", fontFamily: "inherit", color: colors.text }}
                      aria-label="Cambiar de vista"
                    >
                      <Typography component="h2" sx={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        {title}
                      </Typography>
                      <IconChevronDown size={18} />
                    </ButtonBase>
                  )}
                  {(isDesktop || searching) && (
                    <Typography component="h2" noWrap sx={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }}>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {!searching && view !== "completed" && (
                  <Tooltip title="Ordenar">
                    <IconButton aria-label="Ordenar tareas" onClick={(event) => setSortAnchor(event.currentTarget)}>
                      <IconSortDescending size={19} />
                    </IconButton>
                  </Tooltip>
                )}
                {view === "completed" && scoped.length > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    startIcon={<IconTrash size={16} />}
                    onClick={() => void store.clearCompleted()}
                  >
                    Borrar todas
                  </Button>
                )}
              </Box>

              {!searching && view !== "completed" && (
                <Box ref={quickAddRef} sx={{ px: { xs: 1.5, sm: 3 }, pb: 1.5 }}>
                  <TaskQuickAdd view={view} lists={lists} onAdd={store.addTask} autoFocus={isDesktop} />
                </Box>
              )}

              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: { xs: 0.5, sm: 1.5 }, pl: { md: 3 }, pb: 3 }}>
                {hasOpenTasks ? (
                  openGroups.map(renderGroup)
                ) : searching ? (
                  <EmptyState
                    icon={<IconSearch />}
                    title="Sin resultados"
                    description="Prueba con otras palabras; se buscan títulos, notas y pasos."
                  />
                ) : (
                  <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
                )}

                {completedInView.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 1, sm: 1.5 } }}>
                      <ButtonBase
                        onClick={() => setShowCompleted((value) => !value)}
                        aria-expanded={showCompleted}
                        sx={{
                          gap: 0.75,
                          px: 1,
                          py: 0.5,
                          ml: -1,
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color: colors.textMuted,
                          "&:hover": { backgroundColor: colors.hover },
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            transition: "transform 0.15s ease",
                            transform: showCompleted ? "rotate(0deg)" : "rotate(-90deg)",
                          }}
                        >
                          <IconChevronDown size={16} />
                        </Box>
                        {view === "today" ? "Completadas hoy" : "Completadas"} ({completedInView.length})
                      </ButtonBase>
                      <Box sx={{ flex: 1 }} />
                      {listView && showCompleted && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            const listId = listIdOfView(view);
                            void store.clearCompleted(listId === null ? "inbox" : (listId as number));
                          }}
                        >
                          Borrar completadas
                        </Button>
                      )}
                    </Box>
                    <Collapse in={showCompleted} unmountOnExit>
                      <Box sx={{ pt: 0.5 }}>{completedInView.map((task) => renderRow(task))}</Box>
                    </Collapse>
                  </Box>
                )}
              </Box>
            </Box>

            {isDesktop && selectedTask && (
              <Box sx={{ borderLeft: borders.hairline, minHeight: 0, backgroundColor: colors.surface }}>{detail}</Box>
            )}
          </Box>
        )}
      </PageCard>

      {/* Phones / tablets: views in a left drawer, details full screen */}
      {!isDesktop && (
        <>
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            PaperProps={{ sx: { width: "min(320px, 86vw)", p: 1.5, backgroundColor: colors.surface } }}
          >
            {sidebar}
          </Drawer>
          <Drawer
            anchor="right"
            open={Boolean(selectedTask)}
            onClose={closeDetail}
            PaperProps={{ sx: { width: "100vw", maxWidth: 480, backgroundColor: colors.surface } }}
          >
            {detail}
          </Drawer>
        </>
      )}

      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        {SORT_OPTIONS.filter((option) => listView || option.value !== "manual").map((option) => (
          <MenuItem
            key={option.value}
            selected={sort === option.value}
            onClick={() => {
              setSort(option.value);
              setSortAnchor(null);
            }}
          >
            <ListItemIcon>{sort === option.value ? <IconCheck size={17} /> : null}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <DialogComponent
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        type="delete"
        title="Eliminar tarea"
        message={deleteTarget ? `“${deleteTarget.title}” se eliminará definitivamente.` : ""}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.id === selectedId) closeDetail();
            void store.removeTask(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />

      <DialogComponent
        open={Boolean(listToDelete)}
        onClose={() => setListToDelete(null)}
        type="delete"
        title="Eliminar lista"
        message={
          listToDelete
            ? `Se eliminará “${listToDelete.name}” junto con sus ${tasks.filter((task) => task.listId === listToDelete.id).length} tarea(s).`
            : ""
        }
        onConfirm={async () => {
          if (listToDelete) {
            const removed = await store.removeList(listToDelete.id);
            if (removed && view === `list:${listToDelete.id}`) setView("inbox");
          }
          setListToDelete(null);
        }}
      />

      <ListDialog
        open={listDialog.open}
        list={listDialog.list}
        onClose={() => setListDialog({ open: false, list: null })}
        onSave={async (name, color) => {
          if (listDialog.list) {
            await store.editList(listDialog.list.id, { name, color });
          } else {
            const created = await store.addList(name, color);
            if (created) setView(`list:${created.id}`);
          }
          setListDialog({ open: false, list: null });
        }}
      />
    </PageContainer>
  );
};

export default TasksPage;
