SubcommitteeView.prototype = new View();
function SubcommitteeView() {
    var self = this;
    self.containerDiv = 'subcommittee_body';
    self.destinationList = document.getElementById('subcommittee_list');
    self.titleString = 'Legislators';
    self.subtitleString = 'Subcommittee';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setSubtitle(localStorage.getItem("current_subcommittee_title"));
        self.setLeftButton('back');
        self.setRightButton('reload');
        this.load(localStorage.getItem("current_subcommittee"));
    }
    
    self.load = function(id) {
        self.dbGetLatest(id);
        if (!application.isViewed('subcommittee_' + id)) {
            self.serverGetLatest(id);
        }
    }

    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        self.renderList(resultsList, self.destinationList);
        self.show();
    }

    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT Legislators.firstname, Legislators.lastname, Legislators.nickname, Legislators.bioguide_id FROM CommitteesLegislators, Legislators WHERE CommitteesLegislators.committee_id = ? AND Legislators.bioguide_id = CommitteesLegislators.legislator_id ORDER BY lastname ASC", [id,], self.dataHandler);
            }
        );
    }

    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_subcommittee"));
    }

    self.localToList = function(results) {
        latest_list = [];
        last_date = null;
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            (row.nickname == '') ? firstname=row.firstname : firstname=row.nickname;
            latest_list.push({row_type:'content', title:row.lastname + ', ' + firstname});
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
                self.addListToLocal(data.response.committee.members, id);
                application.markViewed('subcommittee_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.addListToLocal = function(data, id) {
        for (i in data) {
            row = data[i].legislator;
            application.localDb.transaction(
                function(transaction) {
                    transaction.executeSql("DELETE FROM CommitteesLegislators WHERE committee_id = ?", [id,]); 
                    transaction.executeSql("INSERT INTO Legislators (bioguide_id, is_favorite, website, firstname, lastname, congress_office, phone, webform, youtube_url, nickname, congresspedia_url, district, title, in_office, senate_class, name_suffix, twitter_id, birthdate, fec_id, state, crp_id, official_rss, gender, party, email, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.is_favorite, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
                    transaction.executeSql("INSERT INTO CommitteesLegislators (committee_id, legislator_id) VALUES (?, ?)", [id, row.bioguide_id]); 
                }
            );  
        }
    }  

    self.renderRow = function(row, dest_list) {

        var newItem = document.createElement("li");
        
        var result = document.createElement("div");
        result.className = 'result_body';

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_body';
        titleDiv.innerHTML = row.title;

    	$(titleDiv).click(function() {
    		//this.loadSubcommittee(row.id, row.title);
    	});

        result.appendChild(titleDiv);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }
}