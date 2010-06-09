$(document).ready(function() {
    initializeDb(LOCAL_DB);
});

RTC_DOMAIN = 'eleventy6.com:8000'; //realtimecongress.org
DOCSERVER_DOMAIN = 'eleventy6.com:8080';  //docserver.org
LOCAL_DB = openDb('rtc', '1.0', 'Real Time Congress');

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
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LastView (id TEXT PRIMARY KEY, view_name TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS News (id TEXT PRIMARY KEY, title TEXT, description TEXT, url TEXT, date DATETIME, doc_type TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS FloorUpdates (id INTEGER PRIMARY KEY, date DATETIME, description TEXT, chamber TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LeadershipNotices (id INTEGER PRIMARY KEY, date DATETIME, doc_type TEXT, url TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Hearings (id INTEGER PRIMARY KEY, date DATETIME, chamber TEXT, committee TEXT, committee_code TEXT, matter TEXT, room TEXT)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS LastUpdate (view_name TEXT PRIMARY KEY, date DATETIME)');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS Documents (id TEXT PRIMARY KEY, doc_type TEXT, date DATETIME, title TEXT, description TEXT, url TEXT)');
        }
    );
}

function setLastView(view_name, db) {
    db.transaction(
        function(transaction) {
           transaction.executeSql("DELETE FROM LastView");
           transaction.executeSql("INSERT INTO LastView (view_name) VALUES (?)", [view_name]);
        }
    );
    alert("ok");
}

function dbErrorHandler(transaction, error)
{
    alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
}

function loadView(view_name) {
    window.location = view_name + ".html";
}