import { useCallback, useReducer } from "react";
import {
  LatestTransactionResponse,
  MapFeaturesResponse,
  TransactionAccuracyResponse,
  TransactionFeatureCollection,
} from "src/api/types";
import { fetcher } from "src/fetcher";
import useSWR from "swr";
import MapErrorDialog from "./MapErrorDialog";
import ReloadMapDialog from "./ReloadMapDialog";
import SessionMap from "./SessionMap";
import styles from "./SessionMapContainer.module.css";

const DISMISS_ERROR = "DISMISS_ERROR";
const DISMISS_UPDATE = "DISMISS_UPDATE";
const LOAD_ACCURACY = "LOAD_ACCURACY";
const LOAD_ERROR = "LOAD_ERROR";
const LOAD_FEATURES = "LOAD_FEATURES";
const LOAD_LATEST = "LOAD_LATEST";
const RELOAD = "RELOAD";
const SELECT_TRANSACTION = "SELECT_TRANSACTION";

const emptyFeatures: TransactionFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const initialState: State = {
  features: emptyFeatures,
  current: "",
  latest: "",
  selected: "",
  accuracy: undefined,
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
  const { features, current, selected, isLoadError } = state;

  useSWR<LatestTransactionResponse>(
    `/api/session/${encodeURIComponent(sessionId)}/latest-transaction`,
    {
      fetcher,
      refreshInterval: 5000,
      onSuccess: (payload) => {
        dispatch({ type: LOAD_LATEST, payload });
      },
      onError: () => {
        dispatch({ type: LOAD_ERROR });
      },
    },
  );

  useSWR<MapFeaturesResponse>(
    shouldLoad(state)
      ? `/api/session/${encodeURIComponent(
          sessionId,
        )}/map-features?since=${encodeURIComponent(current)}`
      : null,
    {
      fetcher,
      onSuccess: (payload) => {
        dispatch({ type: LOAD_FEATURES, payload });
      },
      onError: () => {
        dispatch({ type: LOAD_ERROR });
      },
    },
  );

  useSWR<TransactionAccuracyResponse>(
    selected
      ? `/api/session/${encodeURIComponent(sessionId)}/${encodeURIComponent(
          selected,
        )}/accuracy`
      : null,
    {
      fetcher,
      onSuccess: (payload) => {
        dispatch({ type: LOAD_ACCURACY, payload });
      },
      onError: () => {
        dispatch({ type: LOAD_ERROR });
      },
    },
  );

  const selectTransaction = useCallback((payload: string) => {
    dispatch({ type: SELECT_TRANSACTION, payload });
  }, []);

  return (
    <div className={styles.container}>
      <SessionMap
        accessToken={accessToken}
        features={features}
        selected={selected}
        accuracy={getAccuracy(state)}
        selectTransaction={selectTransaction}
      />

      {hasUpdate(state) && (
        <ReloadMapDialog
          onClose={(event) => {
            if (event.currentTarget.returnValue === "reload") {
              dispatch({ type: RELOAD });
            } else {
              dispatch({ type: DISMISS_UPDATE });
            }
          }}
        />
      )}

      {isLoadError && (
        <MapErrorDialog
          onClose={() => {
            dispatch({ type: DISMISS_ERROR });
          }}
        />
      )}
    </div>
  );
}

type State = {
  features: TransactionFeatureCollection;
  current: string;
  latest: string;
  selected: string;
  accuracy: TransactionAccuracyResponse | undefined;
  shouldLoad: boolean;
  isUpdateDismissed: boolean;
  isLoadError: boolean;
};

type Action =
  | {
      type: typeof DISMISS_ERROR;
    }
  | {
      type: typeof DISMISS_UPDATE;
    }
  | {
      type: typeof LOAD_ACCURACY;
      payload: TransactionAccuracyResponse;
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
    }
  | {
      type: typeof SELECT_TRANSACTION;
      payload: string;
    };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case DISMISS_ERROR: {
      return { ...state, isLoadError: false };
    }

    case DISMISS_UPDATE: {
      return { ...state, isUpdateDismissed: true };
    }

    case LOAD_ACCURACY: {
      return { ...state, accuracy: action.payload };
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
      const { features, selected } = state;
      const { features: loadedFeatures, latest } = action.payload;
      const isFirstLoad = features === emptyFeatures;

      return {
        ...state,
        features: loadedFeatures,
        latest,
        current: latest,
        selected: isFirstLoad ? latest : selected,
        shouldLoad: false,
        isLoadError: false,
      };
    }

    case RELOAD: {
      return { ...state, shouldLoad: true, isLoadError: false };
    }

    case SELECT_TRANSACTION: {
      return { ...state, selected: action.payload };
    }
  }

  return state;
}

function hasUpdate(state: State) {
  const { isLoadError, isUpdateDismissed, current, latest } = state;

  return !isLoadError && !isUpdateDismissed && latest !== current;
}

function shouldLoad(state: State) {
  const { isLoadError, shouldLoad } = state;

  return !isLoadError && shouldLoad;
}

function getAccuracy(state: State) {
  const { accuracy, selected } = state;

  return accuracy?.transactionId === selected ? accuracy.accuracy : undefined;
}
