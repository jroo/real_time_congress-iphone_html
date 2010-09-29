LegislatorsLastNameView.prototype = new View();
function LegislatorsLastNameView() {
    var self = this;
    self.containerDiv = 'legislators_last_name_body';
    self.titleString = 'Last Name';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.show();
    }
}