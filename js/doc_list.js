DocListView.prototype = new View();
function DocListView() {
    var self = this;
    this.containerDiv = 'doc_list_body';
    this.titleString = 'Documents';
    this.destinationList = document.getElementById('doc_list');
        
    this.addToLocal = function(row, doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO Documents (id, date, title, url, doc_type) VALUES (?, ?, ?, ?, ?)", [row.id, row.release_date, row.title, row.original_url, doc_type]);
            }
        );
    }
    
    this.dataHandler = function(transaction, results) {
        self.renderList(self.localToList(results), self.destinationList);
        self.show();
    }
    
    this.dbGetLatest = function(doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT date, title, url FROM Documents WHERE doc_type = ? ORDER BY Date DESC LIMIT 20", [doc_type,], self.dataHandler);
            }
        );
    }
    
    this.loadDocs = function(doc_type) {
        this.setTitle(localStorage.getItem("current_doc_title"));
        this.dbGetLatest(doc_type);
        if (!application.isViewed('docs_' + doc_type)) {
            this.serverGetLatest(doc_type);
        }
    }

    this.render = function() {
        this.loadDocs(localStorage.getItem("current_doc_list"));
    }
    
    this.serverGetLatest = function(doc_type) {
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
                navigator.notification.alert("Can't connect to server " + d, "Network Error");
            },
        });
    }
    
    this.show = function() {
        this.setTitle(localStorage.getItem("current_doc_title"));
        this.setLeftButton('back', 'documents');
        this.setRightButton('reload');
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
    
    this.reload = function() {
        self.serverGetLatest(localStorage.getItem("current_doc_list"));
    }
    
    this.localToList = function(results) {
        var latest_list = [];
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);
            latest_list.push({row_type:'content', date:row.date, title:row.title, url:row.url, doc_type:row.doc_type});
        }
        return latest_list;
    }

    this.renderRow = function(row, dest_list) {
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
        subDiv.innerHTML = this.documentFormat(row.date);

        anchor.appendChild(titleDiv);
        anchor.appendChild(subDiv);
        result.appendChild(anchor);
        newItem.appendChild(result);
        dest_list.appendChild(newItem);
    }

    this.documentFormat = function(orig_date) {
        try {
            return sqlDateToDate(orig_date).format("mmmm d, yyyy");
        } catch(e) {
            return orig_date;
        }
    }
}