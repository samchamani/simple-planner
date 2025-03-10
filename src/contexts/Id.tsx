import { createContext, useContext, useState, ReactNode } from "react";

type IdContext = {
  generateId: () => number;
};

const IdContext = createContext<IdContext | undefined>(undefined);

export const IdProvider = ({
  children,
  startAt = 0,
}: {
  children: ReactNode;
  startAt?: number;
}) => {
  const [counter, setCounter] = useState(startAt);

  const generateId = () => {
    setCounter((prev) => prev + 1);
    return counter + 1;
  };

  return (
    <IdContext.Provider value={{ generateId }}>{children}</IdContext.Provider>
  );
};

export const useIdContext = (): IdContext => {
  const context = useContext(IdContext);
  if (!context) {
    throw new Error("useIdContext must be used within an IdProvider");
  }
  return context;
};
