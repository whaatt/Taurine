/* Form Handlers */

$(document).on('submit', '#register-form', function(event) {
    event.preventDefault();
    $('#register-button').prop('disabled', true);
    
    var request = {
        username : $('#register-username').val(),
        password : $('#register-password').val(),
        confirm : $('#register-confirm').val(),
        email : $('#register-email').val(),
        name : $('#register-name').val()
    }
    
    makePOST('/api/user', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#register-button').prop('disabled', false).blur();
        }
        
        else {
            addSuccess(success.register);
        }
    });
});

$(document).on('submit', '#forgot-form', function(event) {
    event.preventDefault();
    $('#forgot-button').prop('disabled', true);
    
    var request = {
        username : $('#forgot-username').val(),
        email : $('#forgot-email').val()
    }
    
    makePOST('/api/user/forgot', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#forgot-button').prop('disabled', false).blur();
        }
        
        else {
            addSuccess(success.forgot);
        }
    });
});

$(document).on('submit', '#login-form', function(event) {
    event.preventDefault();
    $('#login-button').prop('disabled', true);
    
    var request = {
        username : $('#login-username').val(),
        password : $('#login-password').val()
    }
    
    makePOST('/api/user/login', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#login-button').prop('disabled', false).blur();
        }
        
        else {
            //force alert
            loggingIn = true;
            
            if (redir === '') { page('/dashboard'); }
            else { page('/' + redir); } //followthrough
        }
    });
});