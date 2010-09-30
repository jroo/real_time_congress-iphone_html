LegislatorsZipView.prototype = new View();
function LegislatorsZipView() {
    var self = this;
    self.containerDiv = 'legislators_zip_body';
    self.searchField = document.getElementById('legislator_zip_field');
    self.titleString = 'ZIP Code';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.bindSearch();
        self.show();
    }
    
    self.bindSearch = function() {
            $('#zip_search').unbind();
            $('#zip_search').submit(self.searchHandler);
            $('#zip_search_button').unbind();
            $('#zip_search_button').click(function() {
            $('#zip_search_button').submit();
        });
    }
    
    self.searchHandler = function() {
        localStorage.setItem("legislator_search_type", "zip");
        localStorage.setItem("legislator_search_term", $('#legislator_zip_field').val());
        application.viewStack.forwardTo('legislator_search_results');
        return false;
    }
}