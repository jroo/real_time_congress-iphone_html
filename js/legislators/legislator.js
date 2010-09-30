LegislatorView.prototype = new View();
function LegislatorView() {
    var self = this;
    self.currentLegislator = null;
    self.containerDiv = 'legislator_body';
    self.titleString = 'Legislators';
    self.subtitleString = '';
    
    self.partyToName = function(party) {
        lookup = {'R':'Republican', 'D':'Democrat', 'I':'Independent'};
        return lookup[party];
    }
    
    self.cleanAddress = function(address) {
        return(address.replace('House Office Building', 'H.O.B.').replace('Senate Office Building', 'S.O.B.'));
    }
    
    self.addToLocal = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Legislators (bioguide_id, is_favorite, website, firstname, lastname, congress_office, phone, webform, youtube_url, nickname, congresspedia_url, district, title, in_office, senate_class, name_suffix, twitter_id, birthdate, fec_id, state, crp_id, official_rss, gender, party, email, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.is_favorite, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
    
    self.callOffice = function() {
        cleanNum = self.currentLegislator.phone.replace(/-/g, '');
        document.location.href = 'tel:' + cleanNum;
    }
    
    self.dataHandler = function(transaction, results) {
        legislator = results.rows.item(0);
        self.currentLegislator = legislator;
        self.renderLegislator(legislator);
        self.show();
    }
    
    self.districtName = function(district) {
        if (district == '0') {
            district = 'At-Large';
        }
        return district
    }
    
    self.loadVotes = function() {
        application.viewStack.forwardTo('legislator_votes');
    }
    
    self.viewSite = function() {
        document.location.href = self.currentLegislator.website;
    }
    
    self.loadSponsored = function() {
        application.viewStack.forwardTo('legislator_sponsored');
    }
    
    self.renderLegislator = function(legislator) {
        
        //legislator_info
        $('#legislator_photo').attr("src", './images/legislators/' + legislator.bioguide_id + '.jpg');
        $('#legislator_party').html(self.partyToName(legislator.party));
        $('#legislator_state').html(legislator.state);
        $('#legislator_district').html(self.districtName(legislator.district));
        $('#legislator_office').html(self.cleanAddress(legislator.congress_office));        
        $('#legislator_site').html('<a href="' + legislator.website + '">website</a>');
        
        //legislator_
        self.renderStar();
    }
    
    self.dbGetLatest = function(id) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM Legislators WHERE bioguide_id = ?", [id,], self.dataHandler);
            }
        );
    }

    self.render = function(previous_view) {
        self.setSubtitle(localStorage.getItem("current_legislator_title"));
        self.setTitle(self.titleString);
        self.setLeftButton('back');
        self.setRightButton('star_off');
        self.loadThisLegislator(localStorage.getItem("current_legislator"));
    }
    
    self.renderStar = function() {
        if (self.currentLegislator.is_favorite == 'true') {
            button_type = 'star_on';
        } else {
            button_type = 'star_off';
        }
        self.setRightButton(button_type);
    }
    
    self.toggleFavorite = function() {
        if (self.currentLegislator.is_favorite == 'true') {
            is_favorite = 'false';
        } else {
            is_favorite = 'true';
        }
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("UPDATE Legislators SET is_favorite = ? WHERE bioguide_id = ?", [is_favorite, self.currentLegislator.bioguide_id,]);
            }
        );
        self.dbGetLatest(self.currentLegislator.bioguide_id);
    }
    
    self.serverGetLatest = function(id) {
        self.showProgress();
        //fetch committees from server
        jsonUrl = "http://" + application.sunlightServicesDomain + "/api/legislators.get.json?bioguide_id=" + id + "&apikey=" + settings.sunlightServicesKey + "&jsonp=_jqjsp";
        
        $.jsonp({
            url: jsonUrl,
            cache: true,
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data.response.legislators) {
                    self.updateLegislator(data.response.legislators[i].legislator);
                    self.addToLocal(data.response.legislators[i].legislator);
                }
                application.markViewed('legislator_' + id);
                self.dbGetLatest(id);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                application.navAlert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.loadThisLegislator = function(id) {
        self.dbGetLatest(id);
        /*if (!application.isViewed('legislator_' + id)) {
            self.serverGetLatest(id);
        }*/
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_legislator"));
    }
    
    self.updateLegislator = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("UPDATE Legislators SET bioguide_id=?, website=?, firstname=?, lastname=?, congress_office=?, phone=?, webform=?, youtube_url=?, nickname=?, congresspedia_url=?, district=?, title=?, in_office=?, senate_class=?, name_suffix=?, twitter_id=?, birthdate=?, fec_id=?, state=?, crp_id=?, official_rss=?, gender=?, party=?, email=?, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
}