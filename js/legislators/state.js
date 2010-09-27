LegislatorsStateView.prototype = new LegislatorListView();
function LegislatorsStateView() {
    var self = this;
    self.view_name = 'legislators_state';
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
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_state"));
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
    
}