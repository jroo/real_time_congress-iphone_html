NewsView.prototype = new View();
function NewsView() {
    var self = this;
    self.containerDiv = 'news_body';
    self.titleString = 'News';
    
    self.loadList = function(news_source, title) {
        localStorage.setItem("current_news_source", news_source);
        localStorage.setItem("current_news_title", title);
        application.loadView('news_source');
    }

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('menu', 'main_menu');
        self.setRightButton();
        self.show();
    }
}
