/* View Functions */

function addError(error) {
    $('.content').prepend('<div class="alert alert-warning alert-dismissible"'
     + 'role="alert"><button type="button" class="close" data-dismiss="alert"><span'
     + 'aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
     + '<b>Error:</b> ' + error + '</div>');
}

function addSuccess(success) {
    $('.content').prepend('<div class="alert alert-success alert-dismissible"'
     + 'role="alert"><button type="button" class="close" data-dismiss="alert"><span'
     + 'aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
     + '<b>Success:</b> ' + success + '</div>');
}

function setContent(className) {
    //get unchanged content from storage and stick it into content DIV
    $('.content').empty().html($('.contents .' + className).html());
}

function setSidebar(className) {
    //get unchanged content from storage and stick it into sidebar DIV
    $('.sidebar').empty().html($('.sidebars .' + className).html());
}

function setMenuContext(type) {
    $('.navbar-links').children().hide(); //reset menu
    $('.navbar-links .' + type).show(); //show menu
}

function setActiveMenuLink(link) {
    $('.navbar-nav li').removeClass('active');
    $('.navbar-nav .' + link).addClass('active');
}