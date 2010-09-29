function ViewStack() {
    var self=this;
    self.views = new Array();

    self.push = function(view_name) {
        return(self.views.push(view_name));
    }
    
    self.pop = function() {
        return(self.views.pop());
    }
    
    self.peek = function() {
        return(self.views[self.views.length-1]);
    }

    self.forwardTo = function(view_name) {
    	self.push(view_name);
    	application.loadView(view_name);
    }

    self.backTo = function() {
    	target_view = self.previousView();
    	self.pop();
    	application.loadView(target_view);	
    }
    
    self.previousView = function() {
        return(self.views[self.views.length-2]);
    }
}