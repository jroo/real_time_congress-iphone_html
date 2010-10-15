LegislationBillNumView.prototype = new View();
function LegislationBillNumView() {
    var self = this;
    self.containerDiv = 'legislation_bill_num_body';
    self.searchField = document.getElementById('legislation_bill_num_field');
    self.titleString = 'Bill Number';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.bindSearch();
        self.show();
    }
    
    self.bindSearch = function() {
            $('#bill_num_search').unbind();
            $('#bill_num_search').submit(self.searchHandler);
            $('#bill_num_search_button').unbind();
            $('#bill_num_search_button').click(function() {
            $('#bill_num_search_button').submit();
        });
    }
    
    self.searchHandler = function() {
        event.preventDefault();
        document.getElementById('bill_num_field').blur();
        localStorage.setItem("bill_num_search_type", "bill_num");
        localStorage.setItem("bill_num_search_term", $('#bill_num_field').val());
        bill_id = $('#bill_num_field').val().replace('.', '').replace(' ', '') + '-' + $('#bill_num_congress_field').val();
        alert(bill_id);
        return false;
    }
}