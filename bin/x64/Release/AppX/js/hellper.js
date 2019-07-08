(function () {
    "use strict";

    function eventLogConstructor() {
    }

    var eventLogInstanceMembers = {
    };

    var eventLogStaticMembers = {
        entries: new WinJS.Binding.List(),
        writeEntry: function (sMessage) {
            this.entries.push({
                timeCreated: this.getTimestamp(),
                data: sMessage
            });
        },
        getTimestamp: function () {
            var formatTemplate = "{day.integer(2)}/{month.integer(2)}/{year.full} {hour.integer(2)}:{minute.integer(2)}:{second.integer(2)}";

            var dateTimeFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(formatTemplate);

            return dateTimeFormatter.format(new Date());
        },
        hightlight: WinJS.Utilities.markSupportedForProcessing(function (eventInfo) {
            var iIndex = eventInfo.detail.itemIndex;

            //var oElement = document.getElementById("eventLogListView").winControl.elementFromIndex(iIndex);
        })
    };

    var EventLog = WinJS.Class.define(eventLogConstructor, eventLogInstanceMembers, eventLogStaticMembers);

    WinJS.Namespace.define("Hellper", {
        EventLog: EventLog
    });

})();