import styles from "./TaskBox.module.css";

import { classnames } from "../util";
import { DragData, useDrag } from "../hooks/useDrag";
import { Plan, Task, usePlan } from "../contexts/Plan";
import { Icon } from "frontin";
import { MultiLineInput } from "./MultiLineInput";
import { Popup } from "./Popup";
import { useIdContext } from "../contexts/Id";
import { TypeSelector } from "./TypeSelector";
import { useState } from "react";

type Props = {
  data: Task;
  onDrag: (dragData: DragData<HTMLDivElement>) => void;
  onDrop: (dragData: DragData<HTMLDivElement>) => void;
} & Omit<React.ComponentProps<"div">, "onDrop" | "onDrag">;

export const TaskBox = ({ id, data, onDrop, onDrag, ...props }: Props) => {
  const { updateTask, updatePlan, plan, focus, updateFocus } = usePlan();
  if (!plan) return;
  const { setDragRef, isDragging, targetProps } = useDrag(onDrop, onDrag);
  const { generateId } = useIdContext();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleNewTask = () => {
    if (!plan) return;
    const id = generateId();
    const emptyTask: Task = {
      id,
      title: "",
      rank: data.rank + 1,
      date: data.date,
      type: data.type,
      isDone: false,
      subtasks: [],
    };
    const newPlan: Plan = { ...plan, tasks: [...plan.tasks, emptyTask] };
    updatePlan(newPlan);
    updateFocus({ taskId: id });
  };

  const handleCheckbox = (index?: number) => {
    if (index === undefined) {
      updateTask(data.id, { isDone: !data.isDone });
      return;
    }
    const subtasks = [...data.subtasks];
    subtasks[index].isDone = !subtasks[index].isDone;
    updateTask(data.id, { subtasks });
  };

  const handleEditText = (value: string, index?: number) => {
    if (index === undefined) {
      updateTask(data.id, { title: value });
      return;
    }
    const subtasks = [...data.subtasks];
    subtasks[index].title = value;
    updateTask(data.id, { subtasks });
  };

  const handleDelete = (index?: number) => {
    if (index === undefined) {
      updateTask(data.id);
      setIsPopupOpen(false);
      return;
    }
    const subtasks = [...data.subtasks].filter(
      (_, subindex) => subindex !== index
    );
    updateTask(data.id, { subtasks });
  };

  const handleAddSubTask = () => {
    const newSub: Task["subtasks"][number] = {
      title: "",
      isDone: false,
    };
    updateFocus({ taskId: data.id, subtaskIndex: data.subtasks.length });
    updateTask(data.id, {
      subtasks: [...data.subtasks, newSub],
    });
  };

  return (
    <div
      id={id}
      ref={setDragRef}
      className={classnames(styles.task, {
        [styles.dragging]: isDragging,
        [styles.nolabel]: data.type === undefined,
      })}
      onPointerDown={targetProps.onPointerDown}
      style={{
        ...targetProps.style,
        background:
          data.type !== undefined ? plan.types[data.type].background : "",
        color: data.type !== undefined ? plan.types[data.type].font : "",
      }}
      {...props}
    >
      <h3>
        <input
          type="checkbox"
          checked={data.isDone}
          onChange={() => handleCheckbox()}
        />
        <MultiLineInput
          className={classnames(styles.text, { [styles.done]: data.isDone })}
          value={data.title}
          onChange={handleEditText}
          placeholder="New task"
          onEnterDown={handleNewTask}
          focus={focus?.taskId === data.id}
        />
        <Popup
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          className={styles.popup}
        >
          <TypeSelector forTaskId={data.id} />
          <button className={"danger"} onClick={() => handleDelete()}>
            <Icon icon="delete" />
            {"Delete task"}
          </button>
        </Popup>
      </h3>
      <div className={styles.subtasks}>
        {data.subtasks.map((subtask, index) => (
          <div key={index}>
            <input
              type="checkbox"
              checked={subtask.isDone}
              onChange={() => handleCheckbox(index)}
            />
            <MultiLineInput
              className={classnames(styles.text, {
                [styles.done]: subtask.isDone,
              })}
              value={subtask.title}
              placeholder={`Subtask ${index + 1}`}
              onChange={(value) => handleEditText(value, index)}
              onEnterDown={handleAddSubTask}
              focus={focus?.taskId === data.id && focus.subtaskIndex === index}
            />
            <button
              className="icon-button danger"
              onClick={() => handleDelete(index)}
            >
              <Icon icon={"delete"} />
            </button>
          </div>
        ))}
      </div>
      <button className="icon-button" onClick={handleAddSubTask}>
        <Icon icon={"add"} />
      </button>
      {data.type !== undefined && (
        <div
          className={styles.typelabel}
          style={{
            color: plan.types[data.type].font,
            backgroundColor: plan.types[data.type].background,
            border: `1px solid ${plan.types[data.type].font}`,
          }}
        >{`[${plan.types[data.type].name}]`}</div>
      )}
    </div>
  );
};
