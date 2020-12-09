import MapView = require('esri/views/MapView');

export interface GSVPegmanParams extends __esri.WidgetProperties {
  // image sources
  pegman?: string;
  los?: string;
  pegmanFlyingE?: string;
  pegmanFlyingW?: string;
  // map view
  view: MapView;
  // position and rotation
  initialPosition?: google.maps.LatLngLiteral;
  initialPOV?: google.maps.StreetViewPov;
}

export const GSVPegmanDefaultParams: GSVPegmanParams = {
  pegman: 'images/pegman.png',
  los: 'images/los.png',
  pegmanFlyingE: 'images/pegman_flying_e.png',
  pegmanFlyingW: 'images/pegman_flying_w.png',
  view: null,
  initialPosition: null,
  initialPOV: null
}

export interface State extends
  google.maps.LatLngLiteral,
  google.maps.StreetViewPov
{
  active: boolean;
}
