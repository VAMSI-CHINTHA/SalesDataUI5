sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], (Controller) => {
    "use strict";
  
    return Controller.extend("com.company.salesinfo.salesinfo.controller.Graphical", {
        onInit() {
          
        },
        onBackToRouteView1 : function(){
          let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteView1")
        }
    });
  });