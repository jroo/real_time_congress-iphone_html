CommitteeView.prototype = new View();
function CommitteeView() {
    var self = this;
    self.containerDiv = 'committee_body';
    self.destinationList = document.getElementById('subcommittees_list');
    self.titleString = 'Committee';

    self.render = function() {
        self.setTitle(localStorage.getItem("current_committee_title"));
        self.setLeftButton('back', 'legislators_committees');
        self.setRightButton('reload');
        self.loadSubcommittees(localStorage.getItem("current_committee"));
    }
    
    self.loadSubcommittees = function(id) {
        self.dbGetLatest(id);
        if (!application.isViewed('committee_' + id)) {
            self.serverGetLatest(id);
        }
    }

    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        if (application.isViewed('committee_' + localStorage.getItem("current_committee")) && resultsList.length == 0) {
            self.showEmptyResult('No Subcommittees');
        } else {
            self.hideEmptyResult();
        }
        self.renderList(resultsList, self.destinationList);
        self.show();
    }

    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Committees WHERE parent = ? ORDER BY name ASC", [id,], self.dataHandler);
            }
        );
    }

    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_committee"));
    }

    self.localToList = function(results) {
        latest_list = [];
        last_date = null;
        latest_list.push({row_type:'content', id:localStorage.getItem("current_committee"), name:'Full Committee'});
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', id:row.id, name:row.name});
        }
        return latest_list;
    }

    self.serverGetLatest = function(id) {
        self.showProgress();
        //fetch committees from server
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/committees.get.json?id=" + id + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.response.committee.subcommittees) {
                    self.addToLocal(data.response.committee.subcommittees[i], id);
                }
                application.markViewed('committee_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }

    self.addToLocal = function(row, id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO Committees (id, name, chamber, parent) VALUES (?, ?, ?, ?)", [row.committee.id, row.committee.name, row.committee.chamber, id]);
            }
        );
    }
    
    self.loadSubcommittee = function(id, name) {
        localStorage.setItem("current_subcommittee", id);
        localStorage.setItem("current_subcommittee_title", name);
        application.loadView('subcommittee');
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
    		self.loadSubcommittee(row.id, row.name);
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