import { getBiscuitCutter } from '../src/index';
import { points } from './fixture';

describe('biscuit cutter factory method', () => {
    test('cutter function', () => {
        const triangle = getBiscuitCutter('triangle');
        expect(typeof triangle === 'function').toBeTruthy();
    });
    test('custom and no-shape should throw error', () => {
        expect(() => {
            getBiscuitCutter('custom', {});
        }).toThrowError("you must set shape in 'custom' cutter");
    });
});

describe('preset cutting', () => {
    const starCutter = getBiscuitCutter('star');
    const stars = starCutter(points);
    const numOfPoints = points.features.length;
    const numOfStarts = stars.features.length;
    test('same num of features before and after', () => {
        expect(numOfPoints === numOfStarts).toBeTruthy();
    });
    test('output geometry type is MultiPolygon', () => {
        expect(stars.features[0].geometry.type === 'MultiPolygon').toBeTruthy();
    });
});
