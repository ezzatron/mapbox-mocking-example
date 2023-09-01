import mapboxgl from "mapbox-gl";
import { useCallback } from "react";

type Props = {
  mapboxToken: string;
};

export default function Map({ mapboxToken }: Props) {
  const ref = useCallback((node: HTMLDivElement) => {
    if (!node) return;

    let minimumLat = 40.73088334317342;
    let maximumLat = 40.71368521621004;
    let minimumLng = -74.06457278183707;
    let maximumLng = -74.03501416729776;

    let transactionsSourceLoaded = false;

    const map = new mapboxgl.Map({
      accessToken: mapboxToken,
      container: node,
      style: "mapbox://styles/betsecure/clm06v5k900a501r87g7g5qc3",
      bounds: [
        [minimumLng, minimumLat],
        [maximumLng, maximumLat],
      ],
    });

    map.on("load", () => {
      map.addSource("transactions", {
        type: "geojson",
        data: "/api/transactions",
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
      if (event.sourceId !== "transactions" || !event.isSourceLoaded) return;

      if (transactionsSourceLoaded) return;
      transactionsSourceLoaded = true;

      // setInterval(() => {
      //   const source = map.getSource("transactions") as GeoJSONSource;
      //   source.setData("/api/transactions");
      // }, 30000);
    });
  }, []);

  return <div ref={ref} />;
}

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}
