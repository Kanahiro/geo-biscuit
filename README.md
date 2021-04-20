# geo-biscuit

```typescript
import { getBiscuitCutter } from './index';

// get cutter function
const biscuitCutter = getBiscuitCutter('star', {
    scaler: 100,
});

const biscuits = biscuitCutter(geojson); // geojson = FeatureCollection
console.log(biscuits); // MultiPolygon-FeatureCollection
```
