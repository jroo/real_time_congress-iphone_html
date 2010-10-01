LegislatorsLocationView.prototype = new LegislatorListView();
function LegislatorsLocationView() {
    var self = this;
    self.containerDiv = 'legislators_location_body';
    self.destinationList = document.getElementById('legislators_location_list');
    self.titleString = 'My Location';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('reload');
        self.loadLegislators();
    }
    
    self.geoFail = function(position) {
        //application.navAlert(e);
    }

    self.gpsGetLatest = function() {
        self.showLocateProgress();
        try {
            navigator.geolocation.getCurrentPosition(self.serverGetLegislators);
        } catch(e) {
            position = {'coords':{'latitude':null, 'longitude':null}};
            self.geoFail(position);
        }
    }

    self.loadLegislators = function() {
        if (!application.isViewed('legislators_location')) {
            self.gpsGetLatest();
        }
        self.show();
    }
    
    self.serverGetLegislators = function(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        self.hideLocateProgress();
        self.showProgress();
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/legislators.allForLatLong.json?latitude=" + lat + "&longitude=" + lon + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
                
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
                    legislatorList.push({row_type:'content', id:row.bioguide_id, title:row.title, firstname:firstname, lastname:row.lastname});
                }
                application.markViewed('legislators_location');
                self.setLatest(lat, lon);
                self.renderList(legislatorList, self.destinationList);
                self.hideProgress();
            },
            error: function(d, msg) {
                alert("fail");
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.reload = function() {
        self.gpsGetLatest();
    }
    
    self.setLatest = function(lat, lon) {
    }
    
}