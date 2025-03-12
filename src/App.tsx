import { useEffect } from "react";
import { Planner } from "./components/Planner";
import { StartDialog } from "./components/StartDialog";
import { IdProvider } from "./contexts/Id";
import { usePlan } from "./contexts/Plan";

export const CSS_VARIABLES: Record<string, string> = {
  font: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  foreground: "#1d2226",
  background: "#ffffff",
  primary: "#0000cd",
  secondary: "#f5f5f5",
  danger: "#ca4839",
  success: "#228b22",
  shadow: "rgba(69, 69, 69, 0.6)", //#45454599
  "disabled-foreground": "#b1b1b1",
  disabled: "#dfdfdf",
  "disable-on-drag": "initial",
  "scroll-on-drag": "auto",
};

function App() {
  const { plan } = usePlan();

  useEffect(() => {
    Object.keys(CSS_VARIABLES).forEach((key) => {
      document.documentElement.style.setProperty(
        `--${key}`,
        CSS_VARIABLES[key]
      );
    });
  }, []);

  return (
    <>
      {!plan ? (
        <StartDialog />
      ) : (
        <IdProvider
          startAt={
            plan.tasks.length
              ? Math.max(...plan.tasks.map((t) => t.id))
              : undefined
          }
        >
          <Planner />
        </IdProvider>
      )}
    </>
  );
}

export default App;
