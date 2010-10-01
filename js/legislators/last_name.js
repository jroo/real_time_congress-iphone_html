LegislatorsLastNameView.prototype = new View();
function LegislatorsLastNameView() {
    var self = this;
    self.containerDiv = 'legislators_last_name_body';
    self.titleString = 'Last Name';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.bindSearch()
        self.show();
    }

    self.bindSearch = function() {
            $('#last_name_search').unbind();
            $('#last_name_search').submit(self.searchHandler);
            $('#last_name_search_button').unbind();
            $('#last_name_search_button').click(function() {
            $('#last_name_search_button').submit();
        });
    }
    
    self.searchHandler = function(event) {
        event.preventDefault();
        document.getElementById('last_name_field').blur();
        localStorage.setItem("legislator_search_type", "last_name");
        localStorage.setItem("legislator_search_term", $('#last_name_field').val());
        application.viewStack.forwardTo('legislator_search_results');
        return false;
    }
}