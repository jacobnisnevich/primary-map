import * as p from '../types';

import { FilterOperator, SortDirection } from '../util/constants';

export const applyPollFilter = (flatPolls: p.FlatPoll[], pollFilter: p.PollFilter): p.FlatPoll[] => {
  let filteredPolls = flatPolls;

  if (pollFilter.columnFilters) {
    pollFilter.columnFilters.forEach(
      (columnFilter: p.ColumnFilter): void => {
        filteredPolls = applyColumnFilter(filteredPolls, columnFilter);
      }
    );
  }

  if (pollFilter.sortCriteria) {
    filteredPolls = filteredPolls.sort(
      (pollA: p.FlatPoll, pollB: p.FlatPoll): number => sortByCriteria(pollA, pollB, pollFilter.sortCriteria)
    );
  }

  if (pollFilter.limit) {
    filteredPolls = filteredPolls.slice(0, pollFilter.limit);
  }

  return filteredPolls;
};

const applyColumnFilter = (polls: p.FlatPoll[], columnFilter: p.ColumnFilter): p.FlatPoll[] => {
  return polls.filter(
    (poll: p.FlatPoll): boolean => {
      const pollField = poll[columnFilter.field];
      const filterOperand = columnFilter.operand;

      switch (columnFilter.operator) {
        case FilterOperator.EqualTo:
          return pollField === filterOperand;
        case FilterOperator.NotEqualTo:
          return pollField !== filterOperand;
        case FilterOperator.GreaterThan:
          return pollField > filterOperand;
        case FilterOperator.GreaterThanOrEqualTo:
          return pollField >= filterOperand;
        case FilterOperator.LessThan:
          return pollField < filterOperand;
        case FilterOperator.LessThanOrEqualTo:
          return pollField <= filterOperand;
        case FilterOperator.In:
          return filterOperand.includes(pollField);
        case FilterOperator.NotIn:
          return filterOperand.includes(pollField);
        default:
          return true;
      }
    }
  );
};

const sortByCriteria = (pollA: p.FlatPoll, pollB: p.FlatPoll, sortCriteria: p.SortCriteria): number => {
  let fieldA = pollA[sortCriteria.field];
  let fieldB = pollB[sortCriteria.field];

  if (sortCriteria.field === 'date') {
    fieldA = new Date(fieldA);
    fieldB = new Date(fieldB);
  }

  if (sortCriteria.field === 'sample_size' || sortCriteria.field === 'margin_of_error') {
    fieldA = parseFloat(fieldA);
    fieldB = parseFloat(fieldB);
  }

  if (sortCriteria.direction === SortDirection.Asc) {
    return fieldA - fieldB;
  } else if (sortCriteria.direction === SortDirection.Desc) {
    return fieldB - fieldA;
  } else {
    return 0;
  }
};
