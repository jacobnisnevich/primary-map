import { snakeCase } from 'lodash';

import * as p from '../types';

export const schematizeCandidateNames = (candidateNames: p.Candidate[]): string[] => {
  return candidateNames.map(snakeCase);
};
