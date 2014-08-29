/* Page Helpers */

//process various things
//show alerts for example
function process(ctx) {
    if (alerts.error.length > 0) {
        _.each(alerts.error, addError);
    }
    
    if (alerts.success.length > 0) {
        _.each(alerts.success, addSuccess);
    }
    
    alerts.error = [];
    alerts.success = [];
    
    //this deals with the load flash
    $('.container').removeClass('hide');
    
    
    //turn off autocomplete globally
    $('form').attr('autocomplete', 'off');
}

//figure out if user is logged in
function logState(ctx, next) {
    makeGET('/api/user', function(reply) {
        if ('errors' in reply.data &&
            $.inArray(reply.data.errors, 'notLoggedIn')){
            signed = false; //not signed in
            delete state.user;
        }
        
        else {
            signed = true; //signed in
            state.user = reply.data;
        }
        
        //reset matched
        matched = false;
        
        //middle
        next();
    });
}

/* Page Handlers */

function welcome(ctx, next) {
    //no route matched
    if (matched === true) {
        next(); //skip to process
        return false;
    }
    
    if (signed) {
        //no alert needed here
        //this is the root route
        page('/dashboard');
        return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    setContent('welcome');
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
    setActiveMenuLink('login');
    
    matched = true;
    next(); //middleware
}

function loginRedirect(ctx, next) {
    if (signed) {
        alerts.success.push(success.redir);
        page('/' + ctx.params.redir); return false;
    }
    
    setMenuContext('logged-out');
    setUsername('Anonymous');
    
    //set global redir to URL param
    redir = ctx.params.redir;
    
    setContent('login');
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
    setUsername(state.user.username);

    setContent('dashboard');
    setActiveMenuLink('dashboard');
    
    makeGET('/api/sets', function(reply) {
        alert(JSON.stringify(reply));
        matched = true;
        next(); //middleware
    });
}

function create(ctx, next) {
    if (!signed) {
        alerts.error.push(errors.notLoggedIn);
        page('/login' + ctx.pathname); return false;
    }

    setMenuContext('logged-in');
    setUsername(state.user.username);

    setContent('create');
    setActiveMenuLink('create');
    
    //empty subjects
    subjects = [];
    
    //initialize date and time picker
    $('#target-date').datetimepicker();
    
    matched = true;
    next(); //middleware
}

function account(ctx, next) {
    if (!signed) {
        alerts.error.push(errors.notLoggedIn);
        page('/login' + ctx.pathname); return false;
    }
    
    setMenuContext('logged-in');
    setUsername(state.user.username);

    setContent('account');
    setActiveMenuLink('account');
    
    $('#account-name').val(state.user.name);
    $('#account-email').val(state.user.email);
    
    matched = true;
    next(); //middleware
}

function logout(ctx, next) {
    makePOST('/api/user/logout', {}, function(reply) {  
        alerts.success.push(success.logout);
        signed = false; //not signed in
        delete state.user; //user session
        
        setMenuContext('logged-out');
        setUsername('Anonymous');
        
        setContent('welcome');
        setActiveMenuLink('welcome');
        
        matched = true;
        next(); //middleware
    });
}