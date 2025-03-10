import styles from "./Popup.module.css";
import { Icon } from "frontin";
import { classnames } from "../util";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  className?: string;
};

export const Popup = ({ isOpen, onOpenChange, children, className }: Props) => {
  return (
    <div className={classnames(styles.container, { [styles.open]: isOpen })}>
      <button
        className={classnames("icon-button", styles.opener)}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Icon icon="more_vert" />
        <Icon icon="more_vert" />
      </button>
      <div className={classnames(styles.popup, className)}>{children}</div>
      {isOpen && (
        <div className={styles.blocker} onClick={() => onOpenChange(false)} />
      )}
    </div>
  );
};
