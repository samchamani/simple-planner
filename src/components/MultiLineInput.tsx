import { useEffect } from "react";
import { classnames } from "../util";
import styles from "./MultiLineInput.module.css";
import { useRenderingRef } from "../hooks/useRenderingRef";
import { useResizeObserver } from "frontin";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  initialHeight?: number;
  placeholder?: string;
  onEnterDown?: () => void;
  focus?: boolean;
};

export const MultiLineInput = ({
  value,
  onChange,
  className,
  placeholder,
  onEnterDown,
  focus,
}: Props) => {
  const [ref, setRef] = useRenderingRef<HTMLTextAreaElement>(null);
  const [setResizeRef, size] = useResizeObserver();

  useEffect(() => {
    if (!ref.current) return;
    setResizeRef(ref.current);
    const container = ref.current;
    container.style.height = "auto";
    container.style.height = container.scrollHeight + "px";
  }, [ref.current, size?.height, size?.width]);

  return (
    <textarea
      ref={setRef}
      autoFocus={focus}
      className={classnames(styles.textarea, className)}
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onInput={(e) => {
        const container = e.target as HTMLTextAreaElement;
        container.style.height = "auto";
        container.style.height = container.scrollHeight + "px";
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onEnterDown && onEnterDown();
        }
      }}
    />
  );
};
