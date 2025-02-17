

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    function (Controller,MessageBox,MessageToast) {
        "use strict";

        return Controller.extend("localisation.controller.rms", {
            onInit: function () {
                var url = "./odata/ScopeItems";
                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "json",
                    contentType: "application/json",

                    success: function (data) {
                        console.log(data);

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                    }

                });

            },
            onNewPress: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteCRMS");
            },
            onNavBack: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Routehomepage");
            },

            //this is working fine if i keep single slect mode 
            // onSavePress: function (oEvent) {
            //     // Get the view and model
            //     var oView = this.getView();
            //     var oModel = oView.getModel(); // OData V4 Model

            //     // Get the table control
            //     var oTable = oView.byId("idProductsTable");


            //     // Get the selected item (single selection)
            //     var oSelectedItem = oTable.getSelectedItem(); // Only works if SingleSelect mode is used

            //     if (oSelectedItem) {
            //         // Get autoId (primary key) of the selected row
            //         var sAutoId = oSelectedItem.getBindingContext().getProperty("autoId");

            //         // Get selected values of the ComboBoxes
            //         var sBrandGuardianStatus = oSelectedItem.getCells()[3].getSelectedKey(); // ComboBox for brand
            //         var sGlobalServicesStatus = oSelectedItem.getCells()[4].getSelectedKey(); // ComboBox for global

            //         // Create a filter based on autoId to identify the correct record
            //         let oBindList = oModel.bindList("/MissingScopeItems");
            //         let aFilter = new sap.ui.model.Filter("autoId", sap.ui.model.FilterOperator.EQ, sAutoId);

            //         // Apply the filter and request the context for the filtered item
            //         oBindList.filter([aFilter]).requestContexts().then(function (aContexts) {
            //             if (aContexts && aContexts.length > 0) {
            //                 // Update the properties on the matched context
            //                 aContexts[0].setProperty("brandGuardianStatus", sBrandGuardianStatus);
            //                 aContexts[0].setProperty("globalServicesStatus", sGlobalServicesStatus);

            //                 // Submit the changes to the backend
            //                 oModel.submitBatch("updateGroup").then(function () {
            //                     sap.m.MessageToast.show("Record updated successfully!");
            //                 }).catch(function (oError) {
            //                     sap.m.MessageToast.show("Failed to update record: " + oError.message);
            //                 });
            //             }
            //         }).catch(function (oError) {
            //             sap.m.MessageToast.show("Failed to retrieve context: " + oError.message);
            //         });
            //     } else {
            //         sap.m.MessageToast.show("No item selected.");
            //     }
            // }


         // on change combobox is working only for one combo box working
            onBrandComboBoxChange: function (oEvent) {
                // Get the ComboBox that triggered the event
                var oComboBox = oEvent.getSource();

                // Get the context of the row
                var oBindingContext = oComboBox.getBindingContext();

                if (oBindingContext) {
                    var sAutoId = oBindingContext.getProperty("autoId");
                    var sBrandGuardianStatus = oComboBox.getSelectedKey();

                    this._updateBackend(sAutoId, sBrandGuardianStatus, null);
                }
            },

            onGlobalComboBoxChange: function (oEvent) {
                // Get the ComboBox that triggered the event
                var oComboBox = oEvent.getSource();

                // Get the context of the row
                var oBindingContext = oComboBox.getBindingContext();

                if (oBindingContext) {
                    var sAutoId = oBindingContext.getProperty("autoId");
                    var sGlobalServicesStatus = oComboBox.getSelectedKey();

                    this._updateBackend(sAutoId, null, sGlobalServicesStatus);
                }
            },

            _updateBackend: function (sAutoId, sBrandGuardianStatus, sGlobalServicesStatus) {
                var oModel = this.getView().getModel(); // OData V4 Model

                // Create a filter based on autoId to identify the correct record
                let oBindList = oModel.bindList("/MissingScopeItems");
                let aFilter = new sap.ui.model.Filter("autoId", sap.ui.model.FilterOperator.EQ, sAutoId);

                // Apply the filter and request the context for the filtered item
                oBindList.filter([aFilter]).requestContexts().then(function (aContexts) {
                    if (aContexts && aContexts.length > 0) {
                        let oContext = aContexts[0];

                        // Update the properties on the matched context
                        if (sBrandGuardianStatus !== null) {
                            oContext.setProperty("brandGuardianStatus", sBrandGuardianStatus);
                        }
                        if (sGlobalServicesStatus !== null) {
                            oContext.setProperty("globalServicesStatus", sGlobalServicesStatus);
                        }

                        // Submit the changes to the backend
                        oModel.submitBatch("updateGroup").then(function () {
                            sap.m.MessageToast.show("Record updated successfully!");
                        }).catch(function (oError) {
                            sap.m.MessageToast.show("Failed to update record: " + oError.message);
                        });
                    }
                }).catch(function (oError) {
                    sap.m.MessageToast.show("Failed to retrieve context: " + oError.message);
                });
            },

           
            
            onDeleteChange: function (oEvent) {
                var oTable = this.byId("idProductsTable");
                var oItem = oEvent.getSource().getParent(); // Get the button's parent (ColumnListItem)
            
                // Get the binding context to fetch the data
                var oContext = oItem.getBindingContext(); // Get the binding context of the selected row
                var sPath = oContext.getPath(); // Get the entity path
                
                // Retrieve the autoId from the context
                var oData = oContext.getObject();
                var sAutoId = oData.autoId; // Assuming the field name is 'autoId'
            
                // Confirmation before deletion
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // Call the delete function on the binding context for OData V4
                            oContext.delete().then(function () {
                                MessageToast.show("Item deleted successfully.");
                                // Refresh the table to reflect changes
                                oTable.getBinding("items").refresh();
                            }).catch(function (oError) {
                                MessageBox.error("Error deleting the item: " + oError.message);
                            });
                        }
                    }.bind(this) // Make sure the correct 'this' context is maintained
                });
            }
            
        });

    });


