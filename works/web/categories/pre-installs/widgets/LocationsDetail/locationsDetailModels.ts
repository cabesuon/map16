export interface LocationsDetailParams extends __esri.WidgetProperties {
  // view
  view: __esri.MapView;
  // location
  location: __esri.Graphic;
  // locations fields
  locationsFields: __esri.Field[];
}

export const LocationsDetailDefaultParams: LocationsDetailParams = {
  view: null,
  location: null,
  locationsFields: []
}
