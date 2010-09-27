LegislatorListView.prototype = new View();
function LegislatorListView() {
    var self = this;
}
    
LegislatorListView.prototype.addToLocal = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("INSERT INTO Legislators (bioguide_id, is_favorite, website, firstname, lastname, congress_office, phone, webform, youtube_url, nickname, congresspedia_url, district, title, in_office, senate_class, name_suffix, twitter_id, birthdate, fec_id, state, crp_id, official_rss, gender, party, email, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.is_favorite, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }
    
LegislatorListView.prototype.loadLegislator = function(id, title, previous_view) {
        alert(previous_view);
        localStorage.setItem("current_legislator", id);
        localStorage.setItem("current_legislator_title", title);
        application.loadView('legislator', previous_view);
    }
    
LegislatorListView.prototype.localToList = function(results) {
        latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            (row.nickname == '') ? firstname=row.firstname : firstname=row.nickname;
            latest_list.push({row_type:'content', id:row.bioguide_id, title:row.title, firstname:firstname, lastname:row.lastname});
        }
        return latest_list;
    }
    
LegislatorListView.prototype.renderRow = function(row, dest_list) {
        var newItem = document.createElement("li");
        var result = document.createElement("div");
        
        result.className = 'result_body';
        
        var titleDiv = document.createElement("div");
        titleDiv.className = 'result_body';
        titleDiv.innerHTML = row.title + '. ' + row.lastname + ", " + row.firstname;
        
        var anchor = document.createElement("a");
    	$(anchor).click(function() {
            self.loadLegislator(row.id, row.title + '. ' + row.firstname + ' ' + row.lastname, this.view_name);
    	});
    	
        anchor.appendChild(titleDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);
    }
    
LegislatorListView.prototype.updateLegislator = function(row) {
        application.localDb.transaction(
            function(transaction) {
                transaction.executeSql("UPDATE Legislators SET bioguide_id=?, website=?, firstname=?, lastname=?, congress_office=?, phone=?, webform=?, youtube_url=?, nickname=?, congresspedia_url=?, district=?, title=?, in_office=?, senate_class=?, name_suffix=?, twitter_id=?, birthdate=?, fec_id=?, state=?, crp_id=?, official_rss=?, gender=?, party=?, email=?, votesmart_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row.bioguide_id, row.website, row.firstname, row.lastname, row.congress_office, row.phone, row.webform, row.youtube_url, row.nickname, row.congresspedia_url, row.district, row.title, row.in_office, row.senate_class, row.name_suffix, row.twitter_id, row.birthdate, row.fec_id, row.state, row.crp_id, row.official_rss, row.gender, row.party, row.email, row.votesmart_id]);
            }
        );
    }