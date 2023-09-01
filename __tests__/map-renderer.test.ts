import { jest } from "@jest/globals";
import { CreateMap, MapRenderer, createMapRenderer } from "../map-renderer";

describe("Map renderer", () => {
  let createMap: jest.Mock<CreateMap>;
  let renderer: MapRenderer;

  beforeEach(() => {
    createMap = jest.fn<CreateMap>();

    renderer = createMapRenderer(createMap);
  });

  describe("when render is called for the first time", () => {
    beforeEach(() => {
      renderer.render({
        bounds: [
          [11, 22],
          [33, 44],
        ],
        center: [55, 66],
        transactions: [],
      });
    });

    it("creates the map with the correct bounds", () => {
      expect(createMap).toBeCalledWith(
        expect.objectContaining({
          bounds: [
            [11, 22],
            [33, 44],
          ],
        })
      );
    });

    it("creates the map with the correct center point", () => {
      expect(createMap).toBeCalledWith(
        expect.objectContaining({ center: [55, 66] })
      );
    });
  });
});
