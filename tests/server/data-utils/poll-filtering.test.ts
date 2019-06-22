import { testPolls } from '../../test-data';
import { applyPollFilter } from '../../../server/data-utils/poll-filtering';

describe('applyPollFilter', () => {
  it('should apply limits correctly', () => {
    const pollFilter = { limit: 3 };
    const filteredPolls = applyPollFilter(testPolls, pollFilter);
    expect(filteredPolls.length).toEqual(3);
  });

  it('should exclude head to head polls by default', () => {
    const pollFilter = {};
    const filteredPolls = applyPollFilter(testPolls, pollFilter);
    expect(filteredPolls.length).toEqual(4);
  });

  it('should include head to head polls if includeHeadToHead is true', () => {
    const pollFilter = { includeHeadToHead: true };
    const filteredPolls = applyPollFilter(testPolls, pollFilter);
    expect(filteredPolls.length).toEqual(5);
  });
});
