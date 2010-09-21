LegislatorsStatesView.prototype = new View();
function LegislatorsStatesView() {
    var self = this;
    self.containerDiv = 'legislators_states_body';
    self.destinationList = document.getElementById('states_list');
    self.titleString = 'States';
    self.states = [ {"row_type":"content", "abbr":"AL","title":"Alabama"}, {"row_type":"content", "abbr":"AK","title":"Alaska"}, {"row_type":"content", "abbr":"AZ","title":"Arizona"}, {"row_type":"content", "abbr":"AR","title":"Arkansas"}, {"row_type":"content", "abbr":"CA","title":"California"}, {"row_type":"content", "abbr":"CO","title":"Colorado"}, {"row_type":"content", "abbr":"CT","title":"Connecticut"}, {"row_type":"content", "abbr":"DE","title":"Delaware"}, {"row_type":"content", "abbr":"DC","title":"District of Columbia"}, {"row_type":"content", "abbr":"FL","title":"Florida"}, {"row_type":"content", "abbr":"GA","title":"Georgia"}, {"row_type":"content", "abbr":"HI","title":"Hawaii"}, {"row_type":"content", "abbr":"ID","title":"Idaho"}, {"row_type":"content", "abbr":"IL","title":"Illinois"}, {"row_type":"content", "abbr":"IN","title":"Indiana"}, {"row_type":"content", "abbr":"IA","title":"Iowa"}, {"row_type":"content", "abbr":"KS","title":"Kansas"}, {"row_type":"content", "abbr":"KY","title":"Kentucky"}, {"row_type":"content", "abbr":"LA","title":"Louisiana"}, {"row_type":"content", "abbr":"ME","title":"Maine"}, {"row_type":"content", "abbr":"MD","title":"Maryland"}, {"row_type":"content", "abbr":"MA","title":"Massachusetts"}, {"row_type":"content", "abbr":"MI","title":"Michigan"}, {"row_type":"content", "abbr":"MN","title":"Minnesota"}, {"row_type":"content", "abbr":"MS","title":"Mississippi"}, {"row_type":"content", "abbr":"MO","title":"Missouri"}, {"row_type":"content", "abbr":"MT","title":"Montana"}, {"row_type":"content", "abbr":"NE","title":"Nebraska"}, {"row_type":"content", "abbr":"NV","title":"Nevada"}, {"row_type":"content", "abbr":"NH","title":"New Hampshire"}, {"row_type":"content", "abbr":"NJ","title":"New Jersey"}, {"row_type":"content", "abbr":"NM","title":"New Mexico"}, {"row_type":"content", "abbr":"NY","title":"New York"}, {"row_type":"content", "abbr":"NC","title":"North Carolina"}, {"row_type":"content", "abbr":"ND","title":"North Dakota"}, {"row_type":"content", "abbr":"OH","title":"Ohio"}, {"row_type":"content", "abbr":"OK","title":"Oklahoma"}, {"row_type":"content", "abbr":"OR","title":"Oregon"}, {"row_type":"content", "abbr":"PA","title":"Pennsylvania"}, {"row_type":"content", "abbr":"RI","title":"Rhode Island"}, {"row_type":"content", "abbr":"SC","title":"South Carolina"}, {"row_type":"content", "abbr":"SD","title":"South Dakota"}, {"row_type":"content", "abbr":"TN","title":"Tennessee"}, {"row_type":"content", "abbr":"TX","title":"Texas"}, {"row_type":"content", "abbr":"UT","title":"Utah"}, {"row_type":"content", "abbr":"VT","title":"Vermont"}, {"row_type":"content", "abbr":"VA","title":"Virginia"}, {"row_type":"content", "abbr":"WA","title":"Washington"}, {"row_type":"content", "abbr":"WV","title":"West Virginia"}, {"row_type":"content", "abbr":"WI","title":"Wisconsin"}, {"row_type":"content", "abbr":"WY","title":"Wyoming"} ];

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'legislators');
        self.renderList(self.states, self.destinationList);
        self.show();
    }
    
    self.renderRow = function(row, dest_list) {
        var newItem = document.createElement("li");
        var result = document.createElement("div");
        result.className = 'result_body';
        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_body';
        titleDiv.innerHTML = row.title;
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
    		self.loadState(row.abbr, row.title);
    	});
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);
    }
    
    self.loadState = function(id, title) {
        localStorage.setItem("current_state", id);
        localStorage.setItem("current_state_title", title);
        application.loadView('legislators_state');
    }
}