import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import * as watchUtils from 'esri/core/watchUtils';
import { renderable, tsx } from "esri/widgets/support/widget";
import { GSVPanoramaParams, State } from './gsvPanoramaModels';

tsx;

const CSS = {
  base: "map16-gsv-panorama"
};

@subclass("esri.widgets.GSVPanorama")
class GSVPanorama extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private rootNode: HTMLElement = null;
  private params: GSVPanoramaParams = null;
  private panorama: google.maps.StreetViewPanorama = null;

  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: GSVPanoramaParams) {
    super(params);
    // params or default
    this.params = Object.assign({}, { gmstPanoramaOptions: { position: null, pov: null } }, params);
    // initialize state
    const active = !!params.gmstPanoramaOptions.position;
    const initialPosition = params.gmstPanoramaOptions.position || { lat: 0, lng: 0 };
    const initialPOV = params.gmstPanoramaOptions.pov || { heading: 0, pitch: 0 };
    this.state = {
      active,
      ...initialPosition,
      ...initialPOV
    };
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  @property()
  @renderable()
  state: State = null;

  //----------------------------------
  //  handlers
  //----------------------------------

  private onStateUpdate () {
    if (this.panorama) {
      const position: google.maps.LatLng = this.panorama.getPosition();
      if (
        (
          !position &&
          this.state.lat !== 0 &&
          this.state.lng !== 0
        ) ||
        (
          position &&
          (
            this.state.lat !== position.lat() ||
            this.state.lng !== position.lng()
          )
        )
      ) {
        this.panorama.setPosition({
          lat: this.state.lat,
          lng: this.state.lng
        });
      }
      const pov: google.maps.StreetViewPov = this.panorama.getPov();
      if (
        this.state.heading !== pov.heading ||
        this.state.pitch !== pov.pitch
      ) {
        this.panorama.setPov({
          heading: this.state.heading,
          pitch: this.state.pitch
        });
      }

      if (this.state.active !== this.panorama.getVisible()) {
        this.panorama.setVisible(this.state.active);       
      }
      
    }
  }

  private panoramaPositionChanged() {
    const position: google.maps.LatLng = this.panorama.getPosition();
    this.state = {
      ...this.state,
      lat: position.lat(),
      lng: position.lng()
    };
  }

  private panoramaPovChanged() {
    const pov: google.maps.StreetViewPov = this.panorama.getPov();
    this.state = {
      ...this.state,
      heading: pov.heading,
      pitch: pov.pitch
    };
  }

  private panoramaCloseClick() {
    this.state = {
      ...this.state,
      active: false
    }
  }

  private initPanorama() {
    this.panorama = new google.maps.StreetViewPanorama(
      this.rootNode,
      {
        ...this.params.gmstPanoramaOptions,
        enableCloseButton: true
      }
    );
    google.maps.event.addListener(
      this.panorama,
      'position_changed',
      this.panoramaPositionChanged.bind(this)
    );
    google.maps.event.addListener(
      this.panorama,
      'pov_changed',
      this.panoramaPovChanged.bind(this)
    );
    google.maps.event.addListener(
      this.panorama,
      'closeclick',
      this.panoramaCloseClick.bind(this)
    );
  }

  private storeNode(element: Element) {
    this.rootNode = element as HTMLElement;
    this.initPanorama();
    this.onStateUpdate();
  }

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  postInitialize() {
    const handle = watchUtils.init(this, 'state', this.onStateUpdate);
    this.own(handle);
  }

  render() {
    return (
      <div
        class={CSS.base}
        bind={this}
        afterCreate={this.storeNode}
        data-node-ref="rootNode"
      />
    );
  }
}

export = GSVPanorama;
