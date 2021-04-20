import { FeatureCollection, MultiPolygon } from 'geojson';
import explode from '@turf/explode';
import { toMercator, toWgs84 } from '@turf/projection';

type MultiPolygonGeometry = number[][][][];
type TEMPLATE_CUTTER_NAMES =
    | 'triangle'
    | 'square'
    | 'pentagon'
    | 'star'
    | 'custom';

type CutterFunction = (
    features: FeatureCollection,
) => FeatureCollection<MultiPolygon>;

type cutterMakeOptions = {
    shape?: MultiPolygonGeometry;
    scaler?: number;
};

/**
 * function factory method
 * @param cutterName - select cutter by name from some presets or custom
 * @param options
 * @returns Function to transform Point to MultiPoylgon
 */
export const getBiscuitCutter = (
    cutterName: TEMPLATE_CUTTER_NAMES,
    options: cutterMakeOptions = {},
): CutterFunction => {
    if (cutterName === 'custom' && !options.shape) {
        throw Error("you must set shape in 'custom' cutter");
    }
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
    const cutter =
        cutterName === 'custom' ? options.shape! : TEMPLATE_CUTTERS[cutterName];
    return cutter.map((polygon) => {
        return polygon.map((shapeHole) => {
            return shapeHole.map((latlon) => {
                return latlon.map((vec) => vec * (options.scaler || 1));
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
    star: [
        [
            [
                [0, 1],
                [0.225, 0.309],
                [0.951, 0.309],
                [0.363, -0.118],
                [0.587, -0.809],
                [0, -0.382],
                [-0.587, -0.809],
                [-0.363, -0.118],
                [-0.951, 0.309],
                [-0.225, 0.309],
                [0, 1],
            ],
        ],
    ],
    custom: [], //unused shape
};
