LegislatorSearchResultsView.prototype = new LegislatorListView();
function LegislatorSearchResultsView() {
    var self = this;
    self.containerDiv = 'legislator_search_results_body';
    self.destinationList = document.getElementById('legislator_search_results_list');
    self.titleString = 'Legislators';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        self.loadLegislators(localStorage.getItem("legislator_search_type"), localStorage.getItem("legislator_search_term"));
    }
    
    self.loadLegislators = function(type, term) {
        if (!application.isViewed('legislators_search_' + type + '_' + term)) {
            self.serverGetLegislators(type, term)
        }
        self.show();
    }
    
    self.serverGetLegislators = function(type, term) {
        self.showProgress();
        
        if (type == 'zip') {
            filename = 'legislators.allForZip.json';
            args = "zip=" + term;
        } else if (type == 'last_name') {
            filename = 'legislators.getList.json';
            args = "lastname=" + term;
        }
        
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/" + filename + "?" + args + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
                
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                legislatorList = [];
                for (i in data.response.legislators) {
                    row = data.response.legislators[i].legislator;
                    self.updateLegislator(row);
                    self.addToLocal(row);
                    (row.nickname == '') ? firstname=row.firstname : firstname=row.nickname;
                    legislatorList.push({row_type:'content', id:row.bioguide_id, title:row.title, firstname:firstname, lastname:row.lastname, state:row.state, district:row.district});
                }
                self.renderList(legislatorList, self.destinationList);
                application.markViewed('legislators_search_' + type + '_' + term)
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.reload = function() {
        self.serverGetLegislators(localStorage.getItem("legislator_search_type"), localStorage.getItem("legislator_search_term"));
    }
    
}