function loaded() {
	document.addEventListener('touchmove', function(e){ e.preventDefault(); });
	myScroll = new iScroll('scroller');
}
document.addEventListener('DOMContentLoaded', loaded);