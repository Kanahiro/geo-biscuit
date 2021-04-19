import { FeatureCollection, MultiPolygon } from 'geojson';
import explode from '@turf/explode';
import { toMercator, toWgs84 } from '@turf/projection';

type CutterFunction = (
    features: FeatureCollection,
) => FeatureCollection<MultiPolygon>;

type MultiPolygonGeometry = number[][][][];

type cutterMakeOptions = {
    shape?: MultiPolygonGeometry;
    scaler?: number;
};

type TEMPLATE_CUTTER_NAMES = 'triangle' | 'square' | 'pentagon' | 'custom';

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
    if (cutterName === 'custom' && !options.shape) {
        throw Error("you must set shape in 'custom' cutter");
    }
    const cutter =
        cutterName === 'custom' ? options.shape! : TEMPLATE_CUTTERS[cutterName];
    return cutter.map((polygon) => {
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

const TEMPLATE_CUTTERS: {
    [key in TEMPLATE_CUTTER_NAMES]: MultiPolygonGeometry;
} = {
    triangle: [
        [
            [
                [0, 1],
                [0.866, -0.5],
                [-0.866, -0.5],
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
                [0, 1],
                [0.951, 0.309],
                [0.587, -0.809],
                [-0.587, -0.809],
                [-0.951, 0.309],
                [0, 1],
            ],
        ],
    ],
    custom: [],
};
