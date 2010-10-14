LegislationRecentView.prototype = new View();
function LegislationRecentView() {
    var self = this;
    self.containerDiv = 'legislation_recent_body';
    self.currentChamber = 'house';
    self.destinationList = document.getElementById('legislation_recent_list');
    self.titleString = 'Recent';
    
    self.addToLocal = function(bill, chamber) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO LegislationRecent (bill_id, chamber, bill_title, last_action_at) VALUES (?, ?, ?, ?)", [bill.type + '-' + bill.number, bill.chamber, bill.official_title, bill.last_action_at.replace(' +0000', '').replace(/\//g, '-')]);
            }
        );        
    }
    
    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        self.renderList(resultsList, self.destinationList);
        self.show();
    }
    
    self.dateFormat = function(orig_date) {
        orig_date = orig_date.replace(' +0000', '');
        try {
            return sqlDateToDate(orig_date).format("mmmm d, yyyy");
        } catch(e) {
            return orig_date;
        }
    }
    
    self.dbGetLatest = function(chamber) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM LegislationRecent WHERE chamber = ? ORDER BY last_action_at DESC LIMIT 20", [chamber,], self.dataHandler);
            }
        );        
    }
    
    self.loadChamber = function(chamber) {
        chamber = chamber.toLowerCase();
        self.currentChamber = chamber;
        self.dbGetLatest(chamber);
        if (!application.isViewed('legislation_recent')) {
            self.serverGetLatest(chamber);
        }
    }
    
    self.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', bill_id:row.bill_id, title:row.bill_title, last_action_at:row.last_action_at});
        }
        return latest_list;
    }

    self.reload = function() {
        self.serverGetLatest(self.currentChamber);
    }

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        application.initializeChamberSelect();
        self.loadChamber(self.currentChamber);
    }
    
    self.renderRow = function(row, dest_list) { 
        var newItem = document.createElement("li");
        
        var result = document.createElement("div");
        result.className = 'result_body';

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_title';
        titleDiv.innerHTML = row.title;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
    		self.loadRoll(row.id);
    	});
    	
        var subTitleDiv = document.createElement("div");
        subTitleDiv.className = 'result_subtitle';
        subTitleDiv.innerHTML = self.dateFormat(row.last_action_at);

        anchor.appendChild(subTitleDiv);
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }
    
    self.serverGetLatest = function(chamber) {
        self.showProgress();
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/bills.json?order=last_action_at&sort=desc&sections=chamber,last_action_at,type,number,official_title&apikey=" + settings.sunlightServicesKey;
 
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.bills) {
                    self.addToLocal(data.bills[i], chamber);
                }
                application.markViewed('legislation_recent');
                self.dbGetLatest(chamber);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }
}