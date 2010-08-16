HearingsView.prototype = new View();
function HearingsView() {
    var self = this;
    this.containerDiv = 'hearings_body';
    this.currentChamber = 'Senate';
    this.destinationList = document.getElementById('hearing_list');
    this.titleString = 'Hearings';

    this.render = function() {
        application.initializeChamberSelect();
        this.loadChamber(this.currentChamber);
        this.show();
    }
    
    this.loadChamber = function(chamber) {
        this.currentChamber = chamber;
        this.setTitle(chamber + " Hearings");
        this.dbGetLatest(chamber);
        if (!application.isViewed('hearings_' + chamber)) {
            this.serverGetLatest(chamber);
        }
    }

    this.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
    }

    this.dbGetLatest = function(chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Hearings WHERE chamber = ? AND date > date('now') ORDER BY Date ASC LIMIT 30", [chamber,], self.dataHandler);
            }
        );
    }

    this.reload = function() {
        self.serverGetLatest(self.currentChamber);
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
            latest_list.push({row_type:'content', meeting_date:row.date,
                committee:row.committee,
                description:row.matter,
                room:row.room});
        }
        return latest_list;
    }

    this.serverGetLatest = function(chamber) {
        self.showProgress();

        //fetch hearing schedules from server
        jsonUrl = "http://" + application.rtcDomain + "/hearings_upcoming.json?chamber=" + chamber;
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data) {
                    self.addToLocal(data[i], chamber);
                }
                application.markViewed('hearings_' + chamber);
                self.dbGetLatest(chamber);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }

    this.addToLocal = function(row, chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO Hearings (id, date, chamber, committee, committee_code, matter, room) VALUES (?, ?, ?, ?, ?, ?, ?)", [row.id, row.meeting_date, chamber, row.committee, row.committee_code, row.matter, row.room]);
            }
        );
    }

    this.renderRow = function(row, dest_list) {
        room_txt = '';
        if (row.room !='None') {
            room_txt = " (" + row.room + ")";
        }

        var newItem = document.createElement("li");

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_title';
        titleDiv.innerHTML = row.committee;

        var subDiv = document.createElement("div");
        subDiv.className = 'result_subtitle';
        subDiv.innerHTML = self.hearingFormat(row.meeting_date) + room_txt;

        var descDiv = document.createElement("div");
        descDiv.className = 'result_description';
        descDiv.innerHTML = row.description;

        newItem.appendChild(titleDiv);
        newItem.appendChild(subDiv);
        newItem.appendChild(descDiv);
        dest_list.appendChild(newItem);

    }

    this.hearingFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("h:MM TT");
        } catch(e) {
            return orig_date;
        }
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
}
