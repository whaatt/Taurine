/* Page Handlers */

function welcome(ctx) {
    setContent('welcome');
    setSidebar('welcome');
    setMenuContext('logged-out');
    setActiveMenuLink('welcome');
}

//based on login page
function confirm(ctx) {
    var UID = ctx.params.UID;
    var CID = ctx.params.CID;
    login(ctx);
    
    makeGET('/api/user/confirm/' + UID + '/' + CID, function(reply) {
        if (!reply.success) {
            _.each(reply.data.errors, function(val){ addError(errors[val]); });
        }
        
        else {
            addSuccess(success.confirm);
        }
    });
}

function forgot(ctx) {
    setContent('forgot');
    setSidebar('forgot');
    setMenuContext('logged-out');
    setActiveMenuLink('forgot');
}

function login(ctx) {
    setContent('login');
    setSidebar('login');
    setMenuContext('logged-out');
    setActiveMenuLink('login');
}

function loginRedirect(ctx) {
    setContent('login');
    setSidebar('login');
    setMenuContext('logged-out');
    setActiveMenuLink('login');
}

function register(ctx) {
    setContent('register');
    setSidebar('register');
    setMenuContext('logged-out');
    setActiveMenuLink('register');
}

function forgot(ctx) {
    setContent('forgot');
    setSidebar('forgot');
    setMenuContext('logged-out');
    setActiveMenuLink('forgot');
}