NewsView.prototype = new View();
function NewsView() {
    this.containerDiv = 'news_body';
    this.titleString = 'News';
    
    this.loadList = function(news_source, title) {
        localStorage.setItem("current_news_source", news_source);
        localStorage.setItem("current_news_title", title);
        application.loadView('news_source');
    }

    this.render = function() {
        this.show();
    }
    
    this.show = function() {
        this.setTitle(this.titleString);
        this.setLeftButton('menu', 'main_menu');
        this.setRightButton();
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide()
    }
}
