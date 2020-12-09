import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';

import LocationsFieldFinder from '../LocationsFieldFinder/LocationsFieldFinder';
import LocationsFinderResults from '../LocationsFinderResults/LocationsFinderResults';
import {
  LocationsFinderResultsList
} from '../LocationsFinderResults/locationsFinderResultsModels';

import {
    LocationsFinderParams,
    LocationsFinderDefaultParams
} from './locationsFinderModels';

tsx;

const CSS = {
  widget: 'map16-widget',
  base: 'map16-locations-finder',
  header: 'map16-locations-finder-header',
  resultsOpenButton: 'map16-locations-finder-header-results-button'
};

@subclass('esri.widgets.LocationsFinder')
class LocationsFinder extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: LocationsFinderParams = null;
  private locationsFieldFinder: LocationsFieldFinder = null;
  private locationsFinderResults: LocationsFinderResults = null;
  private view: __esri.MapView = null;
  private titleText: string = null;

  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: LocationsFinderParams) {
    super(params);
    this.params = Object.assign({}, LocationsFinderDefaultParams, params);
    this.view = this.params.view;
    this.titleText = this.params.titleText;
    this.locationsFinderResults = this.params.locationsFinderResults;
    this.initLocationsFieldFinder();
    this.initLocationsFinderResults();
  }

  private initLocationsFieldFinder() {
    this.locationsFieldFinder = new LocationsFieldFinder({
      locationsFinderSources: this.params.locationsFinderSources
    });
    this.locationsFieldFinder.watch(
      'results',
      this.onFieldFinderResultsUpdate.bind(this)
    );
  }

  private initLocationsFinderResults() {
    const results: LocationsFinderResultsList[] =
      this.params.locationsFinderSources.map(
      s => ({
        name: s.name,
        locations: [],
        locationsFields: s.locationsFields
      })
    );
    if (!this.locationsFinderResults) {
      this.locationsFinderResults = new LocationsFinderResults({
        view: this.view,
        results
      });
    } else {
      results.forEach(
        r => this.locationsFinderResults
        .setLocationsFinderResultsList(r)
      );
    }
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  // @property()
  // resultsOpen: boolean = false;

  //----------------------------------
  //  handlers
  //----------------------------------

  private onFieldFinderResultsUpdate () {
    // if (!this.resultsOpen) {
    //   this.onResultsOpenClick();
    // }
    this.locationsFinderResults.setLocationsFinderResultsList({
      name: this.locationsFieldFinder.name,
      locations: this.locationsFieldFinder.results
    });
  }

  private onResultsOpenClick() {
    // this.resultsOpen = !this.resultsOpen;
    // if (this.resultsOpen) {
    //   this.params.view.ui.add(this.locationsFinderResults, 'bottom-right');
    // } else {
    //   this.params.view.ui.remove(this.locationsFinderResults);
    // }
  }

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  render() {
    return (
      <div
        class={this.classes(['map16-widget', CSS.base])}
        bind={this}
      >
        <div
          class={CSS.header}
          bind={this}
        >
          {this.titleText}
        </div>
        {this.locationsFieldFinder.render()}
      </div>
    );
  }
}

export = LocationsFinder;
