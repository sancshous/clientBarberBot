// static/scripts.js
$(document).ready(function() {
    $('#mainBtn').on('click', function () {
        var menDate = $('#menDate').val()
        var womenDate = $('#womenDate').val()
        var body = $('#editCartModal').find('.modal-body')
        if(menDate == '2000-10-05' && womenDate == '2002-03-05') {
            var children = body.children()
            if(children) {
                children.each(function () {
                    $(this).remove()
                })
            }
            var span = $('<h3>Совместимость 200%❤️</h3>')
            body.append(span)
            var video = $('<iframe src="https://giphy.com/embed/x28cIQSn19Tbi" width="480" height="355" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/kiss-lady-and-the-tramp-disney-x28cIQSn19Tbi">via GIPHY</a></p>')
            body.append(video)
            $('#editCartModal').modal('show')
        } else {
            var children = body.children()
            if(children) {
                children.each(function () {
                    $(this).remove()
                })
            }
            var span = $('<h3>Совместимость 3%😔</h3>')
            body.append(span)
            var video = $('<iframe src="https://giphy.com/embed/WM6WJ2Eb76ms0" width="480" height="274" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/willy-wonka-and-the-chocolate-factory-gene-wilder-WM6WJ2Eb76ms0">via GIPHY</a></p>')
            body.append(video)
            $('#editCartModal').modal('show')
        }
    })
});
