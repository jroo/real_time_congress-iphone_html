FloorUpdatesView.prototype = new View();
function FloorUpdatesView() {
    var self = this;
    this.containerDiv = 'floor_updates_body';
    this.currentChamber = 'House';
    this.titleString = 'Floor Updates';
    this.destinationList = document.getElementById('update_list'); 

    this.loadChamber = function(chamber) {
        this.currentChamber = chamber;
        this.setTitle(chamber + " Floor");
        this.dbGetLatest(chamber);
        if (!application.isViewed('floor_' + chamber)) {
            this.serverGetLatest(chamber);
        }
    }

    this.render = function() {
        application.initializeChamberSelect();
        this.loadChamber(this.currentChamber);
        this.show();
    }
    
    this.reload = function() {
        self.serverGetLatest(self.currentChamber);
    }
    
    this.show = function() {
        this.setTitle(this.titleString);
        this.setLeftButton('menu', 'main_menu');
        this.setRightButton('reload');
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
    
    this.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
    }

    this.dbGetLatest = function(chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM FloorUpdates WHERE chamber = ? ORDER BY Date DESC LIMIT 20", [chamber,], self.dataHandler);
            }
        );
    }

    this.localToList = function(results) {
        latest_list = [];
        last_date = null;
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            this_date = sqlDateToDate(row.date).format("mm/dd/yyyy")
            if (this_date != last_date) {
                friendly_date = sqlDateToDate(row.date).format("dddd, mmmm d")
                latest_list.push({row_type:'header', title:friendly_date, subtitle:'subby'});
                last_date = this_date;
            }
            latest_list.push({row_type:'content', event_date:row.date, description:row.description});        
        }
        return latest_list;
    }

    this.serverGetLatest = function (chamber) {
        self.showProgress();
        //fetch floor updates from server
        jsonUrl = "http://" + application.rtcDomain + "/floor_recent.json?chamber=" + chamber;
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data) {
                    self.addToLocal(data[i], chamber);
                }
                application.markViewed('floor_' + chamber);
                self.dbGetLatest(chamber);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
                break;
            },
        });
    }

    this.addToLocal = function(row, chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO FloorUpdates (id,date,description,chamber) VALUES (?,?,?,?)", [row.id, row.event_date, row.description, chamber]);
            }
        );
    }

    this.renderRow = function (row, dest_list) {
        var newItem = document.createElement("li");

        var descSpan = document.createElement("span");
        descSpan.innerHTML = row.description + ' ';

        var timeSpan = document.createElement("span");
        timeSpan.innerHTML = this.floorFormat(row.event_date);
        timeSpan.className = 'time_span';

        newItem.appendChild(descSpan);
        newItem.appendChild(timeSpan);
        dest_list.appendChild(newItem);
    }

    this.floorFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("h:MM TT");
        } catch(e) {
            return orig_date;
        }
    }
}