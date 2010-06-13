APP_TITLE = "Real Time Congress";
APP_VERSION = "1.60";
APP_AUTHOR = "Joshua Ruihley, Sunlight Foundation";
APP_COPYRIGHT = "Copyright 2010, Sunlight Foundation";
APP_URL = "http://realtimecongress.org";

RTC_DOMAIN = 'realtimecongress.org';
DOCSERVER_DOMAIN = 'docserver.org';
LOCAL_DB = openDb('rtc', '1.0', 'Real Time Congress');
AJAX_TIMEOUT = 5000;

$(document).ready(function() {
    initializeDb(LOCAL_DB);

	$('a.view').click(function() {
		window.location = this.href;
		return false;
	});
	
	$('ul.selector a').click(function() {
		$(this).parent().parent().find('a').removeClass('active');
		$(this).addClass('active');
	});
});

function markViewed(view_name) {
    sessionStorage.setItem(view_name + '_viewed', true);
}

function isViewed(view_name) {
    return (sessionStorage.getItem(view_name + '_viewed'));
}

function renderList(list, dest_list) {
    dest_list.innerHTML = '';
    if (list.length > 0) {
        for (i in list) {
            if (list[i].row_type == 'content') {
                renderRow(list[i], dest_list);
            } else if (list[i].row_type == 'header') {
                renderHeader(list[i].title, dest_list);
            }
        }
    }
}

function renderHeader(title, dest_list) {
    var newItem = document.createElement("li")
    newItem.className = 'header_row';
    newItem.innerHTML = title;
    dest_list.appendChild(newItem);
}

function openDb(short_name, version, display_name) {
    var max_size = 655360;
    var db = openDatabase(short_name, version, display_name, max_size);
    return db
}

function initializeDb(db) {    
    db.transaction(
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

function dbErrorHandler(transaction, error)
{
    alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
}

function loadView(view_name) {
    window.location = view_name + ".html";
}
