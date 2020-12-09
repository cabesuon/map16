import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { renderable, tsx } from 'esri/widgets/support/widget';
import GSVPegman from '../GSVPegman/GSVPegman';
import GSVPanorama from '../GSVPanorama/GSVPanorama';
import { State, GSVParams, GSVDefaultParams, eqStates } from './gsvModels';
import { GSVPanoramaParams } from '../GSVPanorama/gsvPanoramaModels';
tsx;

const CSS = {
  base: 'map16-gsv',
  widget: 'esri-widget'
};

@subclass('esri.widgets.GSV')
class GSV extends Widget {

  //----------------------------------
  //  private properties
  //----------------------------------

  private params: GSVParams = null;
  private panorama: GSVPanorama;
  private isPanoramaInUi: boolean;
  private pegman: GSVPegman;

  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: GSVParams) {
    super(params);
    this.params = Object.assign({}, GSVDefaultParams, params);
    this.state = {
      active: false,
      lat: 0,
      lng: 0,
      heading: 0,
      pitch: 0
    }
    this.params.view.when(this.onViewReady.bind(this));
    this.watch('state', this.onStateUpdate.bind(this));
  }

  //----------------------------------
  //  public properties
  //----------------------------------

  @property()
  @renderable()
  state: State = null;

  //----------------------------------
  //  private
  //----------------------------------

  private onViewReady () {
    this.pegman = new GSVPegman({
      ...this.params.pegmanParams,
      view: this.params.view,
      initialPosition: {
        lat: this.state.lat,
        lng: this.state.lng
      },
      initialPOV: {
        heading: this.state.heading,
        pitch: this.state.pitch
      },
      container: document.createElement('div')
    });
    this.pegman.watch('state', this.pegmanOnStateUpdate.bind(this));
  }

  private onStateUpdate () {
    if (this.pegman && !eqStates(this.pegman.state, this.state)) {
      this.pegman.state = { ...this.state };
    }
    if (!this.panorama) {
      return;
    }

    if (!eqStates(this.panorama.state, this.state)) {
      this.panorama.state = { ...this.state };
    }

    if (
      this.panorama.state.active &&
      !this.isPanoramaInUi
    ) {
      this.params.view.ui.add(
        this.panorama,
        'bottom-right'
      );
      this.isPanoramaInUi = true;
    } else if (
      !this.panorama.state.active &&
      this.isPanoramaInUi
    ) {
      this.params.view.ui.remove(this.panorama);
      this.isPanoramaInUi = false;
    }
  }

  private panoramaOnStateUpdate(state: State) {
    this.state = {
      ...state
    };
  }

  private pegmanOnStateUpdate() {
    // update manager state
    this.state = { ...this.pegman.state };

    // if pegman gsv is active create gsv/
    if (this.pegman.state.active && !this.panorama) {
      const panoramaParams: GSVPanoramaParams = 
        this.params.panoramaParams && this.params.panoramaParams.gmstPanoramaOptions && {};
      this.panorama = new GSVPanorama({
        gmstPanoramaOptions: {
          ...panoramaParams,
          position: {
            lat: this.state.lat,
            lng: this.state.lng
          },
          pov: {
            heading: this.state.heading,
            pitch: this.state.pitch
          }
        }
      });
      this.params.view.ui.add(
        this.panorama,
        'bottom-right'
      );
      this.panorama.watch('state', this.panoramaOnStateUpdate.bind(this));
    }
    
    // if pegman gsv is not active destroy gsv
    if (!this.pegman.state.active && this.panorama) {
      this.params.view.ui.remove(
        this.panorama
      );
      this.panorama.destroy();
      this.panorama = null;
    }
  }

  //----------------------------------
  //  widget life cycle
  //----------------------------------

  render() {
    const pegmanContentNode = this.pegman ? this.pegman.render() : null;
    return (
      <div
        class={this.classes([CSS.base, CSS.widget])}
        bind={this}
      >
        <p
        bind={this}
        >{this.params.text}</p>
        {pegmanContentNode}
      </div>
    );
  }
}

export = GSV;
