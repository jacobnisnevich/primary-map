import * as p from '../types';

import { getPolls } from '../data-utils/data-store';
import { filterOutNullCandidatesFromPolls } from '../data-utils/polling-operations';
import { getPalette } from '../util/colors';

export const getMapPalette = async (): Promise<p.Palette> => {
  const polls = await getPolls({});
  const palette = getPalette(filterOutNullCandidatesFromPolls(polls));
  return palette;
};
