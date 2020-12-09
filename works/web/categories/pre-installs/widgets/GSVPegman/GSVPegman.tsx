import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import * as watchUtils from 'esri/core/watchUtils';
import { renderable, tsx } from 'esri/widgets/support/widget';
import { State, GSVPegmanParams, GSVPegmanDefaultParams } from './gsvPegmanModels';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Graphic from 'esri/Graphic';
import { PictureMarkerSymbol, SimpleMarkerSymbol, SimpleLineSymbol } from 'esri/symbols';
import { Polyline, Point } from 'esri/geometry';

tsx;

const CSS = {
  base: 'map16-gsv-pegman'
};

@subclass('esri.widgets.GSVPegman')
class GSVPegman extends Widget {
  
  //----------------------------------
  //  private properties
  //----------------------------------

  private handlers: any[] = [];
  private dragImg: HTMLImageElement = null;
  private gDropLine: Graphic = null;
  private gDropMark: Graphic = null;
  private lastDragX: number = 0;
  private first: boolean = true;
  private params: GSVPegmanParams = null;
  private gl: GraphicsLayer = null;
  private gpegman: Graphic = null;
  private glos: Graphic = null;

  //----------------------------------
  //  initilize functions
  //----------------------------------

  constructor(params?: GSVPegmanParams) {
    super(params);
    // params or default
    this.params = Object.assign({}, GSVPegmanDefaultParams, params);
    // initialize state
    const active = !!params.initialPosition;
    const initialPosition = params.initialPosition || { lat: 0, lng: 0 };
    const initialPOV = params.initialPOV || { heading: 0, pitch: 0 };
    this.state = {
      active,
      ...initialPosition,
      ...initialPOV
    }
    // initialize graphics and layer
    this.params.view.when(this.onViewReady.bind(this));
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

  private onViewReady () {
    // initialize graphics and layer
    this.gDropMark = new Graphic({
      symbol: new SimpleMarkerSymbol({
        color: 'black',
        style: 'x',
        size: 5,
        outline: {
          color: 'black',
          width: '1px'
        }
      })
    });
    this.gDropLine = new Graphic({
      symbol: new SimpleLineSymbol({
        color: 'black',
        width: '1px',
        style: 'short-dot'
      })
    });
    this.gpegman = new Graphic({
      geometry: new Point({
        latitude: this.state.lat || 0,
        longitude: this.state.lng || 0
      }),
      symbol: new PictureMarkerSymbol({
        url: this.params.pegman,
        width: 40,
        height: 40
      })
    });
    this.glos = new Graphic({
      geometry: new Point({
        latitude: this.state.lat || 0,
        longitude: this.state.lng || 0
      }),
      symbol: new PictureMarkerSymbol({
        url: this.params.los,
        width: 40,
        height: 40
      })
    });
    (this.glos.symbol as PictureMarkerSymbol).angle = this.state.heading || 0;
    this.gl = new GraphicsLayer({
      graphics: [this.glos, this.gpegman],
      visible: this.state.active
    });
    this.params.view.map.add(this.gl);
    
    // initialize image
    this.dragImg = new Image(40, 40);
    this.dragImg.style.zIndex = '0';
    this.dragImg.style.visibility = 'hidden';
    this.dragImg.style.position = 'absolute';
    this.params.view.container.appendChild(this.dragImg);
  }

  private onStateUpdate () {
    this.gpegman.geometry = new Point({
      latitude: this.state.lat,
      longitude: this.state.lng
    });
    this.glos.geometry = new Point({
      latitude: this.state.lat,
      longitude: this.state.lng
    });
    (this.glos.symbol as PictureMarkerSymbol).angle = this.state.heading;
    this.gl.visible = this.state.active;
  }

  private cleanupHandlers () {
    for (const t of this.handlers) {
      t.remove();
    }
    this.handlers = [];
  }

  viewOnDrag(event: DragEvent) {
    event.stopPropagation();
  }

  onMouseDown (event: MouseEvent){
    if (event && event.preventDefault) {
      event.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    
    this.first = true;
    
    // clean handlers
    this.cleanupHandlers();
    
    // add handlers
    this.handlers.push(this.params.view.on('drag', this.viewOnDrag));
    this.handlers.push(this.params.view.on('pointer-move', this.viewOnPointerMove.bind(this)));
    this.handlers.push(this.params.view.on('pointer-up', this.viewOnPointerUp.bind(this)));
    
    return false;
  }

  viewOnPointerMove (event: MouseEvent) {
    event.preventDefault();
    
    if (this.first) {
      // make pegman visible
      this.dragImg.style.zIndex = '9999';
      this.dragImg.style.visibility = 'visible';
      
      // add drop graphic
      this.params.view.graphics.add(this.gDropLine);
      this.params.view.graphics.add(this.gDropMark);

      this.first = false;
    }

    // update pegman
    this.dragImg.style.left = `${event.x}px`;
    this.dragImg.style.top = `${event.y}px`;
    if (this.lastDragX < event.x && this.dragImg.src !== this.params.pegmanFlyingE) {
      this.dragImg.src = this.params.pegmanFlyingE;
    } else if(this.lastDragX > event.x && this.dragImg.src !== this.params.pegmanFlyingW) {
      this.dragImg.src = this.params.pegmanFlyingW;
    }
    this.lastDragX = event.x;

    // update drop graphic
    const pto0 = this.params.view.toMap({ x: (event.x), y: (event.y - 40) });
    const pto = this.params.view.toMap(event);
    this.gDropMark.geometry = pto;
    this.gDropLine.geometry = new Polyline({
      paths: [[
        [pto0.x, pto0.y],
        [pto.x, pto.y]
      ]],
      spatialReference: pto.spatialReference.clone()
    });

    return false;
  }

  viewOnPointerUp (event: MouseEvent) {
    event.preventDefault();
    
    // remove drop graphics
    this.dragImg.style.zIndex = '0';
    this.dragImg.style.visibility = 'hidden';
    this.params.view.graphics.remove(this.gDropLine);
    this.params.view.graphics.remove(this.gDropMark);

    // clean handlers
    this.cleanupHandlers();

    // update state
    const pto = this.params.view.toMap(event);
    this.state = {
      ...this.state,
      active: true,
      lat: pto.latitude,
      lng: pto.longitude
    };
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
      >
        <button
          bind={this}
          onmousedown={this.onMouseDown.bind(this)}
        >
        </button>
      </div>
    );
  }
}

export = GSVPegman;
