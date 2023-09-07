import { ReactEventHandler } from "react";
import styles from "./MapErrorDialog.module.css";

type Props = {
  onClose: ReactEventHandler<HTMLDialogElement>;
};

export default function MapErrorDialog({ onClose }: Props) {
  return (
    <dialog className={styles.dialog} onClose={onClose} open>
      <p>Unable to load map data.</p>

      <div>
        <form method="dialog">
          <button>Dismiss</button>
        </form>
      </div>
    </dialog>
  );
}
