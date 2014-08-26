/* Routes */

page('/', welcome);
page('/forgot', forgot);
page('/register', register);

page('/login', login); //base login
page('/login/:redir(*)', loginRedirect);

//KEEP BASE BLANK if no subdomain
base = ''; //CHANGE ME for installs
page.base(base); //set routing base path

//normalize HREF URLs to reflect base
$(document).ready(function() {
    $('[href]').each(function() {
        var link = $(this).attr('href');
        if (link.substr(0, 7) !== 'http://' &&
            link.substr(0, 8) !== 'https://') {
            $(this).attr('href', base + link);
        }
    });
});

//initialize
page.start();