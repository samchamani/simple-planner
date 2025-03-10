import styles from "./Cell.module.css";
import { Icon } from "frontin";

import { TaskBox } from "./TaskBox";
import { Shadow } from "./Planner";
import { useIdContext } from "../contexts/Id";
import { DragData } from "../hooks/useDrag";
import { Plan, Task, usePlan } from "../contexts/Plan";
import { classnames, isSameDay } from "../util";

type Props = {
  id: string;
  date: Date;
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
  onTaskDrag: (dragData: DragData<HTMLDivElement>) => void;
  onTaskDrop: (task: Task) => void;
  shadow?: Shadow;
};

const MONTHS = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const Cell = ({
  id,
  date,
  tasks,
  onTaskDrop,
  onTaskDrag,
  shadow,
}: Props) => {
  const { generateId } = useIdContext();
  const { plan, updatePlan, updateFocus } = usePlan();

  if (!plan) return;

  const handleNewTask = () => {
    const id = generateId();
    const emptyTask: Task = {
      id,
      title: "",
      rank: tasks.length ? Math.max(...tasks.map((t) => t.rank)) + 1 : 0,
      date,
      isDone: false,
      subtasks: [],
    };
    const newPlan: Plan = { ...plan, tasks: [...plan.tasks, emptyTask] };
    updatePlan(newPlan);
    updateFocus({ taskId: id });
  };

  const today = new Date(Date.now());
  const isOutside =
    (!isSameDay(date, plan.start) && date.getTime() < plan.start.getTime()) ||
    (!isSameDay(date, plan.end) && date.getTime() > plan.end.getTime());

  const isPast = !isSameDay(date, today) && date.getTime() < today.getTime();

  const taskList = [...(shadow ? [...tasks, shadow] : tasks)]
    .slice()
    .sort((a, b) => a.rank - b.rank);

  return (
    <div
      id={id}
      className={classnames(styles.cell, {
        [styles.today]: isSameDay(date, today),
        [styles.outside]: isOutside,
        [styles.past]: isPast && !isOutside,
      })}
    >
      <div className={styles.day}>
        {`${MONTHS[date.getMonth()]} ${date.getDate()}`}
      </div>
      {taskList.map((taskData) =>
        canBeAssumedToBeTask(taskData) ? (
          <TaskBox
            id={`task-${taskData.id}`}
            data-cell={id}
            key={`task-${taskData.id}`}
            data={taskData}
            onDrag={(data) => onTaskDrag(data)}
            onDrop={() => onTaskDrop(taskData)}
          />
        ) : (
          <div
            key={"shadow"}
            className={styles.shadowTask}
            style={{
              height: taskData.height,
              width: taskData.width,
            }}
          />
        )
      )}
      <button onClick={handleNewTask}>
        <Icon icon="add" weight={600} style={{ fontSize: 16 }} />
      </button>
    </div>
  );
};

function canBeAssumedToBeTask(obj: Task | Shadow): obj is Task {
  return "title" in obj;
}
