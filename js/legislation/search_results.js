LegislationSearchResultsView.prototype = new View();
function LegislationSearchResultsView() {
    var self = this;
    self.containerDiv = 'legislation_search_results_body';
    self.destinationList = document.getElementById('legislation_search_results_list');
    self.titleString = 'Legislation';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        self.loadLegislation(localStorage.getItem("bill_num_search_type"), localStorage.getItem("legislation_search_term"));
    }
    
    self.loadLegislation = function(type, term) {
        if (!application.isViewed('bill_num_search_' + type + '_' + term)) {
            self.serverGetLegislation(type, term)
        }
        self.show();
    }
    
    self.serverGetLegislation = function(type, term) {
        self.showProgress();
        
        if (type == 'bill_num') {
            filename = 'bill.json';
            args = "bill_id=" + term;
        }
        
        jsonUrl = "http://" + application.drumboneDomain + "/v1/api/" + filename + "?" + args + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        alert(jsonUrl);
                
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                legislatorList = [];
                for (i in data.response.legislation) {
                    row = data.response.legislation[i].legislator;
                    self.updateLegislation(row);
                    self.addToLocal(row);
                    (row.nickname == '') ? firstname=row.firstname : firstname=row.nickname;
                    legislatorList.push({row_type:'content', id:row.bioguide_id, title:row.title, firstname:firstname, lastname:row.lastname, state:row.state, district:row.district});
                }
                self.renderList(legislatorList, self.destinationList);
                application.markViewed('legislation_search_' + type + '_' + term)
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.reload = function() {
        self.serverGetLegislation(localStorage.getItem("legislation_search_type"), localStorage.getItem("legislation_search_term"));
    }
    
}