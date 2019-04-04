import * as p from '../types';

import { getStatePollingData } from '../data-utils/data-store';
import { getPalette } from '../util/colors';

export const getMapPalette = async (): Promise<p.Palette> => {
  const pollingData = await getStatePollingData();
  const palette = getPalette(pollingData);
  return palette;
};
