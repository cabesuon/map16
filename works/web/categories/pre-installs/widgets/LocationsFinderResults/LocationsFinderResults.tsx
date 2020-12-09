import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';
import LocationsList from '../LocationsList/LocationsList';
import {
    LocationsFinderResultsList,
    LocationsFinderResultsParams,
    LocationsFinderResultsDefaultParams
} from './locationsFinderResultsModels';

tsx;

const CSS = {
  base: 'map16-locations-finder-results',
  header: 'map16-locations-finder-results-header',
  tools: 'map16-locations-finder-results-tools',
  content: 'map16-locations-finder-results-content'
};

@subclass('esri.widgets.LocationsFinderResults')
class LocationsFinderResults extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: LocationsFinderResultsParams = null;
  private lists: Record<string, LocationsList> = {};
  private selectNode: HTMLSelectElement = null;
  private view: __esri.MapView = null;
  private locationsResults: Record<string, LocationsFinderResultsList> = {};
  private titleText: string;
  private dropButtonTooltipText: string;

  
  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: LocationsFinderResultsParams) {
    super(params);
    this.params = Object.assign({}, LocationsFinderResultsDefaultParams, params);
    this.view = this.params.view;
    this.titleText = this.params.titleText;
    this.dropButtonTooltipText = this.params.dropButtonTooltipText;
    this.selected = null;
    this.initResultsAndLocationsLists();
    this.watch('selected', this.onSelectedSet.bind(this));
  }

  private initResultsAndLocationsLists() {
    this.params.results.forEach(r => {
      this.locationsResults[r.name] = r;
      this.lists[r.name] = new LocationsList({
        view: this.params.view,
        locations: r.locations,
        locationsFields: r.locationsFields
      });
    });
  }

  //----------------------------------
  //  private methods
  //----------------------------------

  private loadSelectOptions() {
    if (this.selectNode) {
      let o;
      for(const name of Object.keys(this.locationsResults)) {
        o = document.createElement('option');
        o.value = name;
        o.text = name;
        this.selectNode.appendChild(o);
      };
    }
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  @property()
  @renderable()
  selected: string = null;

  //----------------------------------
  //  handlers
  //----------------------------------

  private onSelectedSet() {
    if (
      this.selectNode &&
      this.selectNode.value !== this.selected
    ) {
      this.selectNode.value = this.selected;
    }
  }

  private storeNode(element: Element) {
    this.selectNode = element as HTMLSelectElement;
    this.loadSelectOptions();
  }

  private onChange(e: Event) {
    this.selected = (e.target as HTMLOptionElement).value;
  }

  private onClick() {
    this.lists[this.selected].locations = [];
    this.render();
  }

  //----------------------------------
  //  public methods
  //----------------------------------

  setLocationsFinderResultsList (results: LocationsFinderResultsList) {
    this.locationsResults[results.name] = results;
    if (!this.lists.hasOwnProperty(results.name)) {
      this.lists[results.name] = new LocationsList({
        view: this.view,
        locations: results.locations,
        locationsFields: results.locationsFields
      });
    } else {
      this.lists[results.name].locations = results.locations;
    }
    this.selected = results.name;
  }

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  render() {
    const content = this.lists.hasOwnProperty(this.selected) ?
      this.lists[this.selected].render() : 'Oops! Something gone wrong!';
    return (
      <div
        class={this.classes(['esri-widget', CSS.base])}
        bind={this}
      >
        <div
          class={CSS.header}
          bind={this}
        >
          {this.titleText}
        </div>
        <div
          class={CSS.tools}
        >
          <select
            bind={this}
            afterCreate={this.storeNode}
            data-node-ref='selectNode'
            onchange={this.onChange.bind(this)}
          ></select>
          <div
            class='map16-btn-icon'
            bind={this}
            onclick={this.onClick.bind(this)}
            title={this.dropButtonTooltipText}
          ><span class='esri-icon-trash'></span></div>
        </div>
        <div
          class={CSS.content}>
          {content}
        </div>
      </div>
    );
  }
}

export = LocationsFinderResults;
