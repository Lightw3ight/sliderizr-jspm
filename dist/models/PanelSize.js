System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var PanelSize;
    return {
        setters:[],
        execute: function() {
            (function (PanelSize) {
                PanelSize[PanelSize["Small"] = 1] = "Small";
                PanelSize[PanelSize["Medium"] = 2] = "Medium";
                PanelSize[PanelSize["Large"] = 3] = "Large";
            })(PanelSize || (PanelSize = {}));
            exports_1("default",PanelSize);
        }
    }
});
