define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "../GSVPegman/GSVPegman", "../GSVPanorama/GSVPanorama", "./gsvModels"], function (require, exports, tslib_1, decorators_1, Widget_1, widget_1, GSVPegman_1, GSVPanorama_1, gsvModels_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    GSVPegman_1 = tslib_1.__importDefault(GSVPegman_1);
    GSVPanorama_1 = tslib_1.__importDefault(GSVPanorama_1);
    widget_1.tsx;
    var CSS = {
        base: 'map16-gsv',
        widget: 'esri-widget'
    };
    var GSV = (function (_super) {
        tslib_1.__extends(GSV, _super);
        function GSV(params) {
            var _this = _super.call(this, params) || this;
            _this.isPanoramaInUi = false;
            _this.state = null;
            _this.params = Object.assign({}, gsvModels_1.GSVDefaultParams, params);
            _this.view = _this.params.view;
            _this.state = {
                active: false,
                lat: 0,
                lng: 0,
                heading: 0,
                pitch: 0
            };
            return _this;
        }
        GSV.prototype.onViewReady = function () {
            this.pegman = new GSVPegman_1.default(tslib_1.__assign(tslib_1.__assign({}, this.params.pegmanParams), { view: this.view, initialPosition: {
                    lat: this.state.lat,
                    lng: this.state.lng
                }, initialPOV: {
                    heading: this.state.heading,
                    pitch: this.state.pitch
                }, container: document.createElement('div') }));
            this.pegman.watch('state', this.pegmanOnStateUpdate.bind(this));
        };
        GSV.prototype.onStateUpdate = function () {
            if (this.pegman && !gsvModels_1.eqStates(this.pegman.state, this.state)) {
                this.pegman.state = tslib_1.__assign({}, this.state);
            }
            if (!this.panorama) {
                return;
            }
            if (!gsvModels_1.eqStates(this.panorama.state, this.state)) {
                this.panorama.state = tslib_1.__assign({}, this.state);
            }
            if (this.panorama.state.active &&
                !this.isPanoramaInUi) {
                this.view.ui.add(this.panorama, 'bottom-right');
                this.isPanoramaInUi = true;
            }
            else if (!this.panorama.state.active &&
                this.isPanoramaInUi) {
                this.view.ui.remove(this.panorama);
                this.isPanoramaInUi = false;
            }
        };
        GSV.prototype.panoramaOnStateUpdate = function (state) {
            this.state = tslib_1.__assign({}, state);
        };
        GSV.prototype.pegmanOnStateUpdate = function () {
            this.state = tslib_1.__assign({}, this.pegman.state);
            if (this.pegman.state.active && !this.panorama) {
                var panoramaParams = this.params.panoramaParams && this.params.panoramaParams.gmstPanoramaOptions && {};
                this.panorama = new GSVPanorama_1.default({
                    gmstPanoramaOptions: tslib_1.__assign(tslib_1.__assign({}, panoramaParams), { position: {
                            lat: this.state.lat,
                            lng: this.state.lng
                        }, pov: {
                            heading: this.state.heading,
                            pitch: this.state.pitch
                        } })
                });
                this.view.ui.add(this.panorama, 'bottom-right');
                this.panorama.watch('state', this.panoramaOnStateUpdate.bind(this));
            }
            if (!this.pegman.state.active && this.panorama) {
                this.view.ui.remove(this.panorama);
                this.panorama.destroy();
                this.panorama = null;
            }
        };
        GSV.prototype.postInitialize = function () {
            this.view.when(this.onViewReady.bind(this));
            this.own([
                this.watch('state', this.onStateUpdate.bind(this))
            ]);
        };
        GSV.prototype.render = function () {
            var pegmanContentNode = this.pegman ? this.pegman.render() : null;
            return (widget_1.tsx("div", { class: this.classes([CSS.base, CSS.widget]), bind: this },
                widget_1.tsx("p", { bind: this }, this.params.text),
                pegmanContentNode));
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], GSV.prototype, "state", void 0);
        GSV = tslib_1.__decorate([
            decorators_1.subclass('esri.widgets.GSV')
        ], GSV);
        return GSV;
    }(Widget_1.default));
    return GSV;
});
