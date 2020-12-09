define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "./gsvPegmanModels", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/symbols", "esri/geometry"], function (require, exports, tslib_1, decorators_1, Widget_1, watchUtils, widget_1, gsvPegmanModels_1, GraphicsLayer_1, Graphic_1, symbols_1, geometry_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    watchUtils = tslib_1.__importStar(watchUtils);
    GraphicsLayer_1 = tslib_1.__importDefault(GraphicsLayer_1);
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    widget_1.tsx;
    var CSS = {
        base: 'map16-gsv-pegman'
    };
    var GSVPegman = (function (_super) {
        tslib_1.__extends(GSVPegman, _super);
        function GSVPegman(params) {
            var _this = _super.call(this, params) || this;
            _this.handlers = [];
            _this.dragImg = null;
            _this.gDropLine = null;
            _this.gDropMark = null;
            _this.lastDragX = 0;
            _this.first = true;
            _this.params = null;
            _this.gl = null;
            _this.gpegman = null;
            _this.glos = null;
            _this.state = null;
            _this.params = Object.assign({}, gsvPegmanModels_1.GSVPegmanDefaultParams, params);
            var active = !!params.initialPosition;
            var initialPosition = params.initialPosition || { lat: 0, lng: 0 };
            var initialPOV = params.initialPOV || { heading: 0, pitch: 0 };
            _this.state = tslib_1.__assign(tslib_1.__assign({ active: active }, initialPosition), initialPOV);
            _this.params.view.when(_this.onViewReady.bind(_this));
            return _this;
        }
        GSVPegman.prototype.onViewReady = function () {
            this.gDropMark = new Graphic_1.default({
                symbol: new symbols_1.SimpleMarkerSymbol({
                    color: 'black',
                    style: 'x',
                    size: 5,
                    outline: {
                        color: 'black',
                        width: '1px'
                    }
                })
            });
            this.gDropLine = new Graphic_1.default({
                symbol: new symbols_1.SimpleLineSymbol({
                    color: 'black',
                    width: '1px',
                    style: 'short-dot'
                })
            });
            this.gpegman = new Graphic_1.default({
                geometry: new geometry_1.Point({
                    latitude: this.state.lat || 0,
                    longitude: this.state.lng || 0
                }),
                symbol: new symbols_1.PictureMarkerSymbol({
                    url: this.params.pegman,
                    width: 40,
                    height: 40
                })
            });
            this.glos = new Graphic_1.default({
                geometry: new geometry_1.Point({
                    latitude: this.state.lat || 0,
                    longitude: this.state.lng || 0
                }),
                symbol: new symbols_1.PictureMarkerSymbol({
                    url: this.params.los,
                    width: 40,
                    height: 40
                })
            });
            this.glos.symbol.angle = this.state.heading || 0;
            this.gl = new GraphicsLayer_1.default({
                graphics: [this.glos, this.gpegman],
                visible: this.state.active
            });
            this.params.view.map.add(this.gl);
            this.dragImg = new Image(40, 40);
            this.dragImg.style.zIndex = '0';
            this.dragImg.style.visibility = 'hidden';
            this.dragImg.style.position = 'absolute';
            this.params.view.container.appendChild(this.dragImg);
        };
        GSVPegman.prototype.onStateUpdate = function () {
            this.gpegman.geometry = new geometry_1.Point({
                latitude: this.state.lat,
                longitude: this.state.lng
            });
            this.glos.geometry = new geometry_1.Point({
                latitude: this.state.lat,
                longitude: this.state.lng
            });
            this.glos.symbol.angle = this.state.heading;
            this.gl.visible = this.state.active;
        };
        GSVPegman.prototype.cleanupHandlers = function () {
            for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                var t = _a[_i];
                t.remove();
            }
            this.handlers = [];
        };
        GSVPegman.prototype.viewOnDrag = function (event) {
            event.stopPropagation();
        };
        GSVPegman.prototype.onMouseDown = function (event) {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            else {
                window.event.returnValue = false;
            }
            this.first = true;
            this.cleanupHandlers();
            this.handlers.push(this.params.view.on('drag', this.viewOnDrag));
            this.handlers.push(this.params.view.on('pointer-move', this.viewOnPointerMove.bind(this)));
            this.handlers.push(this.params.view.on('pointer-up', this.viewOnPointerUp.bind(this)));
            return false;
        };
        GSVPegman.prototype.viewOnPointerMove = function (event) {
            event.preventDefault();
            if (this.first) {
                this.dragImg.style.zIndex = '9999';
                this.dragImg.style.visibility = 'visible';
                this.params.view.graphics.add(this.gDropLine);
                this.params.view.graphics.add(this.gDropMark);
                this.first = false;
            }
            this.dragImg.style.left = event.x + "px";
            this.dragImg.style.top = event.y + "px";
            if (this.lastDragX < event.x && this.dragImg.src !== this.params.pegmanFlyingE) {
                this.dragImg.src = this.params.pegmanFlyingE;
            }
            else if (this.lastDragX > event.x && this.dragImg.src !== this.params.pegmanFlyingW) {
                this.dragImg.src = this.params.pegmanFlyingW;
            }
            this.lastDragX = event.x;
            var pto0 = this.params.view.toMap({ x: (event.x), y: (event.y - 40) });
            var pto = this.params.view.toMap(event);
            this.gDropMark.geometry = pto;
            this.gDropLine.geometry = new geometry_1.Polyline({
                paths: [[
                        [pto0.x, pto0.y],
                        [pto.x, pto.y]
                    ]],
                spatialReference: pto.spatialReference.clone()
            });
            return false;
        };
        GSVPegman.prototype.viewOnPointerUp = function (event) {
            event.preventDefault();
            this.dragImg.style.zIndex = '0';
            this.dragImg.style.visibility = 'hidden';
            this.params.view.graphics.remove(this.gDropLine);
            this.params.view.graphics.remove(this.gDropMark);
            this.cleanupHandlers();
            var pto = this.params.view.toMap(event);
            this.state = tslib_1.__assign(tslib_1.__assign({}, this.state), { active: true, lat: pto.latitude, lng: pto.longitude });
        };
        GSVPegman.prototype.postInitialize = function () {
            var handle = watchUtils.init(this, 'state', this.onStateUpdate);
            this.own(handle);
        };
        GSVPegman.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("button", { bind: this, onmousedown: this.onMouseDown.bind(this) })));
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], GSVPegman.prototype, "state", void 0);
        GSVPegman = tslib_1.__decorate([
            decorators_1.subclass('esri.widgets.GSVPegman')
        ], GSVPegman);
        return GSVPegman;
    }(Widget_1.default));
    return GSVPegman;
});
