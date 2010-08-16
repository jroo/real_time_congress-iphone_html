MainMenuView.prototype = new View();

function MainMenuView() {
    this.containerDiv = 'main_menu_body';
    this.titleString = 'Menu';

    this.render = function() {
        this.show();
    }
    
    this.show = function() {
        this.setTitle(this.titleString);
        this.setLeftButton();
        this.setRightButton();
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
}
