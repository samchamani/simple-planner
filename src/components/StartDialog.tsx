import styles from "./StartDialog.module.css";
import { useMemo, useState } from "react";
import { Plan, usePlan } from "../contexts/Plan";

export const StartDialog = () => {
  const { updatePlan, load } = usePlan();
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleCreate = () => {
    if (!from || !to) return;
    const newPlan: Plan = {
      title: title || "New plan",
      start: new Date(from),
      end: new Date(to),
      types: [],
      tasks: [],
    };
    updatePlan(newPlan);
  };

  const handleRead: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    load(file);
  };

  const isDisabled = useMemo(
    () =>
      from === "" ||
      to === "" ||
      new Date(from).getTime() > new Date(to).getTime(),
    [from, to]
  );

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>{"Create a new plan from scratch"}</h2>
        <label>
          {"Title"}
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className={styles.datepickers}>
          <label>
            {"From"}
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            {"To"}
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
        <button disabled={isDisabled} onClick={handleCreate}>
          {"Create"}
        </button>
      </div>
      <div className={styles.section}>
        <h2>{"Or continue with an existing one"}</h2>
        <input
          type="file"
          className={styles.fileReader}
          onChange={handleRead}
        />
      </div>
    </div>
  );
};
