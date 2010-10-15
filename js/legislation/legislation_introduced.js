LegislationIntroducedView.prototype = new View();
function LegislationIntroducedView() {
    var self = this;
    self.containerDiv = 'legislation_introduced_body';
    self.currentChamber = 'house';
    self.destinationList = document.getElementById('legislation_introduced_list');
    self.titleString = 'Introduced';
    
    self.addToLocal = function(bill, chamber) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO LegislationIntroduced (bill_id, chamber, bill_title, introduced_at) VALUES (?, ?, ?, ?)", [bill.bill_id, bill.chamber, bill.official_title, bill.introduced_at.replace(' +0000', '').replace(/\//g, '-')]);
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
               transaction.executeSql("SELECT * FROM LegislationIntroduced WHERE chamber = ? ORDER BY introduced_at DESC LIMIT 20", [chamber,], self.dataHandler);
            }
        );        
    }
    
    self.loadChamber = function(chamber) {
        chamber = chamber.toLowerCase();
        self.currentChamber = chamber;
        self.dbGetLatest(chamber);
        if (!application.isViewed('legislation_introduced')) {
            self.serverGetLatest(chamber);
        }
    }
    
    self.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', bill_id:row.bill_id, title:row.bill_title, introduced_at:row.introduced_at});
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
        alert(row.bill_id);
        var newItem = document.createElement("li");
        
        var result = document.createElement("div");
        result.className = 'result_body';

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_title';
        titleDiv.innerHTML = row.title;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
    		self.loadBill(row.bill_id);
    	});
    	
        var subTitleDiv = document.createElement("div");
        subTitleDiv.className = 'result_subtitle';
        subTitleDiv.innerHTML = self.dateFormat(row.introduced_at);

        anchor.appendChild(subTitleDiv);
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }
    
    self.serverGetLatest = function(chamber) {
        self.showProgress();
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/bills.json?order=last_action_at&sort=desc&sections=chamber,introduced_at,type,number,official_title&apikey=" + settings.sunlightServicesKey;
 
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.bills) {
                    self.addToLocal(data.bills[i], chamber);
                }
                application.markViewed('legislation_introduced');
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