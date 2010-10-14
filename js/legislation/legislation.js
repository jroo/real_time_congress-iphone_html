LegislationView.prototype = new View();
function LegislationView() {
    var self = this;
    self.containerDiv = 'legislation_body';
    self.titleString = 'Legislation';
    self.subtitleString = '';

    self.render = function() {
        self.setSubtitle(self.subtitleString);
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.show();
    }
}