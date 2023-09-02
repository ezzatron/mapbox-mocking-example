import { FeatureCollection } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import { Component } from "react";
import { maximumLat, maximumLng, minimumLat, minimumLng } from "src/bounds";
import styles from "./SessionMap.module.css";

type Props = {
  accessToken: string;
  features: FeatureCollection;
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
          data: this.props.features,
        });

        map.addLayer({
          id: "accuracy",
          type: "circle",
          source: "features",
          paint: {
            "circle-color": "white",
            "circle-opacity": 0.05,

            // Draw accuracy radii scaled to the zoom level.
            // See https://stackoverflow.com/a/70458439/736156
            "circle-radius": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              0,
              0,
              20,
              [
                "/",
                ["/", ["get", "accuracy"], 0.075],
                ["cos", ["*", ["get", "lat"], ["/", Math.PI, 180]]],
              ],
            ],
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
              ["==", ["get", "isLatest"], true],
              "mapbox-marker-icon-pink",
              ["==", ["get", "isNew"], true],
              "mapbox-marker-icon-pink",
              "mapbox-marker-icon-purple",
            ],
            "icon-size": ["case", ["==", ["get", "isLatest"], true], 2, 1],
            "symbol-z-order": "source",
          },
        });
      });

      map.on("sourcedata", (event) => {
        if (this.#featureSource) return;
        if (event.sourceId !== "features" || !event.isSourceLoaded) return;

        const source = map.getSource("features");
        if (source.type !== "geojson") return;

        this.#featureSource = source;
      });
    };
  }

  componentDidUpdate({ features }: Props): void {
    if (this.props.features !== features) {
      this.#featureSource?.setData(this.props.features);
    }
  }

  componentWillUnmount(): void {
    this.#map?.remove();
  }

  render() {
    return <div ref={this.#setRef} className={styles.map}></div>;
  }

  readonly #setRef: (container: HTMLDivElement) => void;
  #map: Map | undefined;
  #featureSource: GeoJSONSource | undefined;
}
