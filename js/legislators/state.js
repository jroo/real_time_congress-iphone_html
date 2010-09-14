LegislatorsStateView.prototype = new View();
function LegislatorsStateView() {
    var self = this;
    self.containerDiv = 'legislators_state_body';
    self.titleString = 'State';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.show();
    }
}