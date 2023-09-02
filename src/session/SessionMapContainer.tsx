import { FeatureCollection } from "geojson";
import { useReducer } from "react";
import { fetcher } from "src/fetcher";
import hash from "stable-hash";
import useSWR from "swr";
import ReloadMapDialog from "./ReloadMapDialog";
import SessionMap from "./SessionMap";
import styles from "./SessionMapContainer.module.css";

const LOAD = "LOAD";
const RELOAD = "RELOAD";
const DISMISS = "DISMISS";

const emptyFeatures: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const initialState: State = {
  features: emptyFeatures,
  latestFeatures: emptyFeatures,
  isUpdateDismissed: false,
};

type Props = {
  accessToken: string;
  sessionId: string;
};

export default function SessionMapContainer({ accessToken, sessionId }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useSWR<FeatureCollection>(
    `/api/session/${encodeURIComponent(sessionId)}/map`,
    {
      fetcher,
      refreshInterval: 5000,
      onSuccess: (features) => {
        dispatch({ type: LOAD, payload: { features } });
      },
    },
  );

  return (
    <div className={styles.container}>
      <SessionMap accessToken={accessToken} features={state.features} />

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
  features: FeatureCollection;
  latestFeatures: FeatureCollection;
  isUpdateDismissed: boolean;
};

type Action =
  | {
      type: typeof LOAD;
      payload: { features: FeatureCollection };
    }
  | {
      type: typeof RELOAD;
    }
  | {
      type: typeof DISMISS;
    };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case LOAD: {
      const { features, latestFeatures } = state;
      const { features: payloadFeatures } = action.payload;

      // If the features are empty, this is the first load.
      if (features === emptyFeatures) {
        return {
          ...state,
          features: payloadFeatures,
          latestFeatures: payloadFeatures,
        };
      }

      // If the features haven't changed, do nothing.
      // Normally SWR would handle this, but we're using onSuccess.
      const latestFeaturesHash = latestFeatures ? hash(latestFeatures) : "";
      const payloadFeaturesHash = hash(payloadFeatures);
      if (latestFeaturesHash === payloadFeaturesHash) return state;

      return { ...state, latestFeatures: payloadFeatures };
    }

    case RELOAD: {
      return { ...state, features: state.latestFeatures };
    }

    case DISMISS: {
      return { ...state, isUpdateDismissed: true };
    }
  }

  return state;
}

function hasUpdate(state: State) {
  const { features, latestFeatures, isUpdateDismissed } = state;

  return !isUpdateDismissed && features !== latestFeatures;
}
