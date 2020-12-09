// GMSTPanoramaOptions is a subset of google.maps.StreetViewPanoramaOptions
export interface GMSTPanoramaOptions {
  addressControl?: boolean,
  addressControlOptions?: {
    position: google.maps.ControlPosition
  },
  clickToGo?: boolean,
  disableDoubleClickZoom?: boolean,
  enableCloseButton?: boolean,
  fullScreenControl?: boolean,
  fullscreenControlOptions?: {
    position: google.maps.ControlPosition
  },
  imageDateControl?: boolean,
  linksControl?: boolean,
  panControl?: boolean,
  panControlOptions?: {
    position: google.maps.ControlPosition
  },
  position?: google.maps.LatLngLiteral,
  pov?: google.maps.StreetViewPov,
  zoom?: number,
  zoomControl?: boolean,
  zoomControlOptions?: {
    position: google.maps.ControlPosition
  }
}

export interface GSVPanoramaParams extends __esri.WidgetProperties {
  gmstPanoramaOptions?: GMSTPanoramaOptions
}

export const GSVPanoramaDefaultParams: GSVPanoramaParams = {};

export interface State extends
  google.maps.LatLngLiteral,
  google.maps.StreetViewPov
{
  active: boolean;
}
