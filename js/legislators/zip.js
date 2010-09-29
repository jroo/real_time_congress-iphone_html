LegislatorsZipView.prototype = new View();
function LegislatorsZipView() {
    var self = this;
    self.containerDiv = 'legislators_zip_body';
    self.titleString = 'ZIP Code';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.show();
    }
}