// For an introduction to the Blank template, see the following documentation:
// https://go.microsoft.com/fwlink/?LinkId=232509

(function () {
	"use strict";

    var app = WinJS.Application;

    var activation = Windows.ApplicationModel.Activation;

    var isFirstActivation = true;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			// TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
			// this is a good place to decide whether to populate an input field or choose a different initial view.
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			// A Launch activation happens when the user launches your app via the tile
			// or invokes a toast notification by clicking or tapping on the body.
			if (args.detail.arguments) {
				// TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
				// to take the user in response to them invoking a toast notification.
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				// TODO: This application had been suspended and was then terminated to reclaim memory.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
				// Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
			}
		}

		if (!args.detail.prelaunchActivated) {
			// TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
			// In that case it would be suspended shortly thereafter.
			// Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
			// should be done here (to avoid doing them in the prelaunch case).
			// Alternatively, this work can be done in a resume or visibilitychanged handler.
        }
        
		if (isFirstActivation) {
			// TODO: The app was activated and had not been running. Do general startup initialization here.
            document.addEventListener("visibilitychange", onVisibilityChanged);

            args.setPromise(WinJS.UI.processAll()
                .done(function () {
                    document.getElementById("check-button").addEventListener("click", onCheckButtonPress, false);

                    document.getElementById("update-button").addEventListener("click", onUpdateButtonPress, false);

                    document.getElementById("sync-button").addEventListener("click", onSyncButtonPress, false);
                }));
		}

		isFirstActivation = false;
	};

	function onVisibilityChanged(args) {
		if (!document.hidden) {
			// TODO: The app just became visible. This may be a good time to refresh the view.
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
    };

    function onUpdateButtonPress() {
        // Represents a connection to the endpoint for an app service. 
        var oAppMgmtSvcCxn = new Windows.ApplicationModel.AppService.AppServiceConnection();

        // Sets the name of the app service to which you want to connect.
        oAppMgmtSvcCxn.appServiceName = "be.hensens.updater";

        // Sets the package family name for the package that contains the endpoint for the app service.
        // Windows.ApplicationModel.Package.current.id.familyName
        oAppMgmtSvcCxn.packageFamilyName = "be.hensens.poc.appmgmt_r43v75rztrk40";

        // Opens a connection to the endpoint for the app service.
        oAppMgmtSvcCxn.openAsync()
            .done(function onComplete(iStatus) {
                console.log(convertToString(Windows.ApplicationModel.AppService.AppServiceConnectionStatus, iStatus));

                var sAppExtensionName = "sap.mobile.shared";

                var oAppExtensionCatalog = Windows.ApplicationModel.AppExtensions.AppExtensionCatalog.open(sAppExtensionName);

                if (iStatus === Windows.ApplicationModel.AppService.AppServiceConnectionStatus.success) {
                    oAppExtensionCatalog.findAllAsync()
                        .done(function onComplete(oAppExtensionList) {
                            Promise.all(
                                oAppExtensionList.map(function (oAppExtension) {
                                    return new Promise(function (resolve, reject) {
                                        var oRequestMessage = new Windows.Foundation.Collections.ValueSet();

                                        oRequestMessage.clear();

                                        oRequestMessage["command"] = "addPackageByAppInstallerFileAsync";

                                        oRequestMessage["packageFullName"] = oAppExtension.package.id.fullName;

                                        console.log("command:" + oRequestMessage["command"]);

                                        console.log("packageFullName:" + oRequestMessage["packageFullName"]);

                                        oAppMgmtSvcCxn.sendMessageAsync(oRequestMessage)
                                            .done(function onComplete(oResponse) {
                                                resolve(oResponse);
                                            }, function onError(oError) {
                                                reject(oError);
                                            });
                                    });
                                })
                            )
                                .then(function (aResponses) {
                                    aResponses.forEach(function (oResponse) {
                                        Hellper.EventLog.writeEntry(oResponse.message["packageFullName"]);

                                        if (oResponse.status === Windows.ApplicationModel.AppService.AppServiceResponseStatus.success) {
                                            if (oResponse.message["isRegistered"]) {
                                                Hellper.EventLog.writeEntry("The package is fully registered and ready to use");
                                            } else {
                                                Hellper.EventLog.writeEntry(oResponse.message["errorText"] || oResponse.message["error"]);
                                            }
                                        } else {
                                            Hellper.EventLog.writeEntry(
                                                convertToString(Windows.ApplicationModel.AppService.AppServiceResponseStatus, oResponse.status)
                                            );
                                        }
                                    });
                                })
                                .catch(function (oError) {
                                    debugger;
                                });
                        });
                }
            }, function onError(oError) {
                debugger;
            });
    }

    function onCheckButtonPress() {
        // Represents a connection to the endpoint for an app service. 
        var oAppMgmtSvcCxn = new Windows.ApplicationModel.AppService.AppServiceConnection();

        // Sets the name of the app service to which you want to connect.
        oAppMgmtSvcCxn.appServiceName = "be.hensens.updater";

        // Sets the package family name for the package that contains the endpoint for the app service.
        // Windows.ApplicationModel.Package.current.id.familyName
        oAppMgmtSvcCxn.packageFamilyName = "be.hensens.poc.appmgmt_r43v75rztrk40";

        // Opens a connection to the endpoint for the app service.
        oAppMgmtSvcCxn.openAsync()
            .done(function onComplete(iStatus) {
                console.log(convertToString(Windows.ApplicationModel.AppService.AppServiceConnectionStatus, iStatus));

                var sAppExtensionName = "sap.mobile.shared";

                var oAppExtensionCatalog = Windows.ApplicationModel.AppExtensions.AppExtensionCatalog.open(sAppExtensionName);

                if (iStatus === Windows.ApplicationModel.AppService.AppServiceConnectionStatus.success) {
                    oAppExtensionCatalog.findAllAsync()
                        .done(function onComplete(oAppExtensionList) {
                            Promise.all(
                                oAppExtensionList.map(function (oAppExtension) {
                                    return new Promise(function (resolve, reject) {
                                        var oRequestMessage = new Windows.Foundation.Collections.ValueSet();

                                        oRequestMessage.clear();
                                        
                                        oRequestMessage["command"] = "checkUpdateAvailabilityAsync";

                                        oRequestMessage["packageFullName"] = oAppExtension.package.id.fullName;

                                        console.log("command:" + oRequestMessage["command"]);

                                        console.log("packageFullName:" + oRequestMessage["packageFullName"]);

                                        oAppMgmtSvcCxn.sendMessageAsync(oRequestMessage)
                                            .done(function onComplete(oResponse) {
                                                resolve(oResponse);
                                            }, function onError(oError) {
                                                reject(oError);
                                            });
                                    });
                                })
                            )
                                .then(function (aResponses) {
                                    aResponses.forEach(function (oResponse) {
                                        Hellper.EventLog.writeEntry(oResponse.message["packageFullName"]);

                                        if (oResponse.status === Windows.ApplicationModel.AppService.AppServiceResponseStatus.success) {
                                            Hellper.EventLog.writeEntry(
                                                convertToString(Windows.ApplicationModel.PackageUpdateAvailability, oResponse.message["availability"])
                                            );
                                        } else {
                                            Hellper.EventLog.writeEntry(
                                                convertToString(Windows.ApplicationModel.AppService.AppServiceResponseStatus, oResponse.status)
                                            );
                                        }
                                    });
                                })
                                .catch(function (oError) {
                                    debugger;
                                });
                        });
                }
            }, function onError(oError) {
                debugger;
            });
    }

    function onSyncButtonPress() {
        var sAppExtensionName = "sap.mobile.shared";

        var oAppExtensionCatalog = Windows.ApplicationModel.AppExtensions.AppExtensionCatalog.open(sAppExtensionName);

        oAppExtensionCatalog.findAllAsync()
            .done(function onComplete(oAppExtensionList) {
                Promise.all(oAppExtensionList.map(function (oAppExtension) {
                    // The id of the app as defined by the package name in the Package.appxmanifest file.
                    console.log("app identifier:" + oAppExtension.appInfo.id);

                    // An identifier that uniquely identifies the app's package.
                    console.log("app's package identifier:" + oAppExtension.appInfo.packageFamilyName);

                    // The application user model ID for the application.
                    console.log("app user model ID:" + oAppExtension.appInfo.appUserModelId);

                    // The display name of the application as defined in the package manifest (Package.appxmanifest).
                    console.log("application's display name:" + oAppExtension.appInfo.displayInfo.displayName);

                    // The description of the application as defined in the package manifest (Package.appxmanifest).
                    console.log("application's description:" + oAppExtension.appInfo.displayInfo.description);

                    return new Promise(function (resolve, reject) {
                        // Used by the extension to specify any extra information that the hosting app can query.

                        oAppExtension.getExtensionPropertiesAsync()
                            .done(function onComplete(oPropertySet) {
                                var iPriority = 0;

                                if (oPropertySet.hasKey("priority")) {
                                    iPriority = parseInt(oPropertySet["priority"]["#text"], 10);
                                }

                                resolve({
                                    priority: iPriority,
                                    extension: oAppExtension
                                });
                            }, function onError(oError) {
                                reject(oError);
                            });
                    });
                }))
                    .then(function (aResults) {
                        Hellper.EventLog.writeEntry("Retrieving '" + sAppExtensionName + "' App Extension: " + aResults.length + " found.");

                        if (aResults.length > 0) {
                            var oPrioritizedExtension = aResults.sort(function (oFirst, oSecond) {
                                // sort descending by priority
                                return oSecond.priority - oFirst.priority;
                            })[0];

                            var oDestinationFolder;

                            oPrioritizedExtension.extension.getPublicFolderAsync()
                                .then(function onComplete(oPublicFolder) {
                                    oDestinationFolder = Windows.Storage.KnownFolders[oPublicFolder.name];

                                    return oPublicFolder.getFilesAsync();
                                }, function onError(oError) {
                                    debugger;
                                })
                                .done(function onComplete(oFileList) {
                                    oFileList.forEach(function (oFile) {
                                        Hellper.EventLog.writeEntry("Source: " + oFile.path);

                                        oFile.copyAsync(oDestinationFolder, oFile.name, Windows.Storage.NameCollisionOption.replaceExisting)
                                            .done(function (oReplacedFile) {
                                                Windows.Storage.FileIO.readTextAsync(oReplacedFile)
                                                    .done(function onComplete(sContent) {
                                                        Hellper.EventLog.writeEntry("Destination: " + oReplacedFile.path);

                                                        Hellper.EventLog.writeEntry(sContent);
                                                    });
                                            });
                                    });
                                }, function onError(oError) {
                                    debugger;
                                });
                        }
                    });
            }, function onError(oError) {
                debugger;
            });
    }

    function convertToString(oEnum, iValue) {
        var sValue;

        switch (oEnum) {
            case Windows.ApplicationModel.PackageUpdateAvailability:
                switch (iValue) {
                    case Windows.ApplicationModel.PackageUpdateAvailability.unknown:
                        sValue = "This value is returned when this function is called on a package that does not have an AppInstaller file association.";

                        break;
                    case Windows.ApplicationModel.PackageUpdateAvailability.noUpdates:
                        sValue = "This value is returned when no updates are available for the application.";

                        break;
                    case Windows.ApplicationModel.PackageUpdateAvailability.available:
                        sValue = "This value is returned when an update for the application is available, and the update is not required.";

                        break;
                    case Windows.ApplicationModel.PackageUpdateAvailability.required:
                        sValue = "This value is returned when an update for the application is available, and the update is required.";

                        break;
                    case Windows.ApplicationModel.PackageUpdateAvailability.error:
                        sValue = "This value is returned when an error is encountered.";

                        break;
                    default:
                        sValue = "PackageUpdateAvailability: " + iValue;

                        break;
                }

                break;
            case Windows.ApplicationModel.AppService.AppServiceResponseStatus:
                switch (iValue) {
                    case Windows.ApplicationModel.AppService.AppServiceResponseStatus.failure:
                        sValue = "The app service failed to receive and process the message.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceResponseStatus.resourceLimitsExceeded:
                        sValue = "The app service exited because not enough resources were available.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceResponseStatus.unknown:
                        sValue = "An unknown error occurred.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceResponseStatus.remoteSystemUnavailable:
                        sValue = "The device to which the message was sent is not available.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceResponseStatus.messageSizeTooLarge:
                        sValue = "The app service failed to process the message because it is too large.";

                        break;
                    default:
                        sValue = "AppServiceResponseStatus: " + iValue;

                        break;
                }

                break;
            case Windows.ApplicationModel.AppService.AppServiceConnectionStatus:
                switch (iValue) {
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.success:
                        sValue = "The connection to the app service was opened successfully.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.appNotInstalled:
                        sValue = "The package for the app service to which a connection was attempted is not installed on the device.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.appUnavailable:
                        sValue = "The package for the app service to which a connection was attempted is temporarily unavailable.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.appServiceUnavailable:
                        sValue = "The app with the specified package family name is installed and available, but the app does not declare support for the specified app service.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.unknown:
                        sValue = "An unknown error occurred.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.remoteSystemUnavailable:
                        sValue = "The device to which a connection was attempted is not available.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.remoteSystemNotSupportedByApp:
                        sValue = "The app on the remote device does not support remote connections.";

                        break;
                    case Windows.ApplicationModel.AppService.AppServiceConnectionStatus.notAuthorized:
                        sValue = "The user for your app is not authorized to connect to the service.";

                        break;
                    default:
                        sValue = "AppServiceConnectionStatus:" + iStatus;
                }
        }

        return sValue;
    }

	app.start();

})();
