LegislatorVotesView.prototype = new View();
function LegislatorVotesView() {
    var self=this;
    self.containerDiv = 'legislator_votes_body';
    self.destinationList = document.getElementById('legislator_votes_list');
    self.titleString = 'Recent Votes';
    self.subtitleString = '';
    
    self.voteToText = function(vote_symbol) {
        vote_dict = { '+':'Aye', '-':'Nay', '0':'Did Not Vote', 'P':'Present' }
        return vote_dict[vote_symbol];
    }
    
    self.addToLocal = function(roll, id) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO LegislatorsVotes (bioguide_id, roll_id, voted_at, question, vote, result, aye_votes, nay_votes, not_voting, present_votes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, roll.roll_id, roll.voted_at.replace(' +0000', '').replace(/\//g, '-'), roll.question, roll.voter_ids[id], roll.result, roll.vote_breakdown.ayes, roll.vote_breakdown.nays, roll.vote_breakdown.not_voting, roll.vote_breakdown.present]);
            }
        );        
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_legislator"), localStorage.getItem("current_legislator_chamber"));
    }
    
    self.render = function() {
        self.setTitle(self.titleString);
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setLeftButton('back');
        self.setRightButton('reload');
        this.loadVotes(localStorage.getItem("current_legislator"));
    }
    
    self.loadRoll = function(roll_id) {
        localStorage.setItem("current_roll", roll_id)
        application.viewStack.forwardTo('roll');
    }
    
    self.loadVotes = function(id) {
        self.dbGetLatest(id);
        if (!application.isViewed('legislator_votes_' + id)) {
            self.serverGetLatest(id, localStorage.getItem("current_legislator_chamber"));
        }
    }
    
    self.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', id:row.roll_id, title:row.question, voted_at:row.voted_at, vote:row.vote, result:row.result, aye_votes:row.aye_votes, nay_votes:row.nay_votes});
        }
        return latest_list;
    }
    
    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        self.renderList(resultsList, self.destinationList);
        self.show();
    }

    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT bioguide_id, roll_id, question, datetime(voted_at, 'localtime') AS voted_at, vote, result, aye_votes, nay_votes FROM LegislatorsVotes WHERE bioguide_id = ? ORDER BY voted_at DESC LIMIT 10", [id,], self.dataHandler);
            }
        );
    }
    
    self.renderRow = function(row, dest_list) { 
        var newItem = document.createElement("li");
        
        var result = document.createElement("div");
        result.className = 'result_body';
        
        var footerDiv = document.createElement("div");
        footerDiv.className = 'result_subtitle';
        footerDiv.innerHTML = self.resultsToText(row.result, row.aye_votes, row.nay_votes);

        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_title';
        titleDiv.innerHTML = row.title;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
    		self.loadRoll(row.id);
    	});
    	
        var subTitleDiv = document.createElement("div");
        subTitleDiv.className = 'result_subtitle';
        
        dateDiv = document.createElement("div");
        dateDiv.innerHTML = self.dateFormat(row.voted_at);

        voteDiv = document.createElement("div");
        voteDiv.innerHTML = self.voteToText(row.vote);

        subTitleDiv.appendChild(voteDiv);
        subTitleDiv.appendChild(dateDiv);
        anchor.appendChild(subTitleDiv);
        anchor.appendChild(titleDiv);
        anchor.appendChild(footerDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);

    }
    
    self.resultsToText = function(result, aye_votes, nay_votes) {
        return (result + " (" + aye_votes + "-" + nay_votes + ")");
    }

    self.serverGetLatest = function(id, chamber) {
        self.showProgress();
        //fetch committees from server
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/rolls.json?apikey=" + settings.sunlightServicesKey + "&chamber=" + chamber + "&per_page=" + settings.legislatorVotesPageLength + "&sections=voter_ids." + id + ",basic";
        
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.rolls) {
                    self.addToLocal(data.rolls[i], id);
                }
                application.markViewed('roll_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.dateFormat = function(orig_date) {
        orig_date = orig_date.replace(' +0000', '');
        try {
            return sqlDateToDate(orig_date).format("mmm d, yyyy h:MM TT");
        } catch(e) {
            return orig_date;
        }
    }
}