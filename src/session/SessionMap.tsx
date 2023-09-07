import { Feature, Polygon } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import { Component } from "react";
import {
  TransactionFeature,
  TransactionFeatureCollection,
} from "src/api/types";
import { maximumLat, maximumLng, minimumLat, minimumLng } from "src/bounds";
import styles from "./SessionMap.module.css";

type Props = {
  accessToken: string;
  features: TransactionFeatureCollection;
  selected: string;
  accuracy?: Feature<Polygon>;
  selectTransaction: (id: string) => void;
};

export default class SessionMap extends Component<Props> {
  constructor(props: Props) {
    super(props);

    const { accessToken } = props;

    this.#setRef = (container) => {
      if (!container) return;

      const map = new Map({
        accessToken,
        container,
        style: "mapbox://styles/betsecure/clm06v5k900a501r87g7g5qc3",
        fadeDuration: 0,
        bounds: [
          [minimumLng, minimumLat],
          [maximumLng, maximumLat],
        ],
      });
      this.#map = map;

      map.on("load", () => {
        map.addSource("features", {
          type: "geojson",
          data: this.#features,
        });

        map.addSource("accuracy", {
          type: "geojson",
          data: this.#accuracy,
        });

        map.addLayer({
          id: "accuracy",
          type: "fill",
          source: "accuracy",
          layout: {},
          paint: {
            "fill-color": "white", // blue color fill
            "fill-opacity": 0.1,
          },
        });

        map.addLayer({
          id: "markers",
          type: "symbol",
          source: "features",
          layout: {
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-image": [
              "case",
              ["==", ["get", "isSelected"], true],
              "mapbox-marker-icon-red",
              ["==", ["get", "isLatest"], true],
              "mapbox-marker-icon-orange",
              ["==", ["get", "isNew"], true],
              "mapbox-marker-icon-pink",
              "mapbox-marker-icon-purple",
            ],
            "icon-size": ["case", ["==", ["get", "isSelected"], true], 2, 1],
            "symbol-z-order": "source",
          },
        });

        map.on("click", "markers", (event) => {
          if (!event.features) return;
          const feature = event.features[0] as unknown as TransactionFeature;

          this.props.selectTransaction(feature ? feature.properties.id : "");
        });
      });

      map.on("sourcedata", (event) => {
        if (!event.isSourceLoaded) return;

        if (event.sourceId === "features") {
          if (this.#featureSource) return;

          const source = map.getSource("features");
          if (source.type !== "geojson") return;

          this.#featureSource = source;
        }

        if (event.sourceId === "accuracy") {
          if (this.#accuracySource) return;

          const source = map.getSource("accuracy");
          if (source.type !== "geojson") return;

          this.#accuracySource = source;
        }
      });
    };
  }

  componentDidUpdate({ features, selected, accuracy }: Props): void {
    if (this.props.features !== features || this.props.selected !== selected) {
      this.#featureSource?.setData(this.#features);
    }
    if (this.props.accuracy !== accuracy) {
      this.#accuracySource?.setData(this.#accuracy);
    }
  }

  componentWillUnmount(): void {
    this.#map?.remove();
  }

  render() {
    return <div ref={this.#setRef} className={styles.map}></div>;
  }

  get #accuracy(): Feature<Polygon> {
    return (
      this.props.accuracy ?? {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [],
        },
        properties: {},
      }
    );
  }

  get #features(): TransactionFeatureCollection {
    const { features, selected } = this.props;

    return {
      ...features,
      features: features.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          isSelected: feature.properties.id === selected ? true : undefined,
        },
      })),
    };
  }

  readonly #setRef: (container: HTMLDivElement) => void;
  #map: Map | undefined;
  #accuracySource: GeoJSONSource | undefined;
  #featureSource: GeoJSONSource | undefined;
}
