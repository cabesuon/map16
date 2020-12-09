export interface LocationsFinderResultsList {
  // name
  name: string;
  // locations
  locations: __esri.Graphic[];
  // locations fields
  locationsFields?: __esri.Field[];
}

export interface LocationsFinderResultsParams extends __esri.WidgetProperties {
  view: __esri.MapView;
  results: LocationsFinderResultsList[];
  titleText?: string;
  dropButtonTooltipText?: string;
}

export const LocationsFinderResultsDefaultParams: LocationsFinderResultsParams = {
  view: null,
  results: [],
  titleText: 'Find Locations Results',
  dropButtonTooltipText: 'Drop List Results'
}
