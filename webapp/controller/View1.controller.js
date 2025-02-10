sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller,Sorter,Filter,FilterOperator,Spreadsheet,MessageToast,Fragment) => {
    "use strict";

    return Controller.extend("com.company.salesinfo.salesinfo.controller.View1", {
        onInit() {
            // Creating a model
            // var oModel = new JSONModel();
            // Loading the JSON data from the model
            // oModel.loadData("model/salesData.json");
            // Set the loaded model to the view
            // this.getView().setModel(oModel, "salesModel");
        },

        onSearchByName: function (oEvent) {
            let sQuery = oEvent.getParameter("newValue"); // Get the search query (for name)
            let oTable = this.getView().byId("salesTable");
            let oBinding = oTable.getBinding("items");

            if (sQuery) {
                let aFilters = [
                    new Filter("productId", FilterOperator.Contains, sQuery),
                    new Filter("productName", FilterOperator.Contains, sQuery),
                    new Filter("category", FilterOperator.Contains, sQuery),
                    new Filter("salesCity", FilterOperator.Contains, sQuery)
                ];
                oBinding.filter(new Filter({ filters: aFilters, and: false }));
            } else {
                oBinding.filter([]); // Clear filter if empty
            }
        },

        
        onRowSelect: function (oEvent) {
            let oTable = this.getView().byId("salesTable");
            let oSelectedItem = oTable.getSelectedItem();

            // If the same row is clicked again, deselect it
            // if (oSelectedItem && oSelectedItem.isSelected()) {
            //     oTable.removeSelections(); // Deselect the row
            //     oSelectedItem = null; // Reset selection
            // }

            // Show/hide delete & update buttons based on selection
            let oDeleteBtn = this.getView().byId("btnDelete");
            let oUpdateBtn = this.getView().byId("btnUpdate");
            let isSelected = !!oSelectedItem;
            oUpdateBtn.setVisible(isSelected);
            oDeleteBtn.setVisible(isSelected);
                
        },
        
        onNavigate: function(oEvent) {
            let oContext = oEvent.getSource().getBindingContext("salesModel");
            if (!oContext) {
                console.error("Binding context is null or undefined.");
                return;
            }
            let sProductId = oContext.getProperty("productId"); // Retrieve productId
            console.log("Navigating to productId:", sProductId);
            // Navigate to RouteView2 with productId as a route parameter
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (oRouter) {
                oRouter.navTo("RouteView2", { productId: sProductId });
            } else {
                console.error("Router not found.");
            }
            
        },
        onDeleteRow: function () {
            let oTable = this.getView().byId("salesTable");
            let oModel = this.getView().getModel("salesModel"); // Get named model
            let oSelectedItem = oTable.getSelectedItem();
            console.log(oSelectedItem)
         
            // Get the selected row index from the binding path
            let sPath = oSelectedItem.getBindingContext("salesModel").getPath(); // Example: "/salesData/0"
            console.log(sPath);   ///salesData/4
            let aData = oModel.getProperty("/salesData"); // Get array from model
        
            let iIndex = parseInt(sPath.split("/")[2]); // Extract index correctly.  The 2nd index need to be get because it will convert into 3 strings as "",salesDetails, and index of selected row
        // parseInt is use to convert extracted string into integer
            if (iIndex >= 0) {
                aData.splice(iIndex, 1); // Remove row from array.  it will slice thr row starting from iIndex and delte with one row
                oModel.setProperty("/salesData", aData); //  and updtae the model with new rows or deleted rows
            }
        
            // for table selection and hiding the Delete button and a succ3essfull messgae toast
            oTable.removeSelections();
            this.getView().byId("btnDelete").setVisible(false);
            this.getView().byId("btnUpdate").setVisible(false);
        
            MessageToast.show("Row deleted successfully!");
        },
        onDownloadExcel: function () {
            // let oModel = this.getView().getModel("salesModel"); // Get the JSON model
            // let aData = oModel.getProperty("/salesData"); // Get table data
            let oTable = this.getView().byId("salesTable");
            let oBinding = oTable.getBinding("items"); // Get the binding of the table
            console.log(oBinding);

            // Get the filtered rows based on the binding
            let aData = [];
            oBinding.getContexts().forEach(function (oContext) {
                aData.push(oContext.getObject()); // Get the objects (rows) from the filtered context
            });
            console.log(aData);
            
            if (!aData || aData.length === 0) {
                MessageToast.show("No data available for download!");
                return;
            }

            // Define column structure for Excel
            let aColumns = [
                { label: "Product Name", property: "productName" },
                { label: "Category", property: "category" },
                { label: "Sales City", property: "salesCity" },
                { label: "Price", property: "price", type: "Number" },
                { label: "Units Sold", property: "unitsSold", type: "Number" },
                { label: "Total Revenue", property: "totalRevenue", type: "Number" }
            ];

            // Define settings for the spreadsheet
            let oSettings = {
                workbook: { columns: aColumns },
                dataSource: aData,
                fileName: "SalesData.xlsx"
            };

            // Create a new spreadsheet instance and export
            let oSheet = new Spreadsheet(oSettings);
            oSheet.build().then(function () {
                MessageToast.show("Excel file downloaded successfully!");
            }).finally(function () {
                oSheet.destroy();
            });
        },
        onReloadData: function () {
            let oTable = this.getView().byId("salesTable");
            var oModel = this.getView().getModel("salesModel");
            
            if (oModel) {
                let oBinding = oTable.getBinding("items");
                oBinding.sort(null);
                oModel.setData({});
                oModel.loadData("model/salesData.json"); // Reload the JSON data
                MessageToast.show("Data reloaded successfully!");
            }
        },
        OnCreate:function(){
            var oView = this.getView();  
        
            if (!this.oCreateDialog) {  // Use a separate variable for Create Dialog
                this.oCreateDialog = Fragment.load({
                    id: oView.getId(),  
                    name: "com.company.salesinfo.salesinfo.view.CreateDialog",
                    controller: this  
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);  
                    return oDialog;
                });
            }
        
            this.oCreateDialog.then(function (oDialog) {  // Use separate variable here
                oDialog.open();  
            });
        },
        
        OnUpdate: function(){
            var oView = this.getView();
            let oTable = oView.byId("salesTable");
            let oSelectedItem = oTable.getSelectedItem();
            let oContext = oSelectedItem.getBindingContext("salesModel");
            let oSelectedData = oContext.getObject();
            
            if (!this.pDialog){
                this.pDialog = Fragment.load({
                    id:oView.getId(),
                    name:"com.company.salesinfo.salesinfo.view.UpdateDialog",
                    controller: this
                }).then(function (oDialog){
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            
            this.pDialog.then(function (oDialog){
                oView.byId("UproductId").setValue(oSelectedData.productId);
                oView.byId("UproductName").setValue(oSelectedData.productName);
                oView.byId("UCategory").setValue(oSelectedData.category);
                oView.byId("USalesCity").setValue(oSelectedData.salesCity);
                oDialog.open();
            });
        },
        
        onCreateEntry: function () {
            var oDialog = this.getView().byId("createDialog");  // Get dialog reference
            var sProductId = this.getView().byId("productId").getValue();  // Get input value
            var sProductName = this.getView().byId("productName").getValue();
            var sCategory = this.getView().byId("category").getValue();
            var sSalesCity = this.getView().byId("salesCity").getValue();
            if (sProductId.trim() === "" || sProductName.trim() === "" 
                || sCategory.trim() === "" || sSalesCity.trim() === ""  ) {
                MessageToast.show("Please enter all fields.");
                return;
            }
            var oModel = this.getView().getModel("salesModel");
            var aSalesData = oModel.getProperty("/salesData");  // Get current data array        
            var oNewEntry = { // Create new product object
                productId: sProductId,
                productName: sProductName,
                category: sCategory,
                salesCity: sSalesCity
            };       
            aSalesData.push(oNewEntry);  // Add new entry to array
            oModel.setProperty("/salesData", aSalesData);  // Update model
            oModel.refresh(); 
            MessageToast.show("Product '" + sProductId + "' created!");
            this.getView().byId("productId").setValue("");
            this.getView().byId("productName").setValue("");
            this.getView().byId("category").setValue("");
            this.getView().byId("salesCity").setValue("");
            oDialog.close();  // Close the dialog after creation          
        },

        onUpdateEntry: function () {
            let oView = this.getView();
            let oTable = oView.byId("salesTable");
            let oModel = oView.getModel("salesModel");
            let oSelectedItem = oTable.getSelectedItem();       
            if (!oSelectedItem) {
                MessageToast.show("No row selected.");
                return;
            }       
            let sPath = oSelectedItem.getBindingContext("salesModel").getPath(); // e.g., "/salesData/2"       
            let sUpdatedProductName = oView.byId("UproductName").getValue(); // Get updated values from dialog
            let sUpdatedCategory = oView.byId("UCategory").getValue();
            let sUpdatedSalesCity = oView.byId("USalesCity").getValue();
        
            // Update the model with new values
            oModel.setProperty(sPath + "/productName", sUpdatedProductName);
            oModel.setProperty(sPath + "/category", sUpdatedCategory);
            oModel.setProperty(sPath + "/salesCity", sUpdatedSalesCity);
        
            oModel.refresh(); // Refresh model to reflect changes in UI
            oTable.removeSelections();
            this.getView().byId("btnDelete").setVisible(false);
            this.getView().byId("btnUpdate").setVisible(false);
        
            MessageToast.show("Product updated successfully!");       
            // Close the dialog
            this.getView().byId("updateDialog").close();
        },

        onCloseDialog: function () {
           
            this.getView().byId("createDialog").close();  
           
        },
        onCloseDialogUpdate: function(){
            this.getView().byId("updateDialog").close();
        }


        // ,
        // onSortByRevenue: function () {
        //     let oTable = this.getView().byId("salesTable");  // Get the table
        //     let oBinding = oTable.getBinding("items"); // Get binding for sorting
        //     if (!this.bSortDescending) {
        //         this.bSortDescending = false; // Start with descending order
        //     }
        //     let oSorter = new Sorter("totalRevenue", this.bSortDescending); // Sort by revenue in descending order
        //     oBinding.sort(oSorter);
        //     this.bSortDescending = !this.bSortDescending;
        // }
        
        
    });
});