import { Point, Feature, FeatureCollection, MultiPolygon } from 'geojson';
import explode from '@turf/explode';
import { toMercator, toWgs84 } from '@turf/projection';
import { square } from 'turf';

type CutterFunction = (
    features: FeatureCollection,
) => FeatureCollection<MultiPolygon>;

type MultiPolygonGeometry = number[][][][];

export const getBiscuitCutter = (
    cutterName: TEMPLATE_CUTTER_NAMES,
    options: cutterMakeOptions = {},
): CutterFunction => {
    return (features: FeatureCollection): FeatureCollection<MultiPolygon> => {
        const pointized = explode(features);
        const mercatorized = toMercator(pointized);

        return toWgs84({
            type: 'FeatureCollection',
            features: mercatorized.features.map((feature) => {
                return {
                    ...feature,
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: cut(
                            [
                                feature.geometry.coordinates[0],
                                feature.geometry.coordinates[1],
                            ],
                            getCutter(cutterName, options),
                        ),
                    },
                };
            }),
        });
    };
};

const getCutter = (
    cutterName: TEMPLATE_CUTTER_NAMES,
    options: cutterMakeOptions,
): MultiPolygonGeometry => {
    if (cutterName === 'custom') return [[[[0, 0]]]];
    return TEMPLATE_CUTTERS[cutterName]!.map((polygon) => {
        return polygon.map((shapeHole) => {
            return shapeHole.map((latlon) => {
                return latlon.map((vec) => vec * options.scaler!);
            });
        });
    });
};

const cut = (
    latlon: [number, number],
    cutter: MultiPolygonGeometry,
): MultiPolygonGeometry => {
    return cutter.map((polygon) => {
        return polygon.map((shapeHole) => {
            return shapeHole.map((vec) => {
                return [latlon[0] + vec[0], latlon[1] + vec[1]];
            });
        });
    });
};

type TEMPLATE_CUTTER_NAMES = 'triangle' | 'square' | 'pentagon' | 'custom';

const TEMPLATE_CUTTERS: {
    [key in TEMPLATE_CUTTER_NAMES]: MultiPolygonGeometry;
} = {
    triangle: [
        [
            [
                [0, 1],
                [1, -1],
                [-1, -1],
                [0, 1],
            ],
        ],
    ],
    square: [
        [
            [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1],
                [-1, 1],
            ],
        ],
    ],
    pentagon: [
        [
            [
                [10, 10],
                [10, 20],
                [20, 20],
                [20, 10],
                [10, 10],
            ],
            [
                [15, 15],
                [15, 17],
                [17, 17],
                [17, 15],
                [15, 15],
            ],
        ],
        [
            [
                [0, 0.1],
                [0.1, -0.1],
                [-0.1, -0.1],
                [0, 0.1],
            ],
        ],
    ],
    custom: [],
};

type cutterMakeOptions = {
    vertexes?: number[][];
    scaler?: number;
};
