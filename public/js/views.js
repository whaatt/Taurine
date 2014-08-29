/* View Functions */

function addError(error) {
    $('.banner').prepend('<div class="alert alert-danger alert-dismissible"'
     + 'role="alert"><button type="button" class="close" data-dismiss="alert"><span'
     + 'aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
     + '<b>Error:</b> ' + error + '</div>');
}

function addSuccess(success) {
    $('.banner').prepend('<div class="alert alert-success alert-dismissible"'
     + 'role="alert"><button type="button" class="close" data-dismiss="alert"><span'
     + 'aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
     + '<b>Success:</b> ' + success + '</div>');
}

function setContent(className) {
    //get unchanged content from storage and stick it into content DIV
    $('.main').empty().html(getStorage('.' + className));
}

function setUsername(username) {
    $('.user').html(username);
}

function setMenuContext(type) {
    $('.navbar-links').children().hide(); //reset menu
    $('.navbar-links .' + type).show(); //show menu
    $('.navbar-links .navbar-right').show(); //show user
}

function setActiveMenuLink(link) {
    $('.navbar-nav li').removeClass('active');
    $('.navbar-nav .' + link).addClass('active');
}