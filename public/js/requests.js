function makePOST(URL, data, call) {
    Pace.track(function(){
        $.ajax({
            type: 'POST',
            url: base + URL,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: call,
            failure: function(err) {
                addError('Something is wrong with your internet connection!');
                $('input[type="submit"]').prop('disabled', false);
            }
        });
    });
}