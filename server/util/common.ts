import { snakeCase, startCase } from 'lodash';

import * as p from '../types';

export const schematizeCandidateNames = (candidateNames: p.Candidate[]): p.Candidate[] => {
  return candidateNames.map(snakeCase);
};

export const unschematizeCandidateNames = (candidateNames: p.Candidate[]): p.Candidate[] => {
  return candidateNames.map(startCase);
};
