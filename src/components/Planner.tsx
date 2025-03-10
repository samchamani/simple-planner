import styles from "./Planner.module.css";

import { useMemo, useState } from "react";
import { Cell } from "./Cell";

import useThrottle from "../hooks/useThrottle";
import { DragData } from "../hooks/useDrag";
import { Plan, Task, usePlan } from "../contexts/Plan";
import { Icon } from "frontin";
import { addDays, classnames, getDaysList, isSameDay } from "../util";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type Shadow = {
  index: number;
  height: number;
  width: number;
  rank: number;
};

export const Planner = () => {
  const { plan, updatePlan, save } = usePlan();
  if (!plan) return null;

  const [shadowBox, setShadowBox] = useState<Shadow>();

  const allDays = useMemo(() => {
    const firstday = plan.start.getDay();
    const lastday = plan.end.getDay();
    let start = plan.start;
    if (firstday > 1) start = addDays(start, -(firstday - 1));
    if (firstday === 0) start = addDays(start, -6);
    let end = plan.end;
    if (lastday !== 0) end = addDays(end, 7 - lastday);
    return getDaysList(start, end);
  }, [plan.start, plan.end]);

  const scheduledPlan = useMemo(
    () =>
      allDays.map((date, index) => {
        return {
          date,
          tasks: plan.tasks.filter((task) => isSameDay(task.date, date)),
          shadow: shadowBox?.index === index ? shadowBox : undefined,
        };
      }),
    [allDays, plan.tasks, shadowBox]
  );

  const handleTasksChange = (tasks: Task[]) => {
    const newPlan: Plan = { ...plan, tasks };
    updatePlan(newPlan);
  };

  const handleTaskDrag = useThrottle((dragData: DragData<HTMLDivElement>) => {
    const elems = document.elementsFromPoint(
      dragData.pos.x + dragData.size.width / 2,
      dragData.pos.y
    );
    const closestCell = elems.filter((elem) => elem.id.startsWith("cell-"))[0];
    if (!closestCell) return;
    const closestTask = elems.filter(
      (elem) =>
        dragData.item.id !== elem.id &&
        elem.id.startsWith("task-") &&
        elem.getAttribute("data-cell") === closestCell.id
    )[0];
    const index = parseInt(closestCell.id.split("-")[1]);
    const newShadow: Shadow = { index, ...dragData.size, rank: -0.5 };
    if (closestTask) {
      const { y, height } = closestTask.getBoundingClientRect();
      const closeTaskRank = [...plan.tasks].find(
        (t) => "task-" + t.id === closestTask.id
      )?.rank;
      if (closeTaskRank !== undefined) {
        newShadow.rank =
          dragData.pos.y < y + height / 4
            ? closeTaskRank - 0.5
            : closeTaskRank + 0.5;
      }
    }
    setShadowBox(newShadow);
  }, 800);

  const handleTaskDrop = (task: Task) => {
    if (!shadowBox) return;
    const cellIndex = shadowBox.index;
    const allTasks = [...plan.tasks];
    const taskIndex = allTasks.findIndex((t) => t.id === task.id);
    allTasks[taskIndex].rank = shadowBox.rank;
    allTasks[taskIndex].date = scheduledPlan[cellIndex].date;

    const cellTasks: Task[] = allTasks.filter((t) => t.date === task.date);
    const restOfTasks: Task[] = allTasks.filter((t) => t.date !== task.date);

    const rankedCellTasks = cellTasks
      .sort((a, b) => a.rank - b.rank)
      .map((t, i) => ({ ...t, rank: i }));

    const newPlan: Plan = {
      ...plan,
      tasks: [...restOfTasks, ...rankedCellTasks],
    };
    setShadowBox(undefined);
    updatePlan(newPlan);
  };

  return (
    <>
      <div className={styles.toolbar}>
        <h1>{plan.title}</h1>
        <button className={classnames(styles.cta)} onClick={save}>
          <Icon icon="download" />
          {"Save as file"}
        </button>
        <button
          className={classnames("danger", styles.cta)}
          onClick={() => updatePlan()}
        >
          <Icon icon="close" />
          {"Close"}
        </button>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((weekday, index) => (
          <div key={index} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>
      <div className={styles.calendar}>
        {scheduledPlan.map((item, index) => {
          const id = `cell-${index}`;
          return (
            <Cell
              id={id}
              key={index}
              date={item.date}
              tasks={item.tasks}
              onChange={handleTasksChange}
              onTaskDrag={handleTaskDrag}
              onTaskDrop={handleTaskDrop}
              shadow={item.shadow}
            />
          );
        })}
      </div>
    </>
  );
};
