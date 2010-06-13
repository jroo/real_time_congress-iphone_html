$(document).ready(function() {
    $("#title").html(APP_TITLE);
    $("#version").html("v" + APP_VERSION);
    $("#copyright").html(APP_COPYRIGHT);
    $("#url").html(APP_URL);
    $("#url").attr("href", APP_URL)
});