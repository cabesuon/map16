define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GSVDefaultParams = exports.eqStates = void 0;
    function eqStates(s1, s2) {
        return s1.active === s2.active &&
            s1.lat === s2.lat &&
            s1.lng === s2.lng &&
            s1.heading === s2.heading &&
            s1.pitch === s2.pitch;
    }
    exports.eqStates = eqStates;
    exports.GSVDefaultParams = {
        view: null,
        text: 'Drag the Google® Street View man onto the street you want to see a panorama for.'
    };
});
