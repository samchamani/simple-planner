import { createContext, useContext, ReactNode, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useJsonFile } from "../hooks/useJsonFile";

export type Plan = {
  title: string;
  start: Date;
  end: Date;
  types: {
    name: string;
    font: string;
    background: string;
  }[];
  tasks: Task[];
};

export type Task = {
  id: number;
  rank: number; // for sorting
  title: string;
  date: Date;
  type?: number; // index of types
  isDone: boolean;
  subtasks: {
    title: string;
    isDone: boolean;
  }[];
};

type TaskFocus = { taskId: number; subtaskIndex?: number };

type PlanContextType = {
  plan: Plan | undefined;
  updatePlan: (updatedPlan?: Plan) => void;
  updateTask: (taskId: number, updatedTask?: Partial<Task>) => void;
  save: () => void;
  load: (file: File) => void;
  focus?: TaskFocus;
  updateFocus: (focus?: TaskFocus) => void;
};

function adjustDates(json: any) {
  return {
    ...json,
    start: new Date(json.start),
    end: new Date(json.end),
    tasks: json.tasks.map((t: Task) => ({ ...t, date: new Date(t.date) })),
  };
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useLocalStorage<Plan>("plan", undefined, adjustDates);
  const { write, read } = useJsonFile<Plan>();
  const [focus, setFocus] = useState<TaskFocus>();

  const updatePlan = (updatedPlan?: Plan) => {
    setPlan(updatedPlan);
  };

  const deleteTask = (taskId: number) => {
    setPlan(
      (prevPlan) =>
        prevPlan && {
          ...prevPlan,
          tasks: prevPlan.tasks.filter((task) => task.id !== taskId),
        }
    );
  };

  const updateTask = (taskId: number, update?: Partial<Task>) => {
    if (update === undefined) {
      deleteTask(taskId);
      return;
    }
    setPlan(
      (prevPlan) =>
        prevPlan && {
          ...prevPlan,
          tasks: prevPlan.tasks.map((task) =>
            task.id === taskId ? { ...task, ...update } : task
          ),
        }
    );
  };

  const save = () => {
    if (!plan) {
      console.error("Can't save because plan is undefined");
      return;
    }
    write(plan, plan.title);
  };

  const load = (file: File) => {
    read(file, (plan) => {
      plan.title = file.name.split(".")[0];
      updatePlan(adjustDates(plan));
    });
  };

  const updateFocus = (newFocus?: TaskFocus) => {
    setFocus(newFocus);
  };

  return (
    <PlanContext.Provider
      value={{ plan, updatePlan, updateTask, save, load, focus, updateFocus }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};
