LegislatorsView.prototype = new View();
function LegislatorsView() {
    var self = this;
    self.containerDiv = 'legislators_body';
    self.titleString = 'Legislators';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'main_menu');
        self.setRightButton('reload');
        self.show();
    }
     
}