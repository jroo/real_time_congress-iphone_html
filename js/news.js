function showNews(news_source, title) {
    localStorage.setItem("current_news_source", news_source);
    localStorage.setItem("current_news_title", title);
    window.location = "news_source.html";
}