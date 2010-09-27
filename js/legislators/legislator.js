LegislatorView.prototype = new View();
function LegislatorView() {
    var self = this;
    self.containerDiv = 'legislator_body';
    self.titleString = 'Legislator';
    self.subtitleString = '';
    
    self.dataHandler = function(transaction, results) {
        alert(results.rows.item(i).bioguide_id);
    }
    
    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Legislators WHERE bioguide_id = ?", [id,], self.dataHandler);
            }
        );
    }

    self.render = function(previous_view) {
        alert(previous_view);
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setTitle(self.titleString);
        self.setLeftButton('back', previous_view);
        self.loadThisLegislator(localStorage.getItem("current_legislator"));
    }
    
    self.loadThisLegislator = function(id) {
        self.dbGetLatest(id);
        /*if (!application.isViewed('legislator_' + id)) {
            self.serverGetLatest(id);
        }*/
    }
}