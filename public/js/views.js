/* View Functions */

//when the screen is small, we
//add a scrollbar that is too
//close to the footer of the
//table; this makes it further

function tableScrollHandler() {
    if ($('.panel-table').length > 0) {
        if ($('.panel-table')[0].scrollWidth > $('.panel-table').innerWidth()) {
            $('.dataTables_paginate').css('margin-bottom', '13px');
        }
        
        else {
            $('.dataTables_paginate').css('margin-bottom', '0px');
        }
    }
}

//responsive design for tables
$(window).load(tableScrollHandler);
$(window).on('resize', tableScrollHandler);

//make the navbar collapse
//at two lines rather than
//at responsive breakpoint

function autoCollapseBar() {
    var navbar = $('.navbar-collapse');
    navbar.removeClass('collapsed');
    if (navbar.innerHeight() > 50) {
        navbar.addClass('collapsed');
    }
}

//tweaking responsive navbar
$(window).load(autoCollapseBar);
$(window).on('resize', autoCollapseBar);

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
    //get unchanged content from fragments and stick it into content DIV
    $('.main').empty().html(getFragment('.content-storage .' + className));
}

function setUsername(username) {
    $('.user').html(username + '<a href="' + base + '/notifications"><span class="badge" id="notify-count">12</span></a>');
}

function setMenuContext(type, options) {
    $('.navbar-links .link-group').remove(); //reset menu
    var fragment = getFragmentOuter('.menu-storage .' + type);
    
    if (typeof options !== 'undefined') {
        _.each(options, function(val, key) {
            fragment = fragment.split(':' + key).join(val.toString());
        });
    }
    
    $('.navbar-links').prepend(fragment); //show menu
}

function setActiveMenuLink(link) {
    $('.navbar-nav li').removeClass('active');
    $('.navbar-nav .' + link).addClass('active');
}