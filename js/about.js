AboutView.prototype = new View();
function AboutView() {
    var self = this;
    self.containerDiv = 'about_body';
    self.titleString = 'About';

    self.render = function() {
        $("#title").html(application.title);
        $("#version").html("v" + application.version);
        $("#copyright").html(application.copyright);
        $("#url").html(application.url);
        $("#url").attr("href", application.url);
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'main_menu');
        self.setRightButton();
        self.show();
    }
}