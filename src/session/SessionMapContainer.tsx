import { FeatureCollection, Geometry } from "geojson";
import { useMemo, useReducer } from "react";
import { fetcher } from "src/fetcher";
import hash from "stable-hash";
import useSWR from "swr";
import ReloadMapDialog from "./ReloadMapDialog";
import SessionMap from "./SessionMap";
import styles from "./SessionMapContainer.module.css";

const LOAD = "LOAD";
const RELOAD = "RELOAD";
const DISMISS = "DISMISS";

type SessionFeatureProperties = {
  id: string;
  isNew?: boolean;
  isLatest?: boolean;
};
type SessionFeatureCollection = FeatureCollection<
  Geometry,
  SessionFeatureProperties
>;

const emptyFeatures: SessionFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const initialState: State = {
  features: emptyFeatures,
  latestFeatures: emptyFeatures,
  isUpdateDismissed: false,
  newTransactions: new Set(),
};

type Props = {
  accessToken: string;
  sessionId: string;
};

export default function SessionMapContainer({ accessToken, sessionId }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useSWR<SessionFeatureCollection>(
    `/api/session/${encodeURIComponent(sessionId)}/map`,
    {
      fetcher,
      refreshInterval: 5000,
      onSuccess: (features) => {
        dispatch({ type: LOAD, payload: { features } });
      },
    },
  );

  const { features, newTransactions } = state;

  // Add the isNew property to the new features.
  const featuresWithNew = useMemo(() => {
    return {
      ...features,
      features: features.features.map((feature) => {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            isNew: newTransactions.has(feature.properties.id),
          },
        };
      }),
    };
  }, [features, newTransactions]);

  return (
    <div className={styles.container}>
      <SessionMap accessToken={accessToken} features={featuresWithNew} />

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
  latestFeatures: SessionFeatureCollection;
  isUpdateDismissed: boolean;
  newTransactions: Set<string>;
};

type Action =
  | {
      type: typeof LOAD;
      payload: { features: SessionFeatureCollection };
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
      const { features, latestFeatures } = state;
      const newTransactions = new Set<string>();

      const existingIds = new Set(
        features.features.map((feature) => feature.properties.id),
      );
      const latestIds = new Set(
        latestFeatures.features.map((feature) => feature.properties.id),
      );

      for (const id of latestIds) {
        if (!existingIds.has(id)) newTransactions.add(id);
      }

      return { ...state, features: latestFeatures, newTransactions };
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
