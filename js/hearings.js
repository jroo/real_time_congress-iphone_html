$(document).bind("deviceready", function() { 
    DEST_LIST = document.getElementById('hearing_list');
    loadChamber(CURRENT_CHAMBER);
    $('#hearings').show();
});

CURRENT_CHAMBER = 'Senate';

function loadChamber(chamber) {
    CURRENT_CHAMBER = chamber;
    $('#title_text').html(chamber + " Hearings");
    /*
    if (chamber == 'House') {
        $('senate_link').removeClass('active');
        $('house_link').addClass('active');
    } else {
        $('senate_link').addClass('active');
        $('house_link').removeClass('active');   
    }   */  
    dbGetLatest(chamber);
    if (!isViewed('hearings_' + chamber)) {
        serverGetLatest(chamber);
    }
}

function dataHandler(transaction, results) {
    renderList(localToList(results), DEST_LIST);
}

function dbGetLatest(chamber) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("SELECT * FROM Hearings WHERE chamber = ? AND date > date('now') ORDER BY Date ASC LIMIT 30", [chamber,], dataHandler);
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
        latest_list.push({row_type:'content', meeting_date:row.date,
            committee:row.committee,
            description:row.matter,
            room:row.room});
    }
    return latest_list;
}

function serverGetLatest(chamber) {
    $('body').append('<div id="progress">Loading...</div>');

    //fetch hearing schedules from server
    jsonUrl = "http://" + RTC_DOMAIN + "/hearings_upcoming.json?chamber=" + chamber;
    $.jsonp({
        url: jsonUrl,
        callbackParameter: "callback",
        timeout: AJAX_TIMEOUT,
        success: function(data){
            for (i in data) {
                addToLocal(data[i], chamber);
            }
            markViewed('hearings_' + chamber);
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
           transaction.executeSql("INSERT INTO Hearings (id, date, chamber, committee, committee_code, matter, room) VALUES (?, ?, ?, ?, ?, ?, ?)", [row.id, row.meeting_date, chamber, row.committee, row.committee_code, row.matter, row.room]);
        }
    );
}

function renderRow(row, dest_list) {
    room_txt = '';
    if (row.room !='None') {
        room_txt = " (" + row.room + ")";
    }
    
    var newItem = document.createElement("li");
    
    var titleDiv = document.createElement("div");
    titleDiv.className = 'result_title';
    titleDiv.innerHTML = row.committee;
    
    var subDiv = document.createElement("div");
    subDiv.className = 'result_subtitle';
    subDiv.innerHTML = hearingFormat(row.meeting_date) + room_txt;
    
    var descDiv = document.createElement("div");
    descDiv.className = 'result_description';
    descDiv.innerHTML = row.description;
    
    newItem.appendChild(titleDiv);
    newItem.appendChild(subDiv);
    newItem.appendChild(descDiv);
    dest_list.appendChild(newItem);
    
}

function hearingFormat(orig_date) {
    try {
        return sqlDateToDate(orig_date).format("h:MM TT");
    } catch(e) {
        return orig_date;
    }
}