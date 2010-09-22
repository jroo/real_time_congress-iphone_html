LegislatorsStateView.prototype = new View();
function LegislatorsStateView() {
    var self = this;
    self.containerDiv = 'legislators_state_body';
    self.destinationList = document.getElementById('state_list');
    self.titleString = 'Legislators';
    self.subtitleString = 'State';
    self.currentState = null;

    self.render = function() {
        self.setTitle(self.titleString);
        self.setSubtitle(localStorage.getItem("current_state_title"));
        self.setLeftButton('back', 'legislators_states');
        self.setRightButton('reload');
        self.loadThisState(localStorage.getItem("current_state"));
    }
    
    self.loadThisState = function(state) {
        self.dbGetLatest(state);
        if (!application.isViewed('state_' + state)) {
            self.serverGetLatest(state);
        }
    }
    
    self.dbGetLatest = function(state) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Legislators WHERE state = ? ORDER BY lastname, firstname ASC", [state,], self.dataHandler);
            }
        );
    }
    
    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);

        if (application.isViewed('state_' + self.currentState) && resultsList.length == 0) {
            self.showEmptyResult('Empty Legislator List');
        } else {
            self.hideEmptyResult();
        }
        self.renderList(resultsList, self.destinationList);
        self.show();
    }
    
    self.addToLocal = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Legislators (bioguide_id, is_favorite, website, firstname, lastname, congress_office, phone, webform, youtube_url, nickname, congresspedia_url, district, title, in_office, senate_class, name_suffix, twitter_id, birthdate, fec_id, state, crp_id, official_rss, gender, party, email, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.is_favorite, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
    
    self.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            (row.nickname == '') ? firstname=row.firstname : firstname=row.nickname;
            latest_list.push({row_type:'content', id:row.id, firstname:firstname, lastname:row.lastname});
        }
        return latest_list;
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_state"));
    }
    
    self.renderRow = function(row, dest_list) {
        var newItem = document.createElement("li");
        var result = document.createElement("div");
        
        result.className = 'result_body';
        
        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_body';
        titleDiv.innerHTML = row.lastname + ", " + row.firstname;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
            //
    	});
    	
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);
    }
    
    self.serverGetLatest = function(state) {
        self.showProgress();
        //fetch committees from server
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/legislators.getList.json?state=" + state + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.response.legislators) {
                    self.updateLegislator(data.response.legislators[i].legislator);
                    self.addToLocal(data.response.legislators[i].legislator);
                }
                application.markViewed('state_' + state);
                self.dbGetLatest(state);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.updateLegislator = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("UPDATE Legislators SET bioguide_id=?, website=?, firstname=?, lastname=?, congress_office=?, phone=?, webform=?, youtube_url=?, nickname=?, congresspedia_url=?, district=?, title=?, in_office=?, senate_class=?, name_suffix=?, twitter_id=?, birthdate=?, fec_id=?, state=?, crp_id=?, official_rss=?, gender=?, party=?, email=?, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
}