#!/usr/bin/env node

import * as fs from 'fs';

import { ArgumentParser, HelpFormatter } from 'argparse';
import { version } from '../package.json';
import { FeatureCollection } from 'geojson';

import { getBiscuitCutter } from '../src/index';

const parser = new ArgumentParser({
    add_help: true,
    formatter_class: HelpFormatter,
});
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-i', '--input', { help: 'input geojson path' });
parser.add_argument('-o', '--output', { help: 'output geojson path' });
parser.add_argument('--shape', {
    help: 'biscuit-cutter name, triangle, square...',
});
parser.add_argument('--scaler', {
    help: 'polygon size multiplier, default to 1.0',
});
const args = parser.parse_args();

const input = JSON.parse(
    fs.readFileSync(args.input).toString(),
) as FeatureCollection;

const cutter = getBiscuitCutter(args.shape, { scaler: args.scaler });
const biscuits = cutter(input);

fs.writeFileSync(args.output, JSON.stringify(biscuits));
