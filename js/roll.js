RollView.prototype = new View();
function RollView() {
    var self=this;
    self.containerDiv = 'roll_body';
    self.titleString = 'Roll Call';
    
    self.addToLocal = function(roll) {
        /*
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Rolls () VALUES ()", []);
            }
        );
        */      
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
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/roll.json?apikey=" + settings.sunlightServicesKey + "&roll_id=" + roll_id;
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