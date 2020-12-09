define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget"], function (require, exports, tslib_1, decorators_1, Widget_1, watchUtils, widget_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    watchUtils = tslib_1.__importStar(watchUtils);
    widget_1.tsx;
    var CSS = {
        base: "map16-gsv-panorama"
    };
    var GSVPanorama = (function (_super) {
        tslib_1.__extends(GSVPanorama, _super);
        function GSVPanorama(params) {
            var _this = _super.call(this, params) || this;
            _this.rootNode = null;
            _this.params = null;
            _this.panorama = null;
            _this.state = null;
            _this.params = Object.assign({}, { gmstPanoramaOptions: { position: null, pov: null } }, params);
            var active = !!params.gmstPanoramaOptions.position;
            var initialPosition = params.gmstPanoramaOptions.position || { lat: 0, lng: 0 };
            var initialPOV = params.gmstPanoramaOptions.pov || { heading: 0, pitch: 0 };
            _this.state = tslib_1.__assign(tslib_1.__assign({ active: active }, initialPosition), initialPOV);
            return _this;
        }
        GSVPanorama.prototype.onStateUpdate = function () {
            if (this.panorama) {
                var position = this.panorama.getPosition();
                if ((!position &&
                    this.state.lat !== 0 &&
                    this.state.lng !== 0) ||
                    (position &&
                        (this.state.lat !== position.lat() ||
                            this.state.lng !== position.lng()))) {
                    this.panorama.setPosition({
                        lat: this.state.lat,
                        lng: this.state.lng
                    });
                }
                var pov = this.panorama.getPov();
                if (this.state.heading !== pov.heading ||
                    this.state.pitch !== pov.pitch) {
                    this.panorama.setPov({
                        heading: this.state.heading,
                        pitch: this.state.pitch
                    });
                }
                if (this.state.active !== this.panorama.getVisible()) {
                    this.panorama.setVisible(this.state.active);
                }
            }
        };
        GSVPanorama.prototype.panoramaPositionChanged = function () {
            var position = this.panorama.getPosition();
            this.state = tslib_1.__assign(tslib_1.__assign({}, this.state), { lat: position.lat(), lng: position.lng() });
        };
        GSVPanorama.prototype.panoramaPovChanged = function () {
            var pov = this.panorama.getPov();
            this.state = tslib_1.__assign(tslib_1.__assign({}, this.state), { heading: pov.heading, pitch: pov.pitch });
        };
        GSVPanorama.prototype.panoramaCloseClick = function () {
            this.state = tslib_1.__assign(tslib_1.__assign({}, this.state), { active: false });
        };
        GSVPanorama.prototype.initPanorama = function () {
            this.panorama = new google.maps.StreetViewPanorama(this.rootNode, tslib_1.__assign(tslib_1.__assign({}, this.params.gmstPanoramaOptions), { enableCloseButton: true }));
            google.maps.event.addListener(this.panorama, 'position_changed', this.panoramaPositionChanged.bind(this));
            google.maps.event.addListener(this.panorama, 'pov_changed', this.panoramaPovChanged.bind(this));
            google.maps.event.addListener(this.panorama, 'closeclick', this.panoramaCloseClick.bind(this));
        };
        GSVPanorama.prototype.storeNode = function (element) {
            this.rootNode = element;
            this.initPanorama();
            this.onStateUpdate();
        };
        GSVPanorama.prototype.postInitialize = function () {
            var handle = watchUtils.init(this, 'state', this.onStateUpdate);
            this.own(handle);
        };
        GSVPanorama.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base, bind: this, afterCreate: this.storeNode, "data-node-ref": "rootNode" }));
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], GSVPanorama.prototype, "state", void 0);
        GSVPanorama = tslib_1.__decorate([
            decorators_1.subclass("esri.widgets.GSVPanorama")
        ], GSVPanorama);
        return GSVPanorama;
    }(Widget_1.default));
    return GSVPanorama;
});
