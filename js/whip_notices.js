$(document).ready(function() {
   loadWhipNotices();
});

function loadWhipNotices() {
    dbGetLatest();
    if (!isViewed('whip_notices')) {
        serverGetLatest();
    }
}

function dataHandler(transaction, results) {
    for (var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i);    
        $('#'+row.doc_type+'_link').attr("href", row.url)
        $('#'+row.doc_type+'_date').html(leadershipFormat(row.date));
    }
}

function dbGetLatest() {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("SELECT * FROM LeadershipNotices", [], dataHandler);
        }
    );
}

function serverGetLatest() {
    $('body').append('<div id="progress">Loading...</div>');

    //fetch updates from server
    jsonUrl = 'http://' + RTC_DOMAIN + '/whip_dates.json';
    $.jsonp({
        url: jsonUrl,
        callbackParameter: "callback",
        timeout: AJAX_TIMEOUT,
        success: function(data){
            LOCAL_DB.transaction(
                function(transaction) {
                   transaction.executeSql("DELETE FROM LeadershipNotices")
                   transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['dww', data[0]['dww'].date, data[0]['dww'].url]);
                   transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['dwd', data[0]['dwd'].date, data[0]['dwd'].url]);
                   transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rwd', data[0]['rwd'].date, data[0]['rwd'].url]);
                   transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rww', data[0]['rww'].date, data[0]['rww'].url]);
                }
            );
            markViewed('whip_notices');
            dbGetLatest();
            $('#progress').remove();
        },
        error: function(d, msg) {
            $('#progress').remove();
            navigator.notification.alert("Can't connect to server", "Network Error");
        },
    });
}

function addToLocal(row, doc_type) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", [doc_type, row.date, row.url]);
        }
    );
}

/*
function updateWhipNotices() {
    $('body').append('<div id="progress">Loading...</div>');
    
    //fetch dates and urls for most current reports
    jsonUrl = "http://" + RTC_DOMAIN + "/whip_dates.json";
    $.ajax({
        type: "GET",
        url: jsonUrl, 
        dataType: "jsonp",
        success: function(data){
            $('#dww_link').attr("href", data[0]['dww'].url)
            $('#dww_date').html(leadershipFormat(data[0]['dww'].date));
            $('#dwd_link').click(function() { window.open(data[0]['dwd'].url, '_blank') });
            $('#dwd_date').html(leadershipFormat(data[0]['dwd'].date));
            $('#rwd_link').attr("href", data[0]['rwd'].url)
            $('#rwd_date').html(leadershipFormat(data[0]['rwd'].date));
            $('#rww_link').attr("href", data[0]['rww'].url)
            $('#rww_date').html(leadershipFormat(data[0]['rww'].date));
            $('#progress').remove();
        }
    });
}
*/

function leadershipFormat(orig_date) {
    try {
        var date_str = sqlDateToDate(orig_date).format("dddd, mmmm d");
        if (date_str != null) {
            return date_str;
        } else {
            return "";
        }
    } catch(e) {
        return orig_date;
    }
}