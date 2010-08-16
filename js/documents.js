DocumentsView.prototype = new View();
function DocumentsView() {
    this.containerDiv = 'documents_body';
    this.titleString = 'Documents';
    
    this.loadList = function(view_name, view_title) {
        localStorage.setItem("current_doc_list", view_name);
        localStorage.setItem("current_doc_title", view_title);
        application.loadView('doc_list');
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
        $('#'+this.containerDiv).hide();
    }
}