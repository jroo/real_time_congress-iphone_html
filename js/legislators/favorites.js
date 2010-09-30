FavoriteLegislatorsView.prototype = new LegislatorListView();
function FavoriteLegislatorsView() {
    var self = this;
    self.containerDiv = 'legislators_favorites_body';
    self.destinationList = document.getElementById('legislators_favorites_list');
    self.titleString = 'Favorites';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton();
        self.dbGetLatest();
    }
    
    self.dbGetLatest = function() {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Legislators WHERE is_favorite = 'true' ORDER BY lastname, firstname ASC", [], self.dataHandler);
            }
        );
    }
    
    self.dataHandler = function(transaction, results) {
        resultsList = self.localToList(results);
        if (resultsList.length == 0) {
            self.showEmptyResult('You do not have any favorites marked');
        } else {
            self.hideEmptyResult();
        }
        self.renderList(resultsList, self.destinationList);
        self.show();
    }}