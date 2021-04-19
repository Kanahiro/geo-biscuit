import { getBiscuitCutter } from './index';
import { points } from './points';

import { Point, FeatureCollection } from 'geojson';

const typedPoints = points as FeatureCollection;

const biscuitCutter = getBiscuitCutter('pentagon', { scaler: 100 });
const biscuits = biscuitCutter(typedPoints);
console.log(JSON.stringify(biscuits));
