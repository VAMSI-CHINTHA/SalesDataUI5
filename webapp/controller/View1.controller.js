sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "com/company/salesinfo/salesinfo/Formatters/Formatter"
], (Controller,JSONModel,Filter,FilterOperator,Spreadsheet,MessageToast,Fragment,Formatter) => {
    "use strict";

    return Controller.extend("com.company.salesinfo.salesinfo.controller.View1", {
        onInit() {
            
        },
        formatter: Formatter,

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
        
        onNavigate: function (oEvent) {
            let oContext = oEvent.getSource().getBindingContext("salesModel");
            if (!oContext) {
                console.error("Binding context is null or undefined.");
                return;
            }
        
            let sProductId = oContext.getProperty("productId"); // Retrieve productId
            console.log("Navigating to productId:", sProductId);
        
            // Use getOwnerComponent() to get the router
            let oRouter = this.getOwnerComponent().getRouter();
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
        OpenCreateDialog: function () {
            var oView = this.getView();
            var oModel = oView.getModel("salesModel");
        
            // Initialize new entry dynamically
            oModel.setProperty("/newEntry", {
                productId: "",
                productName: "",
                category: "",
                salesCity: ""
            });
        
            // Load the fragment dynamically if not already loaded
            if (!this.oCreateDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.company.salesinfo.salesinfo.view.CreateDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);  // Attach dialog to the view
                    this.oCreateDialog = oDialog;
                    this.processSalesData();
                    this.oCreateDialog.open();  // Open dialog
                }.bind(this));  // Use `bind(this)` to maintain correct context
            } else {
                this.oCreateDialog.open();  // If already loaded, just open it
            }
        },

   
        onCreateEntry: function () {
            var oModel = this.getView().getModel("salesModel");
            var aSalesData = oModel.getProperty("/salesData");
            var oNewEntry = oModel.getProperty("/newEntry");
        
            if (!oNewEntry.productId || !oNewEntry.productName || !oNewEntry.category || !oNewEntry.salesCity) {
                MessageToast.show("Please enter all fields.");
                return;
            }
        
            var pIdExists = aSalesData.some(function (oEntry) {
                return oEntry.productId === oNewEntry.productId;
            });
        
            if (pIdExists) {
                MessageToast.show("Product ID already exists. Use a unique ID.");
                return;
            }
        
            aSalesData.unshift(oNewEntry);
            oModel.setProperty("/salesData", aSalesData);
            oModel.refresh();
        
            MessageToast.show("Product created successfully!");
            this.oCreateDialog.close();
        },
        

        OpenUpdateDialog: function () {
            var oView = this.getView();
            var oTable = oView.byId("salesTable"); // Make sure your table has this ID
            var oModel = oView.getModel("salesModel");
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageToast.show("No row selected.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext("salesModel");
            var oSelectedData = oContext.getObject();
        
            // Copy selected data to avoid direct modification
            oModel.setProperty("/selectedEntry", Object.assign({}, oSelectedData));
        
            // Lazy load update dialog if not already loaded
            if (!this.oUpdateDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.company.salesinfo.salesinfo.view.UpdateDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this.oUpdateDialog = oDialog;
                    this.processSalesData();
                    this.oUpdateDialog.open();
                }.bind(this));
            } else {
                this.oUpdateDialog.open();
            }
        },
        onUpdateEntry: function () {
            var oModel = this.getView().getModel("salesModel");
            var aSalesData = oModel.getProperty("/salesData");
            var oUpdatedEntry = oModel.getProperty("/selectedEntry");
        
            var iIndex = aSalesData.findIndex(function (oEntry) {
                return oEntry.productId === oUpdatedEntry.productId;
            });
        
            if (iIndex !== -1) {
                aSalesData[iIndex] = oUpdatedEntry;
                oModel.setProperty("/salesData", aSalesData);
                oModel.refresh();
        
                MessageToast.show("Product updated successfully!");
                this.oUpdateDialog.close();
            } else {
                MessageToast.show("Error: Could not find product.");
            }
        },
        
        processSalesData: function () {
            var oModel = this.getView().getModel("salesModel");
            console.log("oModel ", oModel);
            
            var aSalesData = oModel.getProperty("/salesData");
            console.log("aSalesData ", aSalesData);
            
            // Extract unique categories 
            var aUniqueCategories = []; // empty array
            for (var i = 0; i < aSalesData.length; i++) {   
                var category = aSalesData[i].category;
                if (aUniqueCategories.indexOf(category) === -1) { // check if category already present
                    aUniqueCategories.push(category); // if not there push into category array
                }
            }
            console.log("aUniqueCategories ", aUniqueCategories);
        
            // Convert unique categories into an array of objects for binding to UI
            var aCategoryList = [];
            for (var j = 0; j < aUniqueCategories.length; j++) {
                aCategoryList.push({ category: aUniqueCategories[j] });
            }
            console.log("aCategoryList ", aCategoryList);
        
            // Setting the category model and use it in formatter
            var oCategoryModel = new JSONModel({ categories: aCategoryList });
            this.getView().setModel(oCategoryModel, "categoryModel");
            console.log("Final Category Model ", oCategoryModel.getData());
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
        // },
        
        // onShowGraph: function() {
        //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //     oRouter.navTo("GraphicalView"); // Route to Graphical View
        // },
        
        
    });
});