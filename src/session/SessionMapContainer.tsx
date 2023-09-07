import { useReducer } from "react";
import {
  LatestTransactionResponse,
  MapFeaturesResponse,
  SessionFeatureCollection,
} from "src/api/types";
import { fetcher } from "src/fetcher";
import useSWR from "swr";
import ReloadMapDialog from "./ReloadMapDialog";
import SessionMap from "./SessionMap";
import styles from "./SessionMapContainer.module.css";

const DISMISS = "DISMISS";
const LOAD_ERROR = "LOAD_ERROR";
const LOAD_FEATURES = "LOAD_FEATURES";
const LOAD_LATEST = "LOAD_LATEST";
const RELOAD = "RELOAD";

const emptyFeatures: SessionFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const initialState: State = {
  features: emptyFeatures,
  current: "",
  latest: "",
  shouldLoad: true,
  isUpdateDismissed: false,
  isLoadError: false,
};

type Props = {
  accessToken: string;
  sessionId: string;
};

export default function SessionMapContainer({ accessToken, sessionId }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { shouldLoad, features, current } = state;

  useSWR<LatestTransactionResponse>(
    `/api/session/${encodeURIComponent(sessionId)}/latest-transaction`,
    {
      fetcher,
      refreshInterval: 5000,
      onSuccess: (payload) => {
        dispatch({ type: LOAD_LATEST, payload });
      },
    },
  );

  useSWR<MapFeaturesResponse>(
    shouldLoad
      ? `/api/session/${encodeURIComponent(
          sessionId,
        )}/map-features?since=${encodeURIComponent(current)}`
      : null,
    {
      fetcher,
      onSuccess: (payload) => {
        dispatch({ type: LOAD_FEATURES, payload });
      },
    },
  );

  return (
    <div className={styles.container}>
      <SessionMap accessToken={accessToken} features={features} />

      {hasUpdate(state) && (
        <ReloadMapDialog
          onClose={(event) => {
            if (event.currentTarget.returnValue === "reload") {
              dispatch({ type: RELOAD });
            } else {
              dispatch({ type: DISMISS });
            }
          }}
        />
      )}
    </div>
  );
}

type State = {
  features: SessionFeatureCollection;
  current: string;
  latest: string;
  shouldLoad: boolean;
  isUpdateDismissed: boolean;
  isLoadError: boolean;
};

type Action =
  | {
      type: typeof DISMISS;
    }
  | {
      type: typeof LOAD_ERROR;
    }
  | {
      type: typeof LOAD_FEATURES;
      payload: MapFeaturesResponse;
    }
  | {
      type: typeof LOAD_LATEST;
      payload: LatestTransactionResponse;
    }
  | {
      type: typeof RELOAD;
    };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case DISMISS: {
      return { ...state, isUpdateDismissed: true };
    }

    case LOAD_ERROR: {
      return { ...state, isLoadError: true };
    }

    case LOAD_LATEST: {
      const { current } = state;
      const { latest } = action.payload;

      return { ...state, latest, current: current || latest };
    }

    case LOAD_FEATURES: {
      const { features, latest } = action.payload;

      return {
        ...state,
        features,
        latest,
        current: latest,
        shouldLoad: false,
        isLoadError: false,
      };
    }

    case RELOAD: {
      return { ...state, shouldLoad: true, isLoadError: false };
    }
  }

  return state;
}

function hasUpdate(state: State) {
  const { isUpdateDismissed, current, latest } = state;

  return !isUpdateDismissed && latest !== current;
}
