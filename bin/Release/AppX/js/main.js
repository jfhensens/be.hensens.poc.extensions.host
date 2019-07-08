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
                    var oButton = document.getElementById("test-button");

                    oButton.addEventListener("click", onTestButtonPress, false);
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

    function onTestButtonPress(oEvent) {
        //var oCurrentPackage = Windows.ApplicationModel.Package.current;

        //oCurrentPackage.dependencies.forEach(function (oPackage) {
        //    if (oPackage.id.name === "be.hensens.poc.extensions.dev") {
        //        var oPackagePath = oPackage.installedLocation;

        //        oPackagePath.getFolderAsync("shared").done(function (oPublicFolder) {
        //            oPublicFolder.getFilesAsync(Windows.Storage.Search.OrderByName).done(function onComplete(oFileList) {
        //                oFileList.forEach(function (oFile) {
        //                    console.log(oFile.path);

        //                    Windows.Storage.FileIO.readTextAsync(oFile)
        //                        .done(function onComplete(sContent) {
        //                            document.getElementById("body").innerHTML += '<p class="win-type-title">' + oFile.path + '</p>';

        //                            document.getElementById("body").innerHTML += '<textarea class="win-textarea">' + sContent + '</textarea>';
        //                        });
        //                });
        //            });
        //        });
        //    }            
        //});


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

                                var sSharedFolder;

                                if (oPropertySet.hasKey("priority")) {
                                    iPriority = parseInt(oPropertySet["priority"]["#text"], 10);
                                }

                                if (oPropertySet.hasKey("shared")) {
                                    sSharedFolder = oPropertySet["shared"]["#text"];
                                }

                                resolve({
                                    priority: iPriority,
                                    shared: sSharedFolder,
                                    extension: oAppExtension
                                });
                            }, function onError(oError) {
                                reject(oError);
                            });
                    });
                }))
                    .then(function (aResults) {
                        if (aResults.length > 0) {
                            var oPrioritizedExtension = aResults.sort(function (oFirst, oSecond) {
                                // sort descending by priority
                                return oSecond.priority - oFirst.priority;
                            })[0];

                            var oPackageManager = new Windows.Management.Deployment.PackageManager();

                            debugger;

                            var oExtensionPath = oPrioritizedExtension.extension.package.installedLocation;

                            if (oPrioritizedExtension.shared) {
                                oExtensionPath.getFolderAsync(oPrioritizedExtension.shared)
                                    .then(function onComplete(oSharedFolder) {
                                        return oSharedFolder.getFilesAsync();
                                    }, function onError(oError) {
                                        console.log(oError);
                                    })
                                    .done(function onComplete(oFileList) {
                                        oFileList.forEach(function (oFile) {
                                            console.log(oFile.path);

                                            Windows.Storage.FileIO.readTextAsync(oFile)
                                                .done(function onComplete(sContent) {
                                                    document.getElementById("body").innerHTML += '<p class="win-type-title">' + oFile.path + '</p>';

                                                    document.getElementById("body").innerHTML += '<textarea class="win-textarea">' + sContent + '</textarea>';
                                                });
                                        });
                                    }, function onError(oError) {
                                        console.log(oError);
                                    });
                            }
                        }
                    });
            }, function onError(oError) {
                console.log(oError);
            });
    }

	app.start();

})();
