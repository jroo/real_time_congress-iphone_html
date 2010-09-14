LegislatorsLocationView.prototype = new View();
function LegislatorsLocationView() {
    var self = this;
    self.containerDiv = 'legislators_location_body';
    self.titleString = 'My Location';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.show();
    }
}