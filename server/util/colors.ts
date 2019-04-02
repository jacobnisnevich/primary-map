import * as distinctColors from 'distinct-colors';
import { zipObject } from 'lodash';

import * as p from '../types';

import { getUniqueCandidateList } from '../data/pollingOperations';

export const getPalette = (pollingData: p.PollingData): p.Palette => {
  const distinctCandidateNames = getUniqueCandidateList(pollingData);
  const colors = distinctColors({ count: distinctCandidateNames.length });
  return zipObject(distinctCandidateNames, colors);
};
