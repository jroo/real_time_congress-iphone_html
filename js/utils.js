function RTCUtils() {
    self = this;
    self.ordinalize = function (num) {
    	return num + (
    		(num % 10 == 1 && num % 100 != 11) ? 'st' :
    		(num % 10 == 2 && num % 100 != 12) ? 'nd' :
    		(num % 10 == 3 && num % 100 != 13) ? 'rd' : 'th'
    	);
    }

    self.districtToString = function(str) {
        var new_str = str;
        if (str == 0) {
            new_str = 'At Large';
        } else if (!isNaN(parseInt(str))) {
            new_str = self.ordinalize(str) + " District";
        } else {
            new_str = str.replace(' Seat', ' Senator');
        }
        return new_str;
    }
    
    self.fullStateName = function(str) {
        var stateList = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"};
        return stateList[str];
    }
}

