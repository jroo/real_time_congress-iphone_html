LegislatorVotesView.prototype = new View();
function LegislatorVotesView() {
    var self=this;
    self.containerDiv = 'legislator_votes_body';
    self.destinationList = document.getElementById('legislator_votes_list');
    self.titleString = 'Recent Votes';
    self.subtitleString = '';
    
    self.render = function() {
        alert(localStorage.getItem("current_legislator_chamber"));
        self.setTitle(self.titleString);
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setLeftButton('back');
        self.setRightButton('reload');
        this.loadVotes(localStorage.getItem("current_legislator"));
    }
    
    self.loadVotes = function(id) {
        //self.dbGetLatest(id);
        if (!application.isViewed('legislator_votes_' + id)) {
            self.serverGetLatest(id, localStorage.getItem("current_legislator_chamber"));
        }
    }
    
    /*
    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        self.renderList(resultsList, self.destinationList);
        self.show();
    }

    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT Legislators.firstname, Legislators.lastname, Legislators.nickname, Legislators.bioguide_id, Legislators.title FROM CommitteesLegislators, Legislators WHERE CommitteesLegislators.committee_id = ? AND Legislators.bioguide_id = CommitteesLegislators.legislator_id ORDER BY lastname ASC", [id,], self.dataHandler);
            }
        );
    }
    */

    self.serverGetLatest = function(id, chamber) {
        self.showProgress();
        //fetch committees from server
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/rolls.json?apikey=" + settings.sunlightServicesKey + "&chamber=" + chamber + "&per_page=" + settings.legislatorVotesPageLength + "&sections=voter_ids." + id + ",basic";
        alert(jsonUrl);
        
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                self.addListToLocal(data, id);
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
}