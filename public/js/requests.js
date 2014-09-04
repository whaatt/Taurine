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

function getFragmentInner(selector) {
    //get HTML that is inside the fragment
    return $(fragment).find(selector).html();
}

//include wrapping tag
function getFragmentOuter(selector) {
    //get HTML that includes the fragment itself
    return $(fragment).find(selector)[0].outerHTML;
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

function makePUT(URL, data, call) {
    Pace.track(function(){
        $.ajax({
            type: 'PUT',
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

function makeDEL(URL, call) {
    Pace.track(function(){
        $.ajax({
            type: 'DELETE',
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