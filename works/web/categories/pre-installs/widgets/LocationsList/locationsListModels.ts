export interface LocationsListParams extends __esri.WidgetProperties {
  view: __esri.MapView;
  locations: __esri.Graphic[];
  locationsFields: __esri.Field[];
  color?: string | number[] | __esri.Color;
}

export const LocationsListDefaultParams: LocationsListParams = {
  view: null,
  locations: [],
  locationsFields: [],
  color: '#5500ee'
}
