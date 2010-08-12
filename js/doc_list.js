$(document).bind("deviceready", function() { 
    DEST_LIST = document.getElementById('doc_list');
    loadDocs(localStorage.getItem("current_doc_list"));
    $('#title_text').html(localStorage.getItem("current_doc_title"));
});

function loadDocs(doc_type) {
    $('#title_text').html(doc_type.toUpperCase());
    dbGetLatest(doc_type);
    if (!isViewed('docs_' + doc_type)) {
        serverGetLatest(doc_type);
    }
}

function dataHandler(transaction, results) {
    renderList(localToList(results), DEST_LIST);
}

function dbGetLatest(doc_type) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("SELECT date, title, url FROM Documents WHERE doc_type = ? ORDER BY Date DESC LIMIT 20", [doc_type,], dataHandler);
        }
    );
}

function serverGetLatest(doc_type) {
    $('body').append('<div id="progress">Loading...</div>');

    //fetch updates from server
    jsonUrl = "http://" + DOCSERVER_DOMAIN + "/" + doc_type + "/list.json";
    $.jsonp({
        url: jsonUrl,
        callbackParameter: "callback",
        timeout: AJAX_TIMEOUT,
        success: function(data){
            for (i in data[0].doc_list) {
                addToLocal(data[0].doc_list[i], doc_type);
            }
            markViewed('docs_' + doc_type);
            dbGetLatest(doc_type);
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
           transaction.executeSql("INSERT INTO Documents (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.release_date, row.title, row.original_url, doc_type]);
        }
    );
}

function localToList(results) {
    latest_list = [];
    for (var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i);
        latest_list.push({row_type:'content', date:row.date, title:row.title, url:row.url, doc_type:row.doc_type});
    }
    return latest_list;
}

function renderRow(row, dest_list) {
    var newItem = document.createElement("li");
    
    var result = document.createElement("div");
    result.className = 'result_body';
    
    var anchor = document.createElement("a");
    anchor.href = row.url;
    
    var titleDiv = document.createElement("div");
    titleDiv.className = 'result_title';
    titleDiv.innerHTML = row.title;
    
    var subDiv = document.createElement("div");
    subDiv.className = 'result_subtitle';
    subDiv.innerHTML = documentFormat(row.date);
    
    anchor.appendChild(titleDiv);
    anchor.appendChild(subDiv);
    result.appendChild(anchor);
    newItem.appendChild(result);
    dest_list.appendChild(newItem);
}

function documentFormat(orig_date) {
    try {
        sqlDateToDate(orig_date).format("mmmm d, yyyy");
    } catch(e) {
        return orig_date;
    }
}