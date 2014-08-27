/* Routes */

//handy globals
var signed = false;
var forceDash = false;
var loggingOut = false;
var loggingIn = false;

//middleware
page(logState);

page('/', welcome);
page('/forgot', forgot);
page('/register', register);

page('/login', login); //base login
page('/login/:redir(*)', loginRedirect);
page('/confirm/:UID/:CID', confirm);

page('/dashboard', dashboard);
page('/logout', logout);

//default route
page('*', welcome);

//normalize internal URLs to base
$('[href]').each(function() {
    var link = $(this).attr('href');
    if (link.substr(0, 7) !== 'http://' &&
        link.substr(0, 8) !== 'https://') {
        $(this).attr('href', base + link);
    }
});

//initialize page
page.base(base);