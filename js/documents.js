function loadList(view_name, view_title) {
    localStorage.setItem("current_doc_list", view_name);
    localStorage.setItem("current_doc_title", view_title);
    window.location = "doc_list.html";
}