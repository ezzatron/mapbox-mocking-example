import { GeoJSONSource, Map } from "mapbox-gl";
import { Component } from "react";

type Props = {
  accessToken: string;
  featuresURL: string;
};

const minimumLat = 40.73088334317342;
const maximumLat = 40.71368521621004;
const minimumLng = -74.06457278183707;
const maximumLng = -74.03501416729776;

export class Mapbox extends Component<Props> {
  constructor(props: Props) {
    super(props);

    const { accessToken } = props;

    this.#setRef = (container) => {
      const map = new Map({
        accessToken,
        container,
        style: "mapbox://styles/betsecure/clm06v5k900a501r87g7g5qc3",
        bounds: [
          [minimumLng, minimumLat],
          [maximumLng, maximumLat],
        ],
      });

      map.on("load", () => {
        map.addSource("transactions", {
          type: "geojson",
          data: this.props.featuresURL,
          cluster: true,
          clusterProperties: {
            isLatest: ["any", ["get", "isLatest"], false],
          },
        });

        map.addLayer({
          id: "transactions",
          type: "symbol",
          source: "transactions",
          layout: {
            "icon-image": [
              "case",
              ["==", ["get", "isLatest"], true],
              "mapbox-marker-icon-pink",
              "mapbox-marker-icon-purple",
            ],
            "icon-size": ["case", ["==", ["get", "isLatest"], true], 2, 1],
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
