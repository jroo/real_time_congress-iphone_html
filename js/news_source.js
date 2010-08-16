NewsSourceView.prototype = new View();
function NewsSourceView() {
    var self = this;
    this.containerDiv = 'news_source_body';
    this.destinationList = document.getElementById('news_list');
    this.titleString = 'News';

    this.render = function() {
        this.loadNews(localStorage.getItem("current_news_source"));
    }
    
    this.loadNews = function(news_source) {
        this.dbGetLatest(news_source);
        if (!application.isViewed('news_' + news_source)) {
            this.serverGetLatest(news_source);
        }
    }

    this.localToList = function(results) {
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

    this.serverGetLatest = function(news_source) {
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

    this.addToLocal = function(row, news_source) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO News (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.date, row.title, row.url, news_source]);
            }
        );
    }

    this.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
        self.show();
    }

    this.dbGetLatest = function(news_source) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT id, datetime(date, 'localtime') AS date, title, url, doc_type FROM News WHERE doc_type = ? ORDER BY date DESC, url DESC LIMIT 20", [news_source,], self.dataHandler);
            }
        );
    }

    this.renderRow = function(row, dest_list) {    
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

    this.newsFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("h:MM TT");
        } catch(e) {
            return orig_date;
        }
    }
    
    this.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_news_source"));
    }
    
    this.show = function() {
        this.setTitle(localStorage.getItem("current_news_title"));
        this.setLeftButton('back', 'news');
        this.setRightButton('reload');
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
}
