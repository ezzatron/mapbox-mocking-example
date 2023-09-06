import { useCallback, useEffect, useReducer } from "react";
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

const emptyFeatures: SessionFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const initialState: State = {
  features: emptyFeatures,
  current: "",
  latest: "",
  isUpdateDismissed: false,
  isLoadError: false,
};

type Props = {
  accessToken: string;
  sessionId: string;
};

export default function SessionMapContainer({ accessToken, sessionId }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  // TODO: use useSWR conditionally instead?
  const loadFeatures = useCallback(() => {
    fetch(`/api/session/${encodeURIComponent(sessionId)}/map-features`)
      .then((response) => {
        if (!response.ok) throw new Error("Unexpected status");

        return response.json();
      })
      .then((payload) => {
        dispatch({ type: LOAD_FEATURES, payload });
      })
      .catch(() => {
        dispatch({ type: LOAD_ERROR });
      });
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  return (
    <div className={styles.container}>
      <SessionMap accessToken={accessToken} features={state.features} />

      {hasUpdate(state) && (
        <ReloadMapDialog
          onClose={(event) => {
            if (event.currentTarget.returnValue === "reload") {
              loadFeatures();
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
  isUpdateDismissed: boolean;
  isLoadError: boolean;
};

type Action =
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
      type: typeof DISMISS;
    };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case LOAD_ERROR: {
      return { ...state, isLoadError: true };
    }

    case LOAD_LATEST: {
      return { ...state, latest: action.payload.latest };
    }

    case LOAD_FEATURES: {
      const { features, latest } = action.payload;

      return {
        ...state,
        features,
        latest,
        current: latest,
        isLoadError: false,
      };
    }

    case DISMISS: {
      return { ...state, isUpdateDismissed: true };
    }
  }

  return state;
}

function hasUpdate(state: State) {
  const { isUpdateDismissed, current, latest } = state;

  return !isUpdateDismissed && latest !== current;
}
