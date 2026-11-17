import { normalizeUsState, US_STATES, UsStateName } from './us_states';

export const US_REGIONS = [
  'North East',
  'South East',
  'Mid West',
  'South Central',
  'South West',
  'West',
  'Mountain',
] as const;

export type UsRegionName = (typeof US_REGIONS)[number];

const STATES_BY_REGION: Record<UsRegionName, UsStateName[]> = {
  'North East': [
    'Connecticut',
    'Delaware',
    'Maine',
    'Maryland',
    'Massachusetts',
    'New Hampshire',
    'New Jersey',
    'New York',
    'Pennsylvania',
    'Rhode Island',
    'Vermont',
  ],
  'South East': [
    'Alabama',
    'Florida',
    'Georgia',
    'Kentucky',
    'Mississippi',
    'North Carolina',
    'South Carolina',
    'Tennessee',
    'Virginia',
    'West Virginia',
  ],
  'Mid West': [
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Michigan',
    'Minnesota',
    'Missouri',
    'Nebraska',
    'North Dakota',
    'Ohio',
    'South Dakota',
    'Wisconsin',
  ],
  'South Central': ['Arkansas', 'Louisiana', 'Oklahoma', 'Texas'],
  'South West': ['Arizona', 'New Mexico'],
  West: ['Alaska', 'California', 'Hawaii', 'Oregon', 'Washington'],
  Mountain: ['Colorado', 'Idaho', 'Montana', 'Nevada', 'Utah', 'Wyoming'],
};

const REGION_BY_STATE = new Map<UsStateName, UsRegionName>();
US_REGIONS.forEach((region) => {
  STATES_BY_REGION[region].forEach((state) => REGION_BY_STATE.set(state, region));
});

export const getUsStateRegion = (state: string): UsRegionName | null => {
  const stateName = normalizeUsState(state);
  return stateName ? REGION_BY_STATE.get(stateName) ?? null : null;
};

export const getUsRegionStates = (region: UsRegionName | null): UsStateName[] =>
  region ? STATES_BY_REGION[region] : US_STATES.map(({ name }) => name);
