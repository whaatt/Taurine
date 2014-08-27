/* Page Helpers */

//process arrays of alerts
function processAlerts(ctx, next) {
    if (alerts.error.length > 0) {
        addErrors(alerts.error, null);
    }
    
    if (alerts.success.length > 0) {
        _.each(alerts.success, addSuccess);
    }
    
    alerts.error = [];
    alerts.success = [];
    
    //no route matched
    if (matched !== true) {
        next(); //default route
    }
}

//figure out if user is logged in
function logState(ctx, next) {
    makeGET('/api/user', function(reply) {
        if ('errors' in reply.data &&
            $.inArray(reply.data.errors, 'notLoggedIn')){
            signed = false; //not signed in
        }
        
        else {
            signed = true; //signed in
            user = reply.data.username
        }
        
        //reset matched
        matched = false;
        
        //middle
        next();
    });
}

/* Page Handlers */

function welcome(ctx, next) {
    if (signed) {
        //redirected
        page('/dashboard');
        return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('welcome');
    setSidebar('welcome');
    setActiveMenuLink('welcome');
    
    matched = true;
    next(); //middleware
}

//based on login page
function confirm(ctx, next) {
    if (signed) {
        alerts.error.push(errors.alreadyLoggedIn);
        page('/dashboard'); return false;
    }
    
    var UID = ctx.params.UID;
    var CID = ctx.params.CID;
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('login');
    setSidebar('login');
    setActiveMenuLink('login');
    
    makeGET('/api/user/confirm/' + UID + '/' + CID, function(reply) {
        if (!reply.success) {
            _.each(reply.data.errors, function(val){
                alerts.error.push(errors[val]);
            });
        }
        
        else {
            alerts.success.push(success.confirm);
        }
        
        matched = true;
        next(); //middleware
    });
}

function forgot(ctx, next) {
    if (signed) {
        alerts.error.push(errors.alreadyLoggedIn);
        page('/dashboard'); return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('forgot');
    setSidebar('forgot');
    setActiveMenuLink('forgot');
    
    matched = true;
    next(); //middleware
}

function login(ctx, next) {
    if (signed) {
        alerts.error.push(errors.alreadyLoggedIn);
        page('/dashboard'); return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('login');
    setSidebar('login');
    setActiveMenuLink('login');
    
    matched = true;
    next(); //middleware
}

function loginRedirect(ctx, next) {
    if (signed) {
        alerts.error.push(errors.alreadyLoggedIn);
        page('/dashboard'); return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    //set global redir to URL param
    redir = ctx.params.redir;
    
    setContent('login');
    setSidebar('login');
    setActiveMenuLink('login');
    
    matched = true;
    next(); //middleware
}

function register(ctx, next) {
    if (signed) {
        alerts.error.push(errors.alreadyLoggedIn);
        page('/dashboard'); return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('register');
    setSidebar('register');
    setActiveMenuLink('register');
    
    matched = true;
    next(); //middleware
}

/* Dashboard Perspective */

function dashboard(ctx, next) {
    if (!signed) {
        alerts.error.push(errors.notLoggedIn);
        page('/login' + ctx.pathname); return false;
    }

    setMenuContext('logged-in');
    setUsername(user);

    setContent('dashboard');
    setSidebar('dashboard');
    setActiveMenuLink('dashboard');
    
    matched = true;
    next(); //middleware
}

function logout(ctx, next) {
    makePOST('/api/user/logout', {}, function(reply) {
        alerts.success.push(success.logout);
        page('/'); return true; //home
    });
}