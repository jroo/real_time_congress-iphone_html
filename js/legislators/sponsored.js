LegislatorSponsorshipsView.prototype = new View();
function LegislatorSponsorshipsView() {
    var self=this;
    self.containerDiv = 'legislator_sponsorships_body';
    self.destinationList = document.getElementById('legislator_sponsorships_list');
    self.titleString = 'Sponsorships';
    self.subtitleString = '';
    
    self.render = function() {
        self.setTitle(self.titleString);
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setLeftButton('back');
        self.setRightButton('reload');
        this.loadSponsorships(localStorage.getItem("current_legislator"));
    }
    
    self.addToLocal = function(bill, id) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO LegislatorsSponsorships (bioguide_id, bill_id, bill_title, introduced_at) VALUES (?, ?, ?, ?)", [id, bill.type + '-' + bill.number, bill.official_title, bill.introduced_at.replace(' +0000', '').replace(/\//g, '-')]);
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
    
    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM LegislatorsSponsorships WHERE bioguide_id = ? ORDER BY introduced_at DESC LIMIT 10", [id,], self.dataHandler);
            }
        );
    }    
    
    self.loadSponsorships = function(id) {
        self.dbGetLatest(id);
        if (!application.isViewed('legislator_sponsorships_' + id)) {
            self.serverGetLatest(id);
        }
    }

    self.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', bioguide_id:row.bioguide_id, bill_id:row.bill_id, title:row.bill_title, introduced_at:row.introduced_at});
        }
        return latest_list;
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
        subTitleDiv.innerHTML = 'Introduced ' + self.dateFormat(row.introduced_at);

        anchor.appendChild(subTitleDiv);
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }

    self.serverGetLatest = function(id) {
        self.showProgress();
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/bills.json?sponsor_id=" + id + "&sections=introduced_at,type,number,official_title&apikey=" + settings.sunlightServicesKey;
 
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.bills) {
                    self.addToLocal(data.bills[i], id);
                }
                application.markViewed('sponsorships_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }

}