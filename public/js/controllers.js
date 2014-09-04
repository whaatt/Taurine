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
            state.user = reply.data.user;
        }
        
        //reset matched
        matched = false;
        
        //middle
        next();
    });
}

function setState(ctx, next) {
    if (!signed) {
        alerts.error.push(errors.notLoggedIn);
        page('/login' + ctx.pathname); return false;
    }
    
    makeGET('/api/sets/' + ctx.params.SID + '/role', function(reply) {
        if ('errors' in reply.data &&
            $.inArray(reply.data.errors, 'noPerms')){
            alerts.error.push(errors.noPerms);
            page('/dashboard'); return false;
        }
        
        else {
            state.role = reply.data.role;
            state.SID = ctx.params.SID;
            
            if (state.role === 'Director' ||
                state.role === 'Administrator') {
                setMenuContext('set-privileged', {SID : state.SID});
            }
            
            else {
                setMenuContext('set-normal', {SID : state.SID});
            }
        }
        
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
    setActiveMenuLink('dashboard');
    
    makeGET('/api/sets', function(reply) {
        setContent('dashboard');
        $('#dashboard-sets').DataTable({
            language : {
                lengthMenu : '_MENU_',
                searchPlaceholder : 'Search sets.',
                zeroRecords : 'No sets found. Would you like to <a href="' + base
                    + '/create' + '">create</a> or <a href="' + base + '/join'
                    + '">join</a> one?',
                search : ''
            },
            lengthMenu : [[10, 25, 50, -1], ['Show 10 Items', 'Show 25 Items', 'Show 50 Items', 'Show All Items']],
            data : reply.data.sets,
            columns : [
                {
                    title : 'ID',
                    data : 'ID', 
                    render : function(data, type, full, meta) {
                        return '<a href="' + base + '/set/'
                        + data.toString() + '">' + data.toString()
                        + '</a>'; //link to /base/set/:SID
                    }},
                {title : 'Set Name', data : 'name'},
                {title : 'Your Role', data : 'access'},
                {title : 'Director', data : 'directorName'},
                {
                    title : 'Target Date',
                    data : 'targetDate',
                    render : function(data, type, full, meta) {
                        if (type === 'sort') return data;
                        var out = moment(data).format('D MMMM YYYY');
                        if (out !== 'Invalid date') return out;
                        else { return 'None Set'; }
                    }}
            ]
        });
        
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

function join(ctx, next) {
    if (!signed) {
        alerts.error.push(errors.notLoggedIn);
        page('/login' + ctx.pathname); return false;
    }
    
    setMenuContext('logged-in');
    setUsername(state.user.username);

    setContent('join');
    setActiveMenuLink('join');
    
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
    
    $('#account-name').valSafe(state.user.name);
    $('#account-email').valSafe(state.user.email);
    
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

/* Set Perspective */

function set(ctx, next) {
    //signed check handled by setState
    //menu is handled by setState
    setUsername(state.user.username);
    setActiveMenuLink('set');
    
    makeGET('/api/sets/' + state.SID, function(reply) {
        makeGET('/api/sets/' + state.SID + '/members', function(replyB) {
            makeGET('/api/sets/' + state.SID + '/subjects', function(replyC) {
                setContent('set');
                subjectsList = replyC.data.subjects;
                
                $('#set-name-box').html(reply.data.set.name);
                $('#set-ID-box').html(reply.data.set.ID);
                $('#set-password-box').next('div').html(reply.data.set.password);
                $('#set-director-box').html(reply.data.set.directorName);
                $('#set-schema-box').html(reply.data.set.schema);

                //get human readable version of the database date string
                var out = moment(reply.data.set.targetDate).format('D MMMM YYYY');

                if (reply.data.set.info !== null) $('#set-info-box').html(reply.data.set.info);
                if (!reply.data.set.visibility) $('#set-visibility-box').html('Not Searchable');
                if (out !== 'Invalid date') $('#set-target-box').html(out);
                
                $('#set-members').DataTable({
                    drawCallback : function() {
                        tip();
                        
                        var selector = $('#set-members').DataTable()
                            .column(2)
                            .nodes()
                            .to$();
                        
                        $(selector).each(function() {
                            $(this).removeClass('danger')
                                .removeClass('info');
                            
                            if ($(this).html() === 'Director' ||
                                $(this).html() === 'Administrator') {
                                $(this).addClass('danger');
                            }
                            
                            else if ($(this).html() === 'Editor') {
                                $(this).addClass('info');
                            }
                        });
                    },
                    language : {
                        lengthMenu : '_MENU_',
                        searchPlaceholder : 'Search members.',
                        zeroRecords : 'No members found. This is weird.',
                        search : ''
                    },
                    lengthMenu : [[10, 25, 50, -1], ['Show 10 Items', 'Show 25 Items', 'Show 50 Items', 'Show All Items']],
                    data : replyB.data.members,
                    columns : [
                        {title : 'Name', data : 'name'},
                        {title : 'Username', data : 'username'},
                        {title : 'Role', data : 'role'},
                        {
                            title : 'Focus',
                            data : 'focus',
                            render : function(data, type, full, meta) {
                                if (data.length === 0) {
                                    return 'None Set';
                                }
                                
                                else if (data.length === 1) {
                                    return data[0][1];
                                }
                                
                                else {
                                    var tipText = ''; var first = true;
                                    _.each(data, function(subject) {
                                        if (first) tipText += subject[1];
                                        else tipText += '<br>' + subject[1];
                                        first = false; //after first
                                    });
                                    
                                    return tooltip('Hover To See', tipText, 'top left', 'bottom right');
                                }
                            }},
                        {
                            title : 'Settings',
                            data : 'MID',
                            render : function(data, type, full, meta) {
                                if (full.role !== 'Director' &&
                                    parseInt(data) !== state.user.ID) {
                                    return '<a href="javascript: void(null);" '
                                        + 'data-id="' + data.toString() + '" '
                                        + 'data-index="' + meta.row.toString() + '" '
                                        + 'class="update-member">Update Member'
                                        + '</a>'; //cannot edit yourself
                                }
                                
                                else {
                                    return 'Update Member';
                                }
                            }}
                    ]
                });
            
                matched = true;
                next(); //middleware
            });
        });
    });
}

function edit(ctx, next) {
    //signed check handled by setState
    //menu is handled by setState
    setUsername(state.user.username);
    setActiveMenuLink('edit');
    
    makeGET('/api/sets/' + state.SID, function(reply) {
        setContent('edit');
        subjectsAdd = [];
        subjectsUpdate = [];
        subjectsRemove = [];
        subjectsOriginal = [];
    
        $('#edit-name').valSafe(reply.data.set.name);
        $('#edit-info').valSafe(reply.data.set.info);
        $('#edit-target').valSafe(reply.data.set.targetDate);
        $('#edit-password').valSafe(reply.data.set.password);
        $('#edit-schema').valSafe(reply.data.set.schema);
        $('#edit-visibility').valSafe(reply.data.set.visibility.toString());

        if (reply.data.set.config[0] !== 0)
            $('#edit-tossups').valSafe(reply.data.set.config[0].toString());
        if (reply.data.set.config[1] !== 0)
            $('#edit-bonuses').valSafe(reply.data.set.config[1].toString());
        if (reply.data.set.config[2] !== 0)
            $('#edit-packets').valSafe(reply.data.set.config[2].toString());
        
        //initialize date and time picker
        $('#target-date').datetimepicker();
        
        var origIndex = 0;
        _.each(reply.data.set.subjects, function(subject) {
            if ($('#subject-list').hasClass('none-added')) {
                $('#subject-list').empty()
                    .removeClass('none-added');
            }
            
            var truncated = subject[1];
            if (subject[1].length > 10) {
                truncated = subject[1]
                    .substring(0, 10) //clamp
                    + '&hellip;'; //add ellipsis
            }
        
            $('#subject-list').append('<span class="subject">' + truncated
                + ' (' + subject[2].toString() //number of tossups
                + '/' + subject[3].toString() //number of bonuses
                + ') [<a href="javascript: void(null);" data-id="'
                + subject[0].toString() + '" data-index="' 
                + origIndex.toString() + '" class="remove">Remove</a>] '
                + '[<a href="javascript: void(null);" data-id="'
                + subject[0].toString() + '" data-index="' 
                + origIndex.toString() + '" class="update">Update</a>]<br></span>');
                
            subjectsOriginal.push(subject);
            origIndex = origIndex + 1;
        });
    
        matched = true;
        next(); //middleware
    });
}