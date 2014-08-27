//KEEP BASE BLANK if no subdomain
base = ''; //CHANGE ME for installs

//contains storage
var fragment = '';

//login redirect
var redir = '';

$.get(base + '/partials/fragment.html', function(data) {
    //initialize frag
    fragment = data;
    page.start();
});

function getStorage(selector) {
    //turn our fragment into a jQuery object
    return $(fragment).find(selector).html();
}

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
                //addError('Something is wrong with your internet connection!');
                $('input[type="submit"]').prop('disabled', false);
            }
        });
    });
}

function makeGET(URL, call) {
    Pace.track(function(){
        $.ajax({
            type: 'GET',
            url: base + URL,
            dataType: 'json',
            success: call,
            failure: function(err) {
                //addError('Something is wrong with your internet connection!');
                $('input[type="submit"]').prop('disabled', false);
            }
        });
    });
}