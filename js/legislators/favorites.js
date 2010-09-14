FavoriteLegislatorsView.prototype = new View();
function FavoriteLegislatorsView() {
    var self = this;
    self.containerDiv = 'legislators_favorites_body';
    self.titleString = 'Favorites';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.show();
    }
}