DocumentsView.prototype = new View();
function DocumentsView() {
    var self = this;
    self.containerDiv = 'documents_body';
    self.titleString = 'Documents';
    
    self.loadList = function(view_name, view_title) {
        localStorage.setItem("current_doc_list", view_name);
        localStorage.setItem("current_doc_title", view_title);
        application.loadView('doc_list');
    }

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'main_menu');
        self.setRightButton();
        self.show();
    }
}