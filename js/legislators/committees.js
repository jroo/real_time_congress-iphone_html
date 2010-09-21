LegislatorsCommitteesView.prototype = new View();
function LegislatorsCommitteesView() {
    var self = this;
    self.containerDiv = 'legislators_committees_body';
    self.currentChamber = 'House';
    self.destinationList = document.getElementById('committees_list');
    self.titleString = 'Committees';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.setRightButton('reload');
        //application.initializeTriChamberSelect();
        self.loadChamber(self.currentChamber);
    }
    
    self.loadChamber = function(chamber) {
        self.currentChamber = chamber;
        self.setTitle("Committees");
        self.dbGetLatest(chamber);
        if (!application.isViewed('legislators_committees_' + chamber)) {
            self.serverGetLatest(chamber);
        }
    }

    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        if (application.isViewed('legislators_committees_' + self.currentChamber) && resultsList.length == 0) {
            self.showEmptyResult('No Committees');
        } else {
            self.hideEmptyResult();
        }
        self.renderList(resultsList, self.destinationList);
        self.show();
    }

    self.dbGetLatest = function(chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Committees WHERE chamber = ? AND parent == 'undefined' ORDER BY name ASC", [chamber,], self.dataHandler);
            }
        );
    }

    self.reload = function() {
        self.serverGetLatest(self.currentChamber);
    }

    self.localToList = function(results) {
        latest_list = [];
        last_date = null;
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', id:row.id, name:row.name});
        }
        return latest_list;
    }

    self.serverGetLatest = function(chamber) {
        self.showProgress();
        //fetch committees from server
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/committees.getList.json?chamber=" + chamber + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.response.committees) {
                    self.addToLocal(data.response.committees[i]);
                }
                application.markViewed('legislators_committees_' + chamber);
                self.dbGetLatest(chamber);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }

    self.addToLocal = function(row) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO Committees (id, name, chamber, parent) VALUES (?, ?, ?, ?)", [row.committee.id, row.committee.name, row.committee.chamber, row.committee.parent]);
            }
        );
    }
    
    self.loadCommittee = function(id, name) {
        localStorage.setItem("current_committee", id);
        localStorage.setItem("current_committee_title", name);
        application.loadView('committee');
    }

    self.renderRow = function(row, dest_list) {

        var newItem = document.createElement("li");
        
        var result = document.createElement("div");
        result.className = 'result_body';

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_body';
        titleDiv.innerHTML = row.name;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
    		self.loadCommittee(row.id, row.name);
    	});

        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }

    self.hearingFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("h:MM TT");
        } catch(e) {
            return orig_date;
        }
    }
}
