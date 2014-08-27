/* Page Helpers */

//get forced to dashboard
function dashForce(ctx) {
    forceDash = true;
    page('/dashboard');
}

//figure out if user is logged in
function logState(ctx, next) {
    makeGET('/api/user', function(reply) {
        if ('errors' in reply.data &&
            $.inArray(reply.data.errors, 'notLoggedIn')){
            signed = false; //not signed in
            setMenuContext('logged-out');
            setUsername('Anonymous');
        }
        
        else {
            signed = true; //signed in
            setMenuContext('logged-in');
            setUsername(reply.data.username);
        }
        
        //middle
        next();
    });
}

/* Page Handlers */

function welcome(ctx) {
    if (signed) {
        //redirected
        page('/dashboard');
        return false;
    }
    
    setContent('welcome');
    setSidebar('welcome');
    setActiveMenuLink('welcome');
    
    //must be after others
    if (loggingOut === true) {
        addSuccess(success.logout);
        loggingOut = false; //reset state
    }
}

//based on login page
function confirm(ctx) {
    if (signed) {
        //redirected
        dashForce()
        return false;
    }
    
    var UID = ctx.params.UID;
    var CID = ctx.params.CID;
    page('/login');
    
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
    if (signed) {
        //redirected
        dashForce()
        return false;
    }
    
    setContent('forgot');
    setSidebar('forgot');
    setActiveMenuLink('forgot');
}

function login(ctx) {
    if (signed) {
        //redirected
        dashForce()
        return false;
    }
    
    setContent('login');
    setSidebar('login');
    setActiveMenuLink('login');
}

function loginRedirect(ctx) {
    if (signed) {
        //redirected
        dashForce()
        return false;
    }
    
    //set global redir to URL param
    redir = ctx.params.redir;
    
    setContent('login');
    setSidebar('login');
    setActiveMenuLink('login');
}

function register(ctx) {
    if (signed) {
        //redirected
        dashForce()
        return false;
    }
    
    setContent('register');
    setSidebar('register');
    setActiveMenuLink('register');
}

/* Dashboard Perspective */

function dashboard(ctx) {
    setContent('dashboard');
    setSidebar('dashboard');
    setActiveMenuLink('dashboard');
    
    //must be after others
    if (forceDash === true) {
        addError(errors.alreadyLoggedIn);
        forceDash = false; //reset state
    }
    
    //must be after others
    if (loggingIn === true) {
        addSuccess(success.login);
        loggingIn = false; //reset state
    }
}

function logout(ctx) {
    makePOST('/api/user/logout', {}, function(reply) {
        if (!reply.success) {
            _.each(reply.data.errors, function(val){ addError(errors[val]); });
        }
        
        else {
            page('/'); //home
            loggingOut = true;
        }
    });
}