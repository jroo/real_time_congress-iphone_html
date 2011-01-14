WhipNoticesView.prototype = new View();
function WhipNoticesView() {
    self = this;
    self.containerDiv = 'whip_notices_body';
    self.titleString = 'Whip Notices';

    self.render = function() {
        self.setTitle(self.titleString);
        self.setLeftButton('back', 'main_menu');
        self.setRightButton('reload');
        self.loadWhipNotices();
    }
    
    self.reload = function() {
        self.serverGetLatest();
    }
    
    self.loadWhipNotices = function() {
        self.dbGetLatest();
        if (!application.isViewed('whip_notices')) {
            self.serverGetLatest();
        }
    }

    self.dataHandler = function(transaction, results) {
        for (var i=0; i<results.rows.length; i++) {
            var row = results.rows.item(i);    
            $('#'+row.doc_type+'_link').attr("href", row.url)
            $('#'+row.doc_type+'_date').html(self.leadershipFormat(row.date));
        }
        self.show();
    }

    self.dbGetLatest = function() {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("SELECT * FROM LeadershipNotices", [], self.dataHandler);
            }
        );
    }

    self.serverGetLatest = function() {
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
                       transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['dwn', data[0]['dwn'].date, data[0]['dwn'].url]);
                       
                       //remove support for republican whip updates until they start publishing again
                       //transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rwd', data[0]['rwd'].date, data[0]['rwd'].url]);
                       //transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", ['rww', data[0]['rww'].date, data[0]['rww'].url]);
                    }
                ); 
                application.markViewed('whip_notices');
                self.dbGetLatest();
                self.hideProgress();
            },
            error: function(d, msg) {
                self.hideProgress();
                navigator.notification.alert("Can't connect to server " + msg, "Network Error");
            },
        });
    }

    self.addToLocal = function(row, doc_type) {
        application.localDb.transaction(
            function(transaction) {
               transaction.executeSql("INSERT INTO LeadershipNotices (doc_type, date, url) VALUES (?, ?, ?)", [doc_type, row.date, row.url]);
            }
        );
    }

    self.leadershipFormat = function(orig_date) {
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
}