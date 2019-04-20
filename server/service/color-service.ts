import * as p from '../types';

import { getPolls } from '../data-utils/data-store';
import { filterOutNullCandidatesFromPolls } from '../data-utils/polling-operations';
import { getPalette } from '../util/colors';
import { FilterOperator } from '../util/constants';

export const getMapPalette = async (): Promise<p.Palette> => {
  const statePolls = await getPolls({
    columnFilters: [
      {
        field: 'state',
        operator: FilterOperator.NotEqualTo as p.ColumnFilterOperator,
        operand: ''
      }
    ]
  });
  const palette = getPalette(filterOutNullCandidatesFromPolls(statePolls));
  return palette;
};
