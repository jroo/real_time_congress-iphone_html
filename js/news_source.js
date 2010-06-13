$(document).ready(function() {
    DEST_LIST = document.getElementById('news_list');
    $('#title_text').html(localStorage.getItem("current_news_title"));
    loadNews(localStorage.getItem("current_news_source"));  
});

function loadNews(news_source) {
    dbGetLatest(news_source);
    if (!isViewed('news_' + news_source)) {
        serverGetLatest(news_source);
    }
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
        latest_list.push({row_type:'content', title:row.title, description:row.description, url:row.url, date:row.date, doc_type:row.doc_type});        
    }
    return latest_list;
}

function serverGetLatest(news_source) {
    $('body').append('<div id="progress">Loading...</div>');

    //fetch updates from server
    jsonUrl = 'http://' + RTC_DOMAIN + '/feed/' + news_source + '.json';
    $.jsonp({
        url: jsonUrl,
        callbackParameter: "callback",
        timeout: AJAX_TIMEOUT,
        success: function(data){
            for (i in data) {
                addToLocal(data[i], news_source);
            }
            markViewed('news_' + news_source);
            dbGetLatest(news_source);
            $('#progress').remove();
        },
        error: function(d, msg) {
            $('#progress').remove();
            navigator.notification.alert("Can't connect to server", "Network Error");
        },
    });
}

function addToLocal(row, news_source) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("INSERT INTO News (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.date, row.title, row.url, news_source]);
        }
    );
}

function dataHandler(transaction, results) {
    renderList(localToList(results), DEST_LIST);
}

function dbGetLatest(news_source) {
    LOCAL_DB.transaction(
        function(transaction) {
           transaction.executeSql("SELECT id, datetime(date, 'localtime') AS date, title, url, doc_type FROM News WHERE doc_type = ? ORDER BY date DESC, url DESC LIMIT 20", [news_source,], dataHandler);
        }
    );
}

function renderRow(row, dest_list) {    
    if (row.date != 'None') {
        date_str = newsFormat(row.date);
    } else {
        date_str = "";
    }
    
    var newItem = document.createElement("li");

    var result = document.createElement("div");
    result.className = 'result_body';

    var anchor = document.createElement("a");
    anchor.href = row.url;
	$(anchor).click(function() {
		//window.location = 'external.html#' + this.href;
		//return false;
		return true;
	});
    
    var titleDiv = document.createElement("div");
    titleDiv.className = 'result_title';
    titleDiv.innerHTML = row.title;
    
    var subDiv = document.createElement("div");
    subDiv.className = 'result_subtitle';
    subDiv.innerHTML = date_str;
    
    anchor.appendChild(titleDiv);
    anchor.appendChild(subDiv);
    result.appendChild(anchor);
    newItem.appendChild(result);
    dest_list.appendChild(newItem);
}

function newsFormat(orig_date) {
    try {
        return sqlDateToDate(orig_date).format("h:MM TT");
    } catch(e) {
        return orig_date;
    }
}