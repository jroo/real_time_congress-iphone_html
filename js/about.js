AboutView.prototype = new View();
function AboutView() {
    this.containerDiv = 'about_body';
    this.titleString = 'About';

    this.render = function() {
        $("#title").html(application.title);
        $("#version").html("v" + application.version);
        $("#copyright").html(application.copyright);
        $("#url").html(application.url);
        $("#url").attr("href", application.url);
        this.show();
    }
    
    this.show = function() {
        this.setTitle(this.titleString);
        this.setLeftButton('menu', 'main_menu');
        this.setRightButton();
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
}
