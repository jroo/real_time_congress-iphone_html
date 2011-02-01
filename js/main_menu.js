MainMenuView.prototype = new View();

function MainMenuView() {
    var self = this;
    self.containerDiv = 'main_menu_body';
    self.titleString = 'Menu';

    self.render = function() {
		self.viewName = "main_menu";
        self.setTitle(self.titleString);
        self.setLeftButton();
        self.setRightButton();
        self.show();
    }
}
