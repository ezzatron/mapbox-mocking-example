import { FeatureCollection } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import { Component } from "react";
import { maximumLat, maximumLng, minimumLat, minimumLng } from "src/bounds";

type Props = {
  accessToken: string;
  transactions: FeatureCollection;
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
        map.addSource("transactions", {
          type: "geojson",
          data: this.props.transactions,
        });

        map.addLayer({
          id: "transactions",
          type: "symbol",
          source: "transactions",
          layout: {
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-image": [
              "case",
              ["==", ["get", "isLatest"], true],
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
        if (event.sourceId !== "transactions" || !event.isSourceLoaded) return;

        const source = map.getSource("transactions");
        if (source.type !== "geojson") return;

        this.#featureSource = source;
      });
    };
  }

  componentDidUpdate({ transactions }: Props): void {
    if (this.props.transactions !== transactions) {
      this.#featureSource?.setData(this.props.transactions);
    }
  }

  componentWillUnmount(): void {
    this.#map?.remove();
  }

  render() {
    return <div ref={this.#setRef}></div>;
  }

  readonly #setRef: (container: HTMLDivElement) => void;
  #map: Map | undefined;
  #featureSource: GeoJSONSource | undefined;
}
