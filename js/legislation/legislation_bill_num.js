LegislationBillNumView.prototype = new View();
function LegislationBillNumView() {
    var self = this;
    self.containerDiv = 'legislation_recent_body';
    self.destinationList = document.getElementById('legislation_bill_num_list');
    self.titleString = 'Bill Number';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        self.show()
    }
}