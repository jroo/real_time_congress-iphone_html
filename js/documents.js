DocumentsView.prototype = new View();
function DocumentsView() {
    var self = this;
    self.containerDiv = 'documents_body';
    self.titleString = 'Documents';
    
    self.loadList = function(view_name, view_title) {
        localStorage.setItem("current_doc_list", view_name);
        localStorage.setItem("current_doc_title", view_title);
        application.viewStack.forwardTo('doc_list');
    }

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton();
        self.show();
    }
}