$(document).ready(function() {
    DEST_LIST = document.getElementById('update_list');
    loadChamber(CURRENT_CHAMBER);
    $('#floor_updates').show();
});

CURRENT_CHAMBER = 'House';

function loadChamber(chamber) {
    CURRENT_CHAMBER = chamber;
    $('#title_text').html(chamber + " Floor");
    dbGetLatest(chamber);
    if (!isViewed('floor_' + chamber)) {
        serverGetLatest(chamber);
    }
}

function dataHandler(transaction, results) {
    renderList(localToList(results), DEST_LIST);
}

function dbGetLatest(chamber) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("SELECT * FROM FloorUpdates WHERE chamber = ? ORDER BY Date DESC LIMIT 20", [chamber,], dataHandler);
        }
    );
}

function localToList(results) {
    latest_list = [];
    last_date = null;
    for (var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i);
        this_date = sqlDateToDate(row.date).format("mm/dd/yyyy")
        if (this_date != last_date) {
            friendly_date = sqlDateToDate(row.date).format("dddd, mmmm d")
            latest_list.push({row_type:'header', title:friendly_date, subtitle:'subby'});
            last_date = this_date;
        }
        latest_list.push({row_type:'content', event_date:row.date, description:row.description});        
    }
    return latest_list;
}

function serverGetLatest(chamber) {
    $('body').append('<div id="progress">Loading...</div>');

    //fetch floor updates from server
    jsonUrl = "http://" + RTC_DOMAIN + "/floor_recent.json?chamber=" + chamber;
    $.jsonp({
        url: jsonUrl,
        callbackParameter: "callback",
        timeout: AJAX_TIMEOUT,
        success: function(data){
            for (i in data) {
                addToLocal(data[i], chamber);
            }
            markViewed('floor_' + chamber);
            dbGetLatest(chamber);
            $('#progress').remove();
        },
        error: function(d, msg) {
            $('#progress').remove();
            navigator.notification.alert("Can't connect to server", "Network Error");
        },
    });
}

function addToLocal(row, chamber) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("INSERT INTO FloorUpdates (id,date,description,chamber) VALUES (?,?,?,?)", [row.id, row.event_date, row.description, chamber]);
        }
    );
}

function renderRow(row, dest_list) {
    var newItem = document.createElement("li");
    
    var descSpan = document.createElement("span");
    descSpan.innerHTML = row.description + ' ';

    var timeSpan = document.createElement("span");
    timeSpan.innerHTML = floorFormat(row.event_date);
    timeSpan.className = 'time_span';
    
    newItem.appendChild(descSpan);
    newItem.appendChild(timeSpan);
    dest_list.appendChild(newItem);
}

function floorFormat(orig_date) {
    try {
        return sqlDateToDate(orig_date).format("h:MM TT");
    } catch(e) {
        return orig_date;
    }
}