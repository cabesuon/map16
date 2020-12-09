import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import SpatialReference from 'esri/geometry/SpatialReference';

import { removeAllChildNodes } from '../utils';

import {
  LocationsFinderSource,
  LocationsFieldFinderParams,
  LocationsFieldFinderDefaultParams
} from './locationsFieldFinderModels';

tsx;

const CSS = {
  base: 'map16-locations-field-finder',
  label: 'map16-locations-field-finder-label',
  button: 'map16-locations-field-finder-button'
};

@subclass('esri.widgets.LocationsFinder')
class LocationsFieldFinder extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: LocationsFieldFinderParams = null;
  private fieldValues: string[] = [];
  private selectNameNode: HTMLSelectElement = null;
  private selectFieldNode: HTMLSelectElement = null;
  private selectValueNode: HTMLSelectElement = null;
  private locationsFinderSources: LocationsFinderSource[] = [];
  private sourceLabelText: string = null;
  private fieldLabelText: string = null;
  private valueLabelText: string = null;
  private findButtonText: string = null;
  
  //----------------------------------
  //  private functions
  //----------------------------------

  private getSelectedSource(): LocationsFinderSource {
    return this.locationsFinderSources.find(s => s.name === this.name);
  }

  private getSelectedField(): __esri.Field {
    return this.getSelectedSource().
      locationsFieldsFinder.find(f => f.name === this.field);
  }

  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: LocationsFieldFinderParams) {
    super(params);
    this.params = Object.assign({}, LocationsFieldFinderDefaultParams, params);
    this.locationsFinderSources = this.params.locationsFinderSources;
    this.sourceLabelText = this.params.sourceLabelText;
    this.fieldLabelText = this.params.fieldLabelText;
    this.valueLabelText = this.params.valueLabelText;
    this.findButtonText = this.params.findButtonText;
    this.name = null;
    this.field = null;
    this.value = null;
    this.results = [];
    this.watch('name', this.onNameUpdate.bind(this));
    this.watch('field', this.onFieldUpdate.bind(this));
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  @property()
  name: string = null;

  @property()
  field: string = null;

  @property()
  value: string = null;

  @property()
  @renderable()
  results: __esri.Graphic[] = [];

  //----------------------------------
  //  private
  //----------------------------------

  private fieldValuesLoadRequest() {
    const selectedSource = this.getSelectedSource();
    if (!this.field) {
      return;
    }
    const queryTask = new QueryTask({
      url: selectedSource.url
    });
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = [this.field];
    query.where = '1=1';
    query.returnGeometry = false;
    query.returnDistinctValues = true;
    queryTask.execute(query).then(this.fieldValuesLoadSuccess.bind(this));
  }

  private fieldValuesLoadSuccess(results: __esri.FeatureSet) {
    this.fieldValues = results.features.map(
      (f: __esri.Graphic) => f.attributes[this.field]
    );
    this.loadSelectValueOptions();
  }

  private loadSelectNameOptions() {
    if (!this.selectNameNode) {
      return;
    }
    // clear old options
    removeAllChildNodes( this.selectNameNode);
    // add new options
    let o;
    o = document.createElement('option');
    o.value = null;
    o.text = '- source -';
    this.selectNameNode.appendChild(o)
    this.locationsFinderSources.forEach(s => {
      o = document.createElement('option');
      o.value = s.name;
      o.text = s.name;
      this.selectNameNode.appendChild(o);
    });
  }

  private loadSelectFieldOptions() {
    if (!this.selectFieldNode) {
      return;
    }
    // clear old options
    removeAllChildNodes( this.selectFieldNode);
    // add new options
    let o;
    o = document.createElement('option');
    o.value = null;
    o.text = '- attribute -';
    this.selectFieldNode.appendChild(o);
    const selectedSource = this.getSelectedSource();
    if (!selectedSource) {
      return;
    }
    selectedSource.locationsFieldsFinder.forEach(f => {
      o = document.createElement('option');
      o.value = f.name;
      o.text = f.alias;
      this.selectFieldNode.appendChild(o);
    });
  }

  private loadSelectValueOptions() {
    if (!this.selectValueNode) {
      return;
    }
    // clear old options
    removeAllChildNodes( this.selectValueNode);
    // add new options
    let o;
    o = document.createElement('option');
    o.value = null;
    o.text = '- value -';
    this.selectValueNode.appendChild(o)
    this.fieldValues.forEach(element => {
      o = document.createElement('option');
      o.value = element;
      o.text = element;
      this.selectValueNode.appendChild(o);
    });
  }

  private searchRequest(value: string) {
    const selectedSource = this.getSelectedSource();
    if (!selectedSource) {
      return;
    }
    const selectedField = this.getSelectedField();
    if (!selectedField) {
      return;
    }
    const queryTask = new QueryTask({
      url: selectedSource.url
    });
    var query = new Query();
    query.returnGeometry = true;
    query.outSpatialReference = new SpatialReference({
      wkid: 102100
    });
    query.outFields = selectedSource.locationsFields.map(f => f.name);
    let d = "";
    if (selectedField.type.toString().toLowerCase().includes('string')) {
      d ="'";
    }
    query.where = `${selectedField.name}=${d}${value}${d}`;
    queryTask.execute(query).then(this.searchSuccess.bind(this));
  }

  private searchSuccess(results: __esri.FeatureSet) {
    this.results = results.features;
  }

  //----------------------------------
  //  handlers
  //----------------------------------


  private storeNode(element: Element) {
    switch (element.getAttribute('data-node-ref')) {
      case 'selectNameNode':
        this.selectNameNode = element as HTMLSelectElement;
        this.loadSelectNameOptions();
        break;
      case 'selectFieldNode':
        this.selectFieldNode = element as HTMLSelectElement;
        this.loadSelectFieldOptions();
        break;
      case 'selectValueNode':
        this.selectValueNode =  element as HTMLSelectElement;
        this.loadSelectValueOptions();
        break;
    }
  }

  private onSelectNameChange(e: Event) {
    this.name = (e.target as HTMLOptionElement).value;
  }

  private onSelectFieldChange(e: Event) {
    this.field = (e.target as HTMLOptionElement).value;
  }

  private onSelectValueChange(e: Event) {
    this.value = (e.target as HTMLOptionElement).value;
  }

  private onButtonFindClick() {
    if (this.value) {
      this.searchRequest(this.value);
    }
  }

  private onNameUpdate() {
    this.loadSelectFieldOptions();
  }

  private onFieldUpdate() {
    this.fieldValuesLoadRequest();
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
          class={CSS.label}
          bind={this}
        >
          {this.sourceLabelText}
          <select
            bind={this}
            afterCreate={this.storeNode}
            data-node-ref='selectNameNode'
            onchange={this.onSelectNameChange.bind(this)}
          ></select>
        </div>
        <div
          class={CSS.label}
          bind={this}
        >
          {this.fieldLabelText}
          <select
            bind={this}
            afterCreate={this.storeNode}
            data-node-ref='selectFieldNode'
            onchange={this.onSelectFieldChange.bind(this)}
          ></select>
        </div>
        <div
          class={CSS.label}
          bind={this}
        >
          {this.valueLabelText}
          <select
            bind={this}
            afterCreate={this.storeNode}
            data-node-ref='selectValueNode'
            onchange={this.onSelectValueChange.bind(this)}
          ></select>
        </div>
        <button
          class={this.classes([
            'map16-btn', 'map16-btn-clear'
          ])}
          bind={this}
          onclick={this.onButtonFindClick.bind(this)}
        >{this.findButtonText}</button>
      </div>
    );
  }
}

export = LocationsFieldFinder;
