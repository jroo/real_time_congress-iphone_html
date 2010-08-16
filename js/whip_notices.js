WhipNoticesView.prototype = new View();
function WhipNoticesView() {
    self = this;
    this.containerDiv = 'whip_notices_body';
    this.titleString = 'Whip Notices';

    this.render = function() {
        this.loadWhipNotices();
        this.show();
    }
    
    this.reload = function() {
        self.serverGetLatest();
    }
    
    this.loadWhipNotices = function() {
        this.dbGetLatest();
        if (!application.isViewed('whip_notices')) {
            this.serverGetLatest();
        }
    }

    this.dataHandler = function(transaction, results) {
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);    
            $('#'+row.doc_type+'_link').attr("href", row.url)
            $('#'+row.doc_type+'_date').html(self.leadershipFormat(row.date));
        }
    }

    this.dbGetLatest = function() {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM LeadershipNotices", [], self.dataHandler);
            }
        );
    }

    this.serverGetLatest = function() {
        self.showProgress();

        //fetch updates from server
        jsonUrl = 'http://' + application.rtcDomain + '/whip_dates.json';
        $.jsonp({
            url: jsonUrl,
            callbackParameter: "callback",
            timeout: application.ajaxTimeout,
            success: function(data){
                application.localDb.transaction(
                    function(transaction) {
                       transaction.executeSql("DELETE FROM LeadershipNotices")
                       transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['dww', data[0]['dww'].date, data[0]['dww'].url]);
                       transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['dwd', data[0]['dwd'].date, data[0]['dwd'].url]);
                       transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rwd', data[0]['rwd'].date, data[0]['rwd'].url]);
                       transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rww', data[0]['rww'].date, data[0]['rww'].url]);
                    }
                ); 
                application.markViewed('whip_notices');
                self.dbGetLatest();
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server", "Network Error");
            },
        });
    }

    this.addToLocal = function(row, doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", [doc_type, row.date, row.url]);
            }
        );
    }

    this.leadershipFormat = function(orig_date) {
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
    
    this.show = function() {
        this.setTitle(this.titleString);
        this.setLeftButton('menu', 'main_menu');
        this.setRightButton('reload');
        $('#'+this.containerDiv).show();
    }
    
    this.hide = function() {
        $('#'+this.containerDiv).hide();
    }
}
