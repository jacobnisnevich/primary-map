import { schematizeCandidateNames, unschematizeCandidateNames } from '../../../server/util/common';

const unschematizedCandidateNames = ['Bernie Sanders', 'Joe Biden'];
const schematizedCandidateNames = ['bernie_sanders', 'joe_biden'];

describe('schematizeCandidateNames', () => {
  it('should convert candidate names to snake case', () => {
    const result = schematizeCandidateNames(unschematizedCandidateNames);
    expect(result).toEqual(schematizedCandidateNames);
  });
});

describe('unschematizeCandidateNames', () => {
  it('should convert candidate names to start case', () => {
    const result = unschematizeCandidateNames(schematizedCandidateNames);
    expect(result).toEqual(unschematizedCandidateNames);
  });
});
