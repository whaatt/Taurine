/* Routes */

//handy globals
var state = {};
var signed = false;
var matched = false;
var permed = false;
var subjects = [];
var deleteConfirm = 0;

var subjectsAdd = [];
var subjectsUpdate = [];
var subjectsRemove = [];
var subjectsOriginal = [];
var subjectsList = [];

var alerts = {
    error : [],
    success : []
};

//check auth
page(logState);

page('/', welcome);
page('/forgot', forgot);
page('/register', register);

page('/login', login); //base login
page('/login/:redir(*)', loginRedirect);
page('/confirm/:UID/:CID', confirm);

page('/dashboard', dashboard);
page('/create', create);
page('/join', join);
page('/account', account);
page('/logout', logout);

//middleware
page('/set/:SID', setState)
page('/set/:SID/*', setState)

page('/set/:SID', set);
page('/set/:ID/edit', edit);

//default route
page(welcome);

//post process
page(process);

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