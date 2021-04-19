import { getBiscuitCutter } from './index';
import { points } from './points';

import { Point, FeatureCollection } from 'geojson';

const typedPoints = points as FeatureCollection;

const biscuitCutter = getBiscuitCutter('custom', {
    shape: [
        [
            [
                [0, 5],
                [10, -5],
                [-10, -5],
                [0, 5],
            ],
        ],
    ],
    scaler: 1000,
});
const biscuits = biscuitCutter(typedPoints);
console.log(JSON.stringify(biscuits));
