import { ReactEventHandler } from "react";
import styles from "./ReloadMapDialog.module.css";

type Props = {
  onClose: ReactEventHandler<HTMLDialogElement>;
};

export default function ReloadMapDialog({ onClose }: Props) {
  return (
    <dialog className={styles.dialog} onClose={onClose} open>
      <p>This map has been updated.</p>

      <div>
        <form method="dialog">
          <button value="reload">Reload</button>
          <button>Dismiss</button>
        </form>
      </div>
    </dialog>
  );
}
