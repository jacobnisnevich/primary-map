import { cleanUpDateValue } from '../../../server/data-utils/wikipedia-parser';

describe('cleanUpDateValue', () => {
  describe('National Polls', () => {
    const testYear = '2019';

    it('should correctly process dates of the form "Aug 16–Aug 23" with a year passed in', () => {
      const testDateString = 'Aug 16–Aug 23';
      const expectedDateResult = new Date('August 23, 2019');

      const actualDateResult = cleanUpDateValue(testDateString, testYear);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Aug 1–4" with a year passed in', () => {
      const testDateString = 'Aug 1–4';
      const expectedDateResult = new Date('August 4, 2019');

      const actualDateResult = cleanUpDateValue(testDateString, testYear);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Aug 1" with a year passed in', () => {
      const testDateString = 'Aug 1';
      const expectedDateResult = new Date('August 1, 2019');

      const actualDateResult = cleanUpDateValue(testDateString, testYear);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Jul 31–Aug 1" with a year passed in', () => {
      const testDateString = 'Jul 31–Aug 1';
      const expectedDateResult = new Date('August 1, 2019');

      const actualDateResult = cleanUpDateValue(testDateString, testYear);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "May 27 – Jun 2" with a year passed in', () => {
      const testDateString = 'May 27 – Jun 2';
      const expectedDateResult = new Date('June 2, 2019');

      const actualDateResult = cleanUpDateValue(testDateString, testYear);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });
  });

  describe('State Polls', () => {
    it('should correctly process dates of the form "Aug 9–11, 2019" without a year passed in', () => {
      const testDateString = 'Aug 9–11, 2019';
      const expectedDateResult = new Date('August 11, 2019');

      const actualDateResult = cleanUpDateValue(testDateString);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Jun 29 – Jul 4, 2019" without a year passed in', () => {
      const testDateString = 'Jun 29 – Jul 4, 2019';
      const expectedDateResult = new Date('July 4, 2019');

      const actualDateResult = cleanUpDateValue(testDateString);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Jun 24, 2019" without a year passed in', () => {
      const testDateString = 'Jun 24, 2019';
      const expectedDateResult = new Date('June 24, 2019');

      const actualDateResult = cleanUpDateValue(testDateString);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });

    it('should correctly process dates of the form "Jul 17-22, 2019" (not em-dash) without a year passed in', () => {
      const testDateString = 'Jul 17-22, 2019';
      const expectedDateResult = new Date('July 22, 2019');

      const actualDateResult = cleanUpDateValue(testDateString);
      
      expect(actualDateResult).toStrictEqual(expectedDateResult);
    });
  });
});
