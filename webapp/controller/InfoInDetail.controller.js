sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], (Controller) => {
    "use strict";
  
    return Controller.extend("com.company.salesinfo.salesinfo.controller.InfoInDetail", {
        onInit() {
          let oRouter= this.getOwnerComponent().getRouter();
          oRouter.getRoute("RouteView2").attachPatternMatched(this.onRouteMatched,this);
          

        },
        onBackToRouteView1 : function(){
          let oRouter = this.getOwnerComponent().getRouter()  ;
          oRouter.navTo("RouteView1")
        },
        onRouteMatched:function(oEvent){
          let oArgs = oEvent.getParameters().arguments;
            let sProductId = oArgs.productId;
            console.log(sProductId); // This should log the productId passed via URL

            let oModel = this.getView().getModel("salesModel");
            let aSalesData = oModel.getProperty("/salesData");

            // Find the product with the matching productId in the salesData array
            let oProduct = aSalesData.find(item => item.productId === sProductId);

            if (oProduct) {
                // Bind the model data to the view elements
                this.getView().bindElement({
                    path: "/salesData/" + aSalesData.indexOf(oProduct),
                    model: "salesModel"
                });
            } else {
                console.error("Product not found");
            }
        }
    });
  });