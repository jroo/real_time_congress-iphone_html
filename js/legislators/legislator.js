LegislatorView.prototype = new View();
function LegislatorView() {
    var self = this;
    self.containerDiv = 'legislator_body';
    self.titleString = 'Legislator';
    self.subtitleString = '';

    self.render = function(previous_view) {
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setTitle(self.titleString);
        self.setLeftButton('back', previous_view);
        self.show();
    }
}