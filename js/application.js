function Application() {
    this.title = "Real Time Congress";
    this.version = "1.90";
    this.author = "Joshua Ruihley, Sunlight Foundation";
    this.copyright = "Copyright 2010, Sunlight Foundation";
    this.url = "http://realtimecongress.org";

    this.rtcDomain = 'realtimecongress.org';
    this.docserverDomain = 'docserver.org';
    this.ajaxTimeout = 10000;

    this.localDb = this.openDb('rtc', '1.0', 'Real Time Congress');
    this.views = ['main_menu', 'about', 'doc_list', 'documents', 'floor_updates', 'hearings', 'news', 'news_source', 'whip_notices'];

    this.aboutView = new AboutView();
    this.documentsView = new DocumentsView();
    this.docListView = new DocListView();
    this.floorUpdatesView = new FloorUpdatesView();
    this.hearingsView = new HearingsView();
    this.mainMenuView = new MainMenuView();
    this.newsView = new NewsView();
    this.newsSourceView = new NewsSourceView();
    this.whipNoticesView = new WhipNoticesView();
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
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LeadershipNotices (id INTEGER PRIMARY KEY, date DATETIME, doc_type TEXT, url TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Hearings (id INTEGER PRIMARY KEY, date DATETIME, chamber TEXT, committee TEXT, committee_code TEXT, matter TEXT, room TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LastUpdate (view_name TEXT PRIMARY KEY, date DATETIME)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Documents (id TEXT PRIMARY KEY, doc_type TEXT, date DATETIME, title TEXT, description TEXT, url TEXT)');
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
    $('#progress').hide();
}

Application.prototype.loadView = function(view_name) {
    this.hideAll();
    switch(view_name) {
        case 'about':
            this.aboutView.render();
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
        case 'main_menu':
            this.mainMenuView.render();
            break;
        case 'news':
            this.newsView.render();
            break;
        case 'news_source':
            this.newsSourceView.render();
            break;
        case 'whip_notices':
            this.whipNoticesView.render();
            break;
        default:
            break;
    }
}

$(document).ready(function() { 
    application = new Application();
    //application.startOver();
    application.initializeDb();
});


