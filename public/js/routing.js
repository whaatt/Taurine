/* Routes */

page('/', welcome);
page('/forgot', forgot);
page('/register', register);

page('/login', login); //base login
page('/login/:redir(*)', loginRedirect);
page('/confirm/:UID/:CID', confirm);

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

//initialize page
page.base(base);