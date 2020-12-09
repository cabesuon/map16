import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';

import { viewGoToTargetParam, fieldValue } from '../utils';

import {
    LocationsDetailParams,
    LocationsDetailDefaultParams
} from './locationsDetailModels';

tsx;

const CSS = {
  base: 'map16-locations-detail'
};

@subclass('esri.widgets.LocationsDetail')
class LocationsDetail extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: LocationsDetailParams = null;
  private view: __esri.MapView = null;
  private location: __esri.Graphic = null;
  private locationsFields: __esri.Field[] = [];
  
  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: LocationsDetailParams) {
    super(params);
    this.params = Object.assign({}, LocationsDetailDefaultParams, params);
    this.view = this.params.view;
    this.location = this.params.location;
    this.locationsFields = this.params.locationsFields;
  }

  //----------------------------------
  //  handlers
  //----------------------------------

  private onClick() {
    const view = this.view;
    const location = this.location;
    this.view.goTo(viewGoToTargetParam(this.view, this.location.geometry))
    .then(function () {
      view.popup.open({
        features: [location]
      });
    });
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  render() {
    return (
      <div
        class={this.classes(['esri-widget', CSS.base])}
        bind={this}
        onclick={this.onClick.bind(this)}
      >
        <table
          class='map16-table'
        >
          {this.locationsFields.map(f =>
            <tr>
            <th>{f.alias}</th>
            <td>{fieldValue(this.location.attributes[f.name], f)}</td>
            </tr>
          )}
        </table>
      </div>
    );
  }
}

export = LocationsDetail;
