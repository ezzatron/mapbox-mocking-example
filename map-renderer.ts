import { Map, MapboxOptions } from "mapbox-gl";

export type CreateMap = (options: Partial<MapboxOptions>) => Map;

export type Transaction = {
  id: string;
  coords: {
    lat: number;
    lng: number;
  };
};

export type Features = {
  bounds: MapboxOptions["bounds"];
  center: MapboxOptions["center"];
  transactions: Transaction[];
};

export interface MapRenderer {
  render(features: Features): void;
}

export function createMapRenderer(createMap: CreateMap): MapRenderer {
  let map: Map;

  return {
    render(features: Features) {
      const map = getMap(features);

      map.addSource("transactions", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features.transactions.map((transaction) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [transaction.coords.lng, transaction.coords.lat],
            },
            properties: {
              id: transaction.id,
            },
          })),
        },
      });

      // TODO
    },
  };

  function getMap({ bounds, center }: Features) {
    if (!map) {
      map = createMap({
        bounds,
        center,
      });
    }

    return map;
  }
}
