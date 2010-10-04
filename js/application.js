function Application() {
    this.title = "Real Time Congress";
    this.version = "2.0a20101004";
    this.author = "Joshua Ruihley, Sunlight Foundation";
    this.copyright = "Copyright 2010, Sunlight Foundation";
    this.url = "http://realtimecongress.org";

    this.rtcDomain = 'realtimecongress.org';
    this.docserverDomain = 'docserver.org';
    this.sunlightServicesDomain = 'services.sunlightlabs.com';
    this.drumboneDomain = 'drumbone.services.sunlightlabs.com';
    
    this.ajaxTimeout = 10000;
    this.localDb = this.openDb('rtc', '1.0', 'Real Time Congress');
    this.views = ['main_menu', 'about', 'committee', 'doc_list', 'documents', 'floor_updates', 'hearings', 'legislator', 'legislators', 
        'news', 'news_source', 'legislators_favorites', 'legislators_committees', 'legislators_location', 'legislators_state', 
        'legislators_states', 'legislators_last_name', 'legislators_zip', 'subcommittee', 'legislator_search_results',
        'legislator_votes'];
    this.viewStack = new ViewStack();
        
    this.aboutView = new AboutView();
    this.committeeView = new CommitteeView();
    this.documentsView = new DocumentsView();
    this.docListView = new DocListView();
    this.favoriteLegislatorsView = new FavoriteLegislatorsView();
    this.floorUpdatesView = new FloorUpdatesView();
    this.hearingsView = new HearingsView();
    this.legislatorSearchResultsView = new LegislatorSearchResultsView();
    this.legislatorView = new LegislatorView();
    this.legislatorVotesView = new LegislatorVotesView();
    this.legislatorsView = new LegislatorsView();
    this.legislatorsCommitteesView = new LegislatorsCommitteesView();
    this.legislatorsLastNameView = new LegislatorsLastNameView();
    this.legislatorsLocationView = new LegislatorsLocationView();
    this.legislatorsStateView = new LegislatorsStateView();
    this.legislatorsStatesView = new LegislatorsStatesView();
    this.legislatorsZipView = new LegislatorsZipView();
    this.mainMenuView = new MainMenuView();
    this.newsView = new NewsView();
    this.newsSourceView = new NewsSourceView();
    this.subcommitteeView = new SubcommitteeView();
}

Application.prototype.markViewed = function(view_name) {
    sessionStorage.setItem(view_name + '_viewed', true);
}

Application.prototype.isViewed = function(view_name) {
    return (sessionStorage.getItem(view_name + '_viewed'));
}

Application.prototype.openDb = function(short_name, version, display_name) {
    var max_size = 655360;
    var db = openDatabase(short_name, version, display_name, max_size);
    return db
}

Application.prototype.initializeDb = function() {    
    this.localDb.transaction(
        function(transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS News (id TEXT PRIMARY KEY, title TEXT, description TEXT, url TEXT, date DATETIME, doc_type TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS FloorUpdates (id INTEGER PRIMARY KEY, date DATETIME, description TEXT, chamber TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Hearings (id INTEGER PRIMARY KEY, date DATETIME, chamber TEXT, committee TEXT, committee_code TEXT, matter TEXT, room TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LastUpdate (view_name TEXT PRIMARY KEY, date DATETIME)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Documents (id TEXT PRIMARY KEY, doc_type TEXT, date DATETIME, title TEXT, description TEXT, url TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Legislators (bioguide_id TEXT PRIMARY KEY, is_favorite TEXT, website TEXT, firstname TEXT, lastname TEXT, congress_office TEXT, phone TEXT, webform TEXT, youtube_url TEXT, nickname TEXT, congresspedia_url TEXT, district TEXT, title TEXT, in_office TEXT, senate_class TEXT, name_suffix TEXT, twitter_id TEXT, birthdate TEXT, fec_id TEXT, state TEXT, crp_id TEXT, official_rss TEXT, gender TEXT, party TEXT, email TEXT, votesmart_id TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LegislatorsVotes (bioguide_id TEXT, roll_id TEXT, voted_at DATETIME, vote TEXT, FOREIGN KEY(bioguide_id) REFERENCES Legislators(bioguide_id))');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS CommitteesLegislators (committee_id TEXT, legislator_id TEXT, FOREIGN KEY(committee_id) REFERENCES Committees(id), FOREIGN KEY(legislator_id) REFERENCES Legislators(bioguide_id))');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Committees (id TEXT PRIMARY KEY, name TEXT, chamber TEXT, parent TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Location (timestamp DATETIME, latitude TEXT, longitude TEXT)');
        }
    );
}

Application.prototype.dbPurgeOld = function () {
    this.localDb.transaction(
        function(transaction) {
            transaction.executeSql('DELETE FROM News ORDER BY date DESC LIMIT 100, 1000');
            transaction.executeSql('DELETE FROM FloorUpdates ORDER BY date DESC LIMIT 50, 1000');
            transaction.executeSql('DELETE FROM Hearings ORDER BY date DESC LIMIT 50, 1000');
            transaction.executeSql('DELETE FROM LastUpdate ORDER BY date DESC LIMIT 30, 1000');
            transaction.executeSql('DELETE FROM Documents ORDER BY date DESC LIMIT 100, 1000');
        }
    );    
}

Application.prototype.startOver = function () {
    this.localDb.transaction(
        function(transaction) {
            transaction.executeSql('DROP TABLE News');
            transaction.executeSql('DROP TABLE FloorUpdates');
            transaction.executeSql('DROP TABLE LeadershipNotices');
            transaction.executeSql('DROP TABLE Hearings');
            transaction.executeSql('DROP TABLE LastUpdate');
            transaction.executeSql('DROP TABLE Legislators');
            transaction.executeSql('DROP TABLE Documents');    
            }
        );
}

Application.prototype.dbErrorHandler = function(transaction, error)
{
    alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
}

Application.prototype.initializeChamberSelect = function() {
	$('a.view').click(function() {
		window.location = this.href;
		return false;
	});

	$('ul.selector a').click(function() {
		$(this).parent().parent().find('a').removeClass('active');
		$(this).addClass('active');
	});
}

Application.prototype.hideAll = function() {
    for (var i  in this.views) {
        $("#" + this.views[i] + "_body").hide();
    }
    $('#empty_result').hide();
}

Application.prototype.loadView = function(view_name) {
    this.hideAll();
    switch(view_name) {
        case 'about':
            this.aboutView.render();
            break;
        case 'committee':
            this.committeeView.render();
            break;
        case 'documents':
            this.documentsView.render();
            break;
        case 'doc_list':
            this.docListView.render();
            break;
        case 'floor_updates':
            this.floorUpdatesView.render();
            break;
        case 'hearings':
            this.hearingsView.render();
            break;
        case 'legislator':
            this.legislatorView.render();
            break;
        case 'legislator_votes':
            this.legislatorVotesView.render();
            break;
        case 'legislator_search_results':
            this.legislatorSearchResultsView.render();
            break;
        case 'legislators':
            this.legislatorsView.render();
            break;
        case 'legislators_committees':
            this.legislatorsCommitteesView.render();
            break;
        case 'legislators_favorites':
            this.favoriteLegislatorsView.render();
            break;
        case 'legislators_last_name':
            this.legislatorsLastNameView.render();
            break;
        case 'legislators_location':
            this.legislatorsLocationView.render();
            break;
        case 'legislators_state':
            this.legislatorsStateView.render();
            break;
        case 'legislators_states':
            this.legislatorsStatesView.render();
            break;
        case 'legislators_zip':
            this.legislatorsZipView.render();
            break;
        case 'main_menu':
            this.mainMenuView.render();
            break;
        case 'news':
            this.newsView.render();
            break;
        case 'news_source':
            this.newsSourceView.render();
            break;
        case 'subcommittee':
            this.subcommitteeView.render();
            break;
        default:
            break;
    }
}

Application.prototype.navAlert = function(message, title) {
    try {
        application.navAlert(message, title);
    } catch(err) {
        application.navAlert(message);
    }
}

$(document).ready(function() { 
    application = new Application();
    settings = new Settings();
    
    application.initializeDb();
    application.dbPurgeOld();
    
    application.viewStack.forwardTo('main_menu');
});