LegislatorsView.prototype = new View();
function LegislatorsView() {
    var self = this;
    self.containerDiv = 'legislators_body';
    self.titleString = 'Legislators';
    self.subtitleString = '';

    self.render = function() {
        self.setSubtitle(self.subtitleString);
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'main_menu');
        self.show();
    }
}