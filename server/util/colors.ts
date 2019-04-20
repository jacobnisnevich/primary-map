import * as distinctColors from 'distinct-colors';
import { zipObject } from 'lodash';

import * as p from '../types';

import { getUniqueCandidateListFromPolls } from '../data-utils/polling-operations';

export const getPalette = (statePolls: p.Poll[]): p.Palette => {
  const distinctCandidateNames = getUniqueCandidateListFromPolls(statePolls);
  const colors = distinctColors({ count: distinctCandidateNames.length });
  return zipObject(distinctCandidateNames, colors);
};
