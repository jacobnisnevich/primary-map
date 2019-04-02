import * as p from './types';

import { loadWikipediaPollingData } from './data/wikipediaParser';
import { computePollingAverages } from './data/pollingOperations';
import { getPalette } from './util/colors';

export const getMapData = async (): Promise<p.MapData> => {
  const pollingData = await loadWikipediaPollingData();
  const averagedPollingData = computePollingAverages(pollingData, 5);
  const palette = getPalette(pollingData);

  return { averagedPollingData, palette };
};
