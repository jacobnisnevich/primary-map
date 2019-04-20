import * as p from '../types';

export const STATE_NAMES: p.State[] = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Washington DC',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Puerto Rico',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming'
];

export const CAUCUS: p.Election = 'caucus';
export const PRIMARY: p.Election = 'primary';

export const WIKIPEDIA_BASE_URL = 'https://en.wikipedia.org/wiki';
export const STATE_POLLING_ROUTE = '/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries';
export const NATIONAL_POLLING_ROUTE =
  '/Nationwide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries';

export const SortDirection = {
  Desc: 'Desc',
  Asc: 'Asc'
};

export const FilterOperator = {
  EqualTo: 'EqualTo',
  NotEqualTo: 'NotEqualTo',
  GreaterThan: 'GreaterThan',
  GreaterThanOrEqualTo: 'GreaterThanOrEqualTo',
  LessThan: 'LessThan',
  LessThanOrEqualTo: 'LessThanOrEqualTo'
};
