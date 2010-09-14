LegislatorsCommitteesView.prototype = new View();
function LegislatorsCommitteesView() {
    var self = this;
    self.containerDiv = 'legislators_committees_body';
    self.titleString = 'Committees';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.show();
    }
}