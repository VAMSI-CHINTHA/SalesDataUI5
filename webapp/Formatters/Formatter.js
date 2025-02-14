sap.ui.define([], function () {
    "use strict";

    return {
        categoryStateFormatter: function (sCategory) {
           

            var categoryStates = {
                "Electronics": "Success",       // Green
                "Furniture": "Information",     // Blue
                "Fashion": "Error",             // Red
                "Home Appliances": "Warning",   // orange
                "Home Decor": "None",   // Default color
                "Fitness": "None",      // Default color
                "Sports": "Warning"        // Orange
            };

            return categoryStates[sCategory] || "None"; // Default color
        }
    };
});
