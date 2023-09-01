import { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { Component } from "react";
import { maximumLat, maximumLng, minimumLat, minimumLng } from "src/bounds";

type Props = {
  accessToken: string;
  featuresURL: string;
};

export default class Map extends Component<Props> {
  constructor(props: Props) {
    super(props);

    const { accessToken } = props;

    this.#setRef = (container) => {
      if (!container) return;

      const map = new MapboxMap({
        accessToken,
        container,
        style: "mapbox://styles/betsecure/clm06v5k900a501r87g7g5qc3",
        fadeDuration: 0,
        bounds: [
          [minimumLng, minimumLat],
          [maximumLng, maximumLat],
        ],
      });

      map.on("load", () => {
        map.addSource("transactions", {
          type: "geojson",
          data: this.props.featuresURL,
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

  componentDidUpdate({ featuresURL }: Props): void {
    if (this.props.featuresURL !== featuresURL) {
      this.#featureSource?.setData(this.props.featuresURL);
    }
  }

  render() {
    return <div ref={this.#setRef}></div>;
  }

  readonly #setRef: (container: HTMLDivElement) => void;
  #featureSource: GeoJSONSource | undefined;
}
