/* Event Handlers */

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
            alerts.success.push(success.login);
            if (redir === '') { page('/dashboard'); }
            else { page('/' + redir); redir = ''; } //followthrough
        }
    });
});

$(document).on('click', '#create-subject-button', function(event) {
    event.preventDefault();
    if ($('#create-subject').val() !== '') {
        var name = $('#create-subject').val();
        var TUs = parseFloat($('#create-subject-TU').val());
        var bonuses = parseFloat($('#create-subject-B').val());
        
        if (isNaN(parseInt(TUs)) || parseInt(TUs) <= 0) TUs = 0;
        if (isNaN(parseInt(bonuses)) || parseInt(bonuses) <= 0) bonuses = 0;
        
        //truncate to two decimal places
        TUs = Math.floor(TUs * 100) / 100;
        bonuses = Math.floor(bonuses * 100) / 100;
        
        subjects.push([name, TUs, bonuses]);
        var lastID = subjects.length - 1;
        
        if ($('#subject-list').hasClass('none-added')) {
            $('#subject-list').empty()
                .removeClass('none-added');
        }
        
        var truncated = subjects[lastID][0];
        if (subjects[lastID][0].length > 16) {
            truncated = subjects[lastID][0]
                .substring(0, 16) //clamp
                + '&hellip;'; //add ellipsis
        }
        
        $('#subject-list').append('<span class="subject">' + truncated
            + ' (' + subjects[lastID][1].toString() //number of tossups
            + '/' + subjects[lastID][2].toString() //number of bonuses
            + ') [<a href="javascript: void(null);">Remove</a>]<br></span>');
        
        $('#create-subject').val('');
        $('#create-subject-TU').val('');
        $('#create-subject-B').val('');
        $('#create-subject-button').blur();
    }
});

$(document).on('click', '.subject a', function(event) {
    subjects.splice($(this).index(), 1);
    $(this).parent().remove();
    
    if ($('#subject-list').html() === '') {
        $('#subject-list').addClass('none-added');
        $('#subject-list').html('No subjects added.');
    }
});

$(document).on('submit', '#create-form', function(event) {
    event.preventDefault();
    $('#create-button').prop('disabled', true);
    
    var request = {
        name : $('#create-name').val(),
        password : $('#create-password').val(),
        target : $('#create-target').val(),
        info : $('#create-info').val(),
        subjects : subjects, 
        config : [
            parseInt($('#create-tossups').val()),
            parseInt($('#create-bonuses').val()),
            parseInt($('#create-packets').val())
        ], 
        schema : $('#create-schema').val(),
        visibility : $('#create-visibility') === 'true'
    };
    
    makePOST('/api/sets', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#create-button').prop('disabled', false).blur();
        }
        
        else {
            addSuccess(success.create);
        }
    });
});

$(document).on('submit', '#account-form', function(event) {
    event.preventDefault();
    $('#account-button').prop('disabled', true);
    
    var request = {
        name : $('#account-name').val(),
        email : $('#account-email').val(),
        password : $('#account-password').val(),
        confirm : $('#account-confirm').val()
    }
    
    makePOST('/api/user/edit', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#account-button').prop('disabled', false).blur();
        }
        
        else {
            addSuccess(success.account);
            state.user.name = reply.name;
            state.user.email = reply.email;
        }
    });
});