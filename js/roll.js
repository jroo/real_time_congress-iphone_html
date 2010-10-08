RollView.prototype = new View();
function RollView() {
    var self=this;
    self.containerDiv = 'roll_body';
    self.titleString = 'Roll Call';
    
    self.addToLocal = function(roll) {

    application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Roll (roll_id, result, number, required, session, voted_at, nay_votes, aye_votes, present_votes, not_voting, type, year, last_updated, question, chamber, bill_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [roll.roll_id, roll.result, roll.number, roll.required, roll.session, roll.voted_at, roll.vote_breakdown.nays, roll.vote_breakdown.ayes, roll.vote_breakdown.present, roll.vote_breakdown.not_voting, roll.type, roll.year, roll.last_updated, roll.question, roll.chamber, roll.bill_id]);
            }
        );
    }
        
    self.dbGetLatest = function(roll_id) {
    }

    self.loadRoll = function() {
        roll_id = localStorage.getItem("current_roll");
        self.dbGetLatest(roll_id);
        if (!application.isViewed('roll_' + roll_id)) {
            self.serverGetLatest(id);
        }        
    }

    self.reload = function() {
    }
    
    self.render = function() {
        self.setTitle('Roll Call ' + localStorage.getItem("current_roll"));
        self.setSubtitle('');
        self.setLeftButton('back');
        self.setRightButton('star_off'); 
        self.serverGetLatest(localStorage.getItem("current_roll"));     
    }
    
    self.serverGetLatest = function(roll_id) {
        self.showProgress();
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/roll.json?apikey=" + settings.sunlightServicesKey + "&roll_id=" + roll_id + "&section=basic";
        alert(jsonUrl);
        
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                self.addToLocal(data.roll);
                application.markViewed('roll_' + roll_id);
                self.dbGetLatest(roll_id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }
    
    
}