import styles from "./TypeSelector.module.css";
import { Plan, usePlan } from "../contexts/Plan";
import { useMemo, useState } from "react";
import { Icon } from "frontin";
import { CSS_VARIABLES } from "../App";

type Props = {
  forTaskId: number;
};

export const TypeSelector = ({ forTaskId }: Props) => {
  const { plan, updateTask, updatePlan } = usePlan();
  if (!plan) return;
  const DEFAULT_BG = CSS_VARIABLES.background;
  const DEFAULT_FONT = CSS_VARIABLES.foreground;

  const task = plan.tasks[plan.tasks.findIndex((t) => t.id === forTaskId)];
  const selected = task.type;
  const types: Plan["types"] = useMemo(
    () => [
      { name: "(None)", font: DEFAULT_FONT, background: DEFAULT_BG },
      ...plan.types,
    ],
    [plan]
  );
  const unselected = selected === undefined;
  const selectedType = unselected ? types[0] : types[selected + 1];

  const [name, setName] = useState(unselected ? "" : selectedType.name);
  const [font, setFont] = useState(
    unselected ? DEFAULT_FONT : selectedType.font
  );
  const [background, setBackground] = useState(
    unselected ? DEFAULT_BG : selectedType.background
  );

  const handleTypeEdit = () => {
    const newPlan = { ...plan };
    if (unselected) {
      // create new
      newPlan.types = [...newPlan.types, { name, font, background }];
      const index = newPlan.tasks.findIndex((t) => t.id === forTaskId);
      newPlan.tasks[index].type = newPlan.types.length - 1;
    } else if (name === "") {
      // delete
      newPlan.types = newPlan.types.filter((_, i) => i !== selected);
      const index = newPlan.tasks.findIndex((t) => t.id === forTaskId);
      newPlan.tasks[index].type = undefined;
    } else {
      // edit existing
      newPlan.types[selected] = { name, font, background };
    }
    updatePlan(newPlan);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    const isNone = value === 0;
    updateTask(forTaskId, { type: isNone ? undefined : value - 1 });
    setFont(types[value].font);
    setBackground(types[value].background);
    setName(isNone ? "" : types[value].name);
  };

  const isDisabled =
    (unselected && name === "") ||
    types.some(
      (t) => t.name === name && t.font === font && t.background === background
    );

  return (
    <div className={styles.container}>
      <label>
        {"Selected type"}
        <select
          value={selected === undefined ? 0 : selected + 1}
          onChange={handleTypeChange}
        >
          {types.map((t, index) => (
            <option key={index} value={index} label={t.name} />
          ))}
        </select>
      </label>
      <label>
        {"Label"}
        <input
          placeholder="Type name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className={styles.inputs}>
        <label>
          {"Background"}
          <input
            type="color"
            value={background}
            style={{ background }}
            onChange={(e) => setBackground(e.target.value)}
          />
        </label>
        <label>
          {"Font color"}
          <input
            className={styles.fontselector}
            style={{ color: font, background }}
            type="color"
            value={background}
            onChange={(e) => setFont(e.target.value)}
          />
        </label>
      </div>
      <button
        className={!unselected && name === "" ? "danger" : ""}
        disabled={isDisabled}
        onClick={handleTypeEdit}
      >
        {unselected ? (
          "Add"
        ) : name === "" ? (
          <>
            <Icon icon={"delete"} />
            {"Delete type"}
          </>
        ) : (
          "Edit"
        )}
      </button>
    </div>
  );
};
