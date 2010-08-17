NewsSourceView.prototype = new View();
function NewsSourceView() {
    var self = this;
    self.containerDiv = 'news_source_body';
    self.destinationList = document.getElementById('news_list');
    self.titleString = 'News';

    self.render = function() {
        self.setTitle(localStorage.getItem("current_news_title"));
        self.setLeftButton('back', 'news');
        self.setRightButton('reload');
        self.loadNews(localStorage.getItem("current_news_source"));
        self.show();
    }
    
    self.loadNews = function(news_source) {
        self.dbGetLatest(news_source);
        if (!application.isViewed('news_' + news_source)) {
            self.serverGetLatest(news_source);
        }
    }

    self.localToList = function(results) {
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

    self.serverGetLatest = function(news_source) {
        self.showProgress();

        //fetch updates from server
        jsonUrl = 'http://' + application.rtcDomain + '/feed/' + news_source + '.json';
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data) {
                    self.addToLocal(data[i], news_source);
                }
                application.markViewed('news_' + news_source);
                self.dbGetLatest(news_source);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }

    self.addToLocal = function(row, news_source) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO News (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.date, row.title, row.url, news_source]);
            }
        );
    }

    self.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
    }

    self.dbGetLatest = function(news_source) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT id, datetime(date, 'localtime') AS date, title, url, doc_type FROM News WHERE doc_type = ? ORDER BY date DESC, url DESC LIMIT 20", [news_source,], self.dataHandler);
            }
        );
    }

    self.renderRow = function(row, dest_list) {    
        if (row.date != 'None') {
            date_str = self.newsFormat(row.date);
        } else {
            date_str = "";
        }

        var newItem = document.createElement("li");

        var result = document.createElement("div");
        result.className = 'result_body';

        var anchor = document.createElement("a");
        anchor.href = row.url;
    	$(anchor).click(function() {
    		//window.location = 'external.html#' + self.href;
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

    self.newsFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("h:MM TT");
        } catch(e) {
            return orig_date;
        }
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_news_source"));
    }
}
