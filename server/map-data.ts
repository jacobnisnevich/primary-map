import * as p from './types';

import { loadWikipediaPollingData } from './data-utils/wikipedia-parser';
import { computePollingAverages } from './data-utils/polling-operations';
import { writePollingDataToArrow } from './data-utils/arrow-processing';
import { getPalette } from './util/colors';

export const getMapData = async (): Promise<p.MapData> => {
  const pollingData = await loadWikipediaPollingData();
  const averagedPollingData = computePollingAverages(pollingData, 5);
  const palette = getPalette(pollingData);

  try {
    writePollingDataToArrow(pollingData);
  } catch (e) {
    console.error(e);
  }

  return { averagedPollingData, palette };
};
