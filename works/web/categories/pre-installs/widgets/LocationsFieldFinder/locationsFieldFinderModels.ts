export interface LocationsFinderSource {
  name: string;
  url: string;
  locationsFieldsFinder: __esri.Field[];
  locationsFields: __esri.Field[];
}

export interface LocationsFieldFinderParams extends __esri.WidgetProperties {
  sourceLabelText?: string,
  fieldLabelText?: string,
  valueLabelText?: string,
  findButtonText?: string,
  locationsFinderSources: LocationsFinderSource[]
}

export const LocationsFieldFinderDefaultParams: LocationsFieldFinderParams = {
  sourceLabelText: 'select',
  fieldLabelText: 'where',
  valueLabelText: 'equals to',
  findButtonText: 'Find',
  locationsFinderSources: []
}
