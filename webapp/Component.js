sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/company/salesinfo/salesinfo/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.company.salesinfo.salesinfo.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            var oRouter = this.getRouter();

            // Check if the current route is RouteView2
             if (window.location.hash) {
                // If it's RouteView2, navigate back to RouteView1 on refresh
                oRouter.navTo("RouteView1", {}, true);  // Navigates to RouteView1
            } 

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});