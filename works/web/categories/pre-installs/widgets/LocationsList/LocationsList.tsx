import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';

import GraphicsLayer from 'esri/layers/GraphicsLayer';

import { extent, simpleSymbol } from '../utils';

import LocationsDetail from '../LocationsDetail/LocationsDetail';
import {
    LocationsListParams,
    LocationsListDefaultParams
} from './locationsListModels';

tsx;

const CSS = {
  base: 'map16-locations-list',
  info: 'map16-locations-list-info',
  list: 'map16-locations-list-list'
};

@subclass('esri.widgets.LocationsList')
class LocationsList extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: LocationsListParams = null;
  private locationsDetails: LocationsDetail[] = [];
  private gl: __esri.GraphicsLayer = null;
  private view: __esri.MapView = null;
  private color: string | number[] | __esri.Color = null;
  
  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: LocationsListParams) {
    super(params);
    this.params = Object.assign({}, LocationsListDefaultParams, params);
    this.view = this.params.view;
    this.locations = this.params.locations;
    this.locationsFields = this.params.locationsFields;
    this.color = this.params.color;
    this.initLayer();
    this.onUpdateLocations();
    this.watch('locations', this.onUpdateLocations.bind(this));
    this.watch('locationsFields', this.onUpdateLocationsFields.bind(this));
  }

  private initLayer() {
    this.gl = new GraphicsLayer();
    this.view.map.add(this.gl);
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  @property()
  @renderable()
  locations: __esri.Graphic[] = [];

  @property()
  @renderable()
  locationsFields: __esri.Field[] = [];

  //----------------------------------
  //  handlers
  //----------------------------------

  private onUpdateLocations() {
    this.gl.graphics.removeAll();
    if (this.locations.length > 0) {
      this.locations.forEach(l => l.symbol = simpleSymbol(l, this.color));
      this.gl.addMany(this.locations);
      this.view.goTo(extent(this.locations.map(l => l.geometry)));
    }
    this.onUpdateLocationsFields();
  }

  private onUpdateLocationsFields() {
    this.locationsDetails = this.locations.map(
      l => new LocationsDetail({
        view: this.params.view,
        locationsFields: this.locationsFields,
        location: l
      })
    );
  }

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  render() {
    const content = this.locationsDetails.map(l => l.render());
    return (
      <div
        class={this.classes(['esri-widget', CSS.base])}
        bind={this}
      >
        <div
          class={CSS.info}
        ><b>{this.locationsDetails.length}</b> features (click to go)</div>
        <div
          class={CSS.list}
        >
          {content}
        </div>
      </div>
    );
  }
}

export = LocationsList;
