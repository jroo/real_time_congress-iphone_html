DocListView.prototype = new View();
function DocListView() {
    var self = this;
    self.containerDiv = 'doc_list_body';
    self.titleString = 'Documents';
    self.destinationList = document.getElementById('doc_list');
        
    self.addToLocal = function(row, doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO Documents (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.release_date, row.title, row.original_url, doc_type]);
            }
        );
    }
    
    self.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
        self.show();
    }
    
    self.dbGetLatest = function(doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT date, title, url FROM Documents WHERE doc_type = ? ORDER BY Date DESC LIMIT 20", [doc_type,], self.dataHandler);
            }
        );
    }
    
    self.loadDocs = function(doc_type) {
        self.setTitle(localStorage.getItem("current_doc_title"));
        self.dbGetLatest(doc_type);
        if (!application.isViewed('docs_' + doc_type)) {
            self.serverGetLatest(doc_type);
        }
    }
    
    self.render = function() {
		self.viewName = 'documents/' + localStorage.getItem("current_doc_list");
        self.setTitle(localStorage.getItem("current_doc_title"));
        self.setLeftButton('back', 'documents');
        self.setRightButton('reload');
        self.loadDocs(localStorage.getItem("current_doc_list"));
    }
    
    self.serverGetLatest = function(doc_type) {
        self.showProgress();
        
        //fetch updates from server
        jsonUrl = "http://" + application.docserverDomain + "/" + doc_type + "/list.json";
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            timeout: application.ajaxTimeout,
            success: function(data){
                for (i in data[0].doc_list) {
                    self.addToLocal(data[0].doc_list[i], doc_type);
                }
                application.markViewed('docs_' + doc_type);
                self.dbGetLatest(doc_type);
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }
    
    self.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_doc_list"));
    }
    
    self.localToList = function(results) {
        var latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', date:row.date, title:row.title, url:row.url, doc_type:row.doc_type});
        }
        return latest_list;
    }

    self.renderRow = function(row, dest_list) {
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
        subDiv.innerHTML = self.documentFormat(row.date);

        anchor.appendChild(titleDiv);
        anchor.appendChild(subDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);
    }

    self.documentFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("mmmm d, yyyy");
        } catch(e) {
            return orig_date;
        }
    }
}