import MapView = require('esri/views/MapView');
import {
  GSVPegmanParams,
  GSVPegmanDefaultParams
} from '../GSVPegman/gsvPegmanModels';
import {
  GSVPanoramaParams,
  GSVPanoramaDefaultParams
} from '../GSVPanorama/gsvPanoramaModels';

export interface State extends
  google.maps.LatLngLiteral,
  google.maps.StreetViewPov
{
  active: boolean;
}

export function eqStates(s1: State, s2: State) {
  return s1.active === s2.active &&
    s1.lat === s2.lat &&
    s1.lng === s2.lng &&
    s1.heading === s2.heading &&
    s1.pitch === s2.pitch;
}

export interface GSVParams extends __esri.WidgetProperties {
  // map view
  view: MapView;
  // text
  text: string;
  // panorama
  panoramaParams?: GSVPanoramaParams;
  // pegman
  pegmanParams?: GSVPegmanParams;
}

export const GSVDefaultParams: GSVParams = {
  view: null,
  text: 'Drag the Google® Street View man onto the street you want to see a panorama for.'
}
