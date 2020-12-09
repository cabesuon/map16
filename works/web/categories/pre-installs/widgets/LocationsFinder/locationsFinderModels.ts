import {
  LocationsFinderSource
} from '../LocationsFieldFinder/locationsFieldFinderModels';
import LocationsFinderResults
from '../LocationsFinderResults/LocationsFinderResults';

export interface LocationsFinderParams extends __esri.WidgetProperties {
  view: __esri.MapView;
  locationsFinderSources: LocationsFinderSource[];
  titleText?: string;
  locationsFinderResults?: LocationsFinderResults;
}

export const LocationsFinderDefaultParams: LocationsFinderParams = {
  view: null,
  locationsFinderSources: [],
  titleText: 'Find Locations',
  locationsFinderResults: null
}
