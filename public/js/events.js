/* Event Handlers */
/* Registration Form */

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
            $('#register-button').prop('disabled', false);
        }
        
        else {
            addSuccess(success.register);
        }
    });
});

/* Forgot Form */

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
            $('#forgot-button').prop('disabled', false);
        }
        
        else {
            addSuccess(success.forgot);
        }
    });
});

/* Login To Account */

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
            $('#login-button').prop('disabled', false);
        }
        
        else {
            alerts.success.push(success.login);
            if (redir === '') { page('/dashboard'); }
            else { page('/' + redir); redir = ''; } //followthrough
        }
    });
});

/* Create Set */

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
            + ') [<a href="javascript: void(null);" class="remove" '
            + 'data-index="' + lastID.toString() + '">Remove</a>]<br></span>');
        
        $('#create-subject').valSafe('');
        $('#create-subject-TU').valSafe('');
        $('#create-subject-B').valSafe('');
    }
});

/* Add Subject To New Set */

$(document).on('click', '#create-form .subject .remove', function(event) {
    subjects.splice(parseInt($(this).attr('data-index')), 1);
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
            $('#create-button').prop('disabled', false);
        }
        
        else {
            addSuccess(success.create);
        }
    });
});

/* Edit Account Info */

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
            $('#account-button').prop('disabled', false);
        }
        
        else {
            addSuccess(success.account);
            state.user.name = reply.name;
            state.user.email = reply.email;
        }
    });
});

/* Join Set */

$(document).on('submit', '#join-form', function(event) {
    event.preventDefault();
    $('#join-button').prop('disabled', true);
    
    var request = {
        ID : $('#join-ID').val(),
        password : $('#join-password').val()
    }
    
    makePOST('/api/sets/join', request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#join-button').prop('disabled', false);
        }
        
        else {
            addSuccess(success.join);
        }
    });
});

/* Add Subject While Editing Set */

$(document).on('click', '#edit-subject-button', function(event) {
    event.preventDefault();
    if ($('#edit-subject').val() !== '') {
        var name = $('#edit-subject').val();
        var TUs = parseFloat($('#edit-subject-TU').val());
        var bonuses = parseFloat($('#edit-subject-B').val());
        
        if (isNaN(parseInt(TUs)) || parseInt(TUs) <= 0) TUs = 0;
        if (isNaN(parseInt(bonuses)) || parseInt(bonuses) <= 0) bonuses = 0;
        
        //truncate to two decimal places
        TUs = Math.floor(TUs * 100) / 100;
        bonuses = Math.floor(bonuses * 100) / 100;
        
        subjectsAdd.push([name, TUs, bonuses]);
        var lastID = subjectsAdd.length - 1;
        
        if ($('#subject-list').hasClass('none-added')) {
            $('#subject-list').empty()
                .removeClass('none-added');
        }
        
        var truncated = subjectsAdd[lastID][0];
        if (subjectsAdd[lastID][0].length > 16) {
            truncated = subjectsAdd[lastID][0]
                .substring(0, 16) //clamp
                + '&hellip;'; //add ellipsis
        }
        
        $('#subject-list').append('<span class="subject">' + truncated
            + ' (' + subjectsAdd[lastID][1].toString() //number of tossups
            + '/' + subjectsAdd[lastID][2].toString() //number of bonuses
            + ') [<a href="javascript: void(null);" data-id="0" '
            + 'data-index="' + lastID.toString() //for splicing later
            + '" class="remove">Remove</a>]<br></span>');
        
        $('#edit-subject').valSafe('');
        $('#edit-subject-TU').valSafe('');
        $('#edit-subject-B').valSafe('');
    }
});

/* Remove Subject */

$(document).on('click', '#edit-form .subject .remove', function(event) {    
    if ($(this).attr('data-id') === '0') {
        subjectsAdd.splice(parseInt($(this).attr('data-index')), 1);
        $(this).parent().remove();
        
        if ($('#subject-list').html() === '') {
            $('#subject-list').addClass('none-added');
            $('#subject-list').html('No subjects added.');
        }
    }
    
    else {
        $('.modals').empty().append(getFragmentOuter('.modal-storage #remove-subject-modal'));
        $('#confirm-remove-subject').attr('data-id', $(this).attr('data-id'));
        $('.modals #remove-subject-modal').modal(); //launch modal after copying and pasting
    }
});

$(document).on('click', '#confirm-remove-subject', function(event) {
    subjectsRemove.push(parseInt($(this).attr('data-id'))); $('.modal').modal('hide');
    $('.subject .remove[data-id="' + $(this).attr('data-id') + '"]').parent().remove();
});

/* Edit Subject */

$(document).on('click', '#edit-form .subject .update', function(event) {    
    $('.modals').empty().append(getFragmentOuter('.modal-storage #update-subject-modal'));
    $('#update-subject').valSafe(subjectsOriginal[parseInt($(this).attr('data-index'))][1].toString());
    $('#update-subject-TU').valSafe(subjectsOriginal[parseInt($(this).attr('data-index'))][2].toString());
    $('#update-subject-B').valSafe(subjectsOriginal[parseInt($(this).attr('data-index'))][3].toString());
    
    $('#confirm-update-subject').attr('data-id', $(this).attr('data-id'));
    $('.modals #update-subject-modal').modal(); //launch modal after copying and pasting
});

$(document).on('click', '#confirm-update-subject', function(event) {
    event.preventDefault();
    if ($('#update-subject').val() !== '') {
        var SBID = parseInt($(this).attr('data-id'));
        var name = $('#update-subject').val();
        var TUs = parseFloat($('#update-subject-TU').val());
        var bonuses = parseFloat($('#update-subject-B').val());
        
        if (isNaN(parseInt(TUs)) || parseInt(TUs) <= 0) TUs = 0;
        if (isNaN(parseInt(bonuses)) || parseInt(bonuses) <= 0) bonuses = 0;
        
        //truncate to two decimal places
        TUs = Math.floor(TUs * 100) / 100;
        bonuses = Math.floor(bonuses * 100) / 100;
        
        subjectsUpdate.push([SBID, name, TUs, bonuses]);
        var lastID = subjectsUpdate.length - 1;
        
        var truncated = subjectsUpdate[lastID][1];
        if (subjectsUpdate[lastID][1].length > 10) {
            truncated = subjectsUpdate[lastID][1]
                .substring(0, 10) //clamp
                + '&hellip;'; //add ellipsis
        }
        
        $('.subject .update[data-id="' + SBID.toString() + '"]').parent()
            .empty().append(truncated //replace old subject entry with new
            + ' (' + subjectsUpdate[lastID][2].toString() //number of tossups
            + '/' + subjectsUpdate[lastID][3].toString() //number of bonuses
            + ') [<a href="javascript: void(null);" data-id="' + SBID.toString()
            + '" class="remove">Remove</a>] [<a href="javascript: void(null);" data-id="'
            + SBID.toString() + '" class="update">Update</a>]<br></span>');
        
        $('#update-subject').valSafe('');
        $('#update-subject-TU').valSafe('');
        $('#update-subject-B').valSafe('');
        $('.modal').modal('hide');
    }
});

/* Edit Set */

$(document).on('submit', '#edit-form', function(event) {
    event.preventDefault();
    $('#edit-button').prop('disabled', true);
    
    var request = {
        name : $('#edit-name').val(),
        password : $('#edit-password').val(),
        target : $('#edit-target').val(),
        info : $('#edit-info').val(),
        subjectsAdd : subjectsAdd,
        subjectsUpdate : subjectsUpdate,
        subjectsRemove : subjectsRemove,
        config : [
            parseInt($('#edit-tossups').val()),
            parseInt($('#edit-bonuses').val()),
            parseInt($('#edit-packets').val())
        ], 
        schema : $('#edit-schema').val(),
        visibility : $('#edit-visibility') === 'true'
    };
    
    makePUT('/api/sets/' + state.SID, request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('#edit-button').prop('disabled', false);
            $('.modal').modal('hide');
        }
        
        else {
            addSuccess(success.edit);
        }
    });
});

/* Delete Set */

$(document).on('click', '#edit-delete-button', function(event) {
    event.preventDefault();
    
    $('.modals').empty().append(getFragmentOuter('.modal-storage #delete-set-modal'));
    $('.modals #delete-set-modal').modal(); //launch modal after copying and pasting
});

$(document).on('click', '#confirm-delete-set', function(event) {
    event.preventDefault();
    
    if (deleteConfirm === 0) {
        $('#confirm-delete-set').html('Again');
        deleteConfirm = deleteConfirm + 1;
    }
    
    else if (deleteConfirm === 1) {
        $('#confirm-delete-set').html('Almost');
        deleteConfirm = deleteConfirm + 1;
    }
    
    else if (deleteConfirm === 2) {
        $('#confirm-delete-set').html('Delete')
            .removeClass('btn-info') //real shit
            .addClass('btn-danger');
        
        //on the count of three...
        deleteConfirm = deleteConfirm + 1;
    }
    
    else {
        deleteConfirm = 0; //reset to normal
        makeDEL('/api/sets/' + state.SID, function(reply) {
            if (!reply.success) {
                addErrors(reply.data.errors, reply.data.errorParams);
            }
            
            else {
                alerts.success.push(success.del);
                $('#edit-delete-button').prop('disabled', true)
                $('.modal').modal('hide'); page('/dashboard');
            }
        });
    }
});

/* Update Member */

$(document).on('click', '.update-member', function(event) {
    event.preventDefault();
    
    $('.modals').empty().append(getFragmentOuter('.modal-storage #update-member-modal'));
    $('.modals #update-member-modal').modal(); //launch modal after copying and pasting
    
    var rowData = $('#set-members').DataTable()
        .row($(this).attr('data-index')).data()
        
    var selectRole = rowData.role;
    var foci = _.map(rowData.focus, function(subject) {
        return subject[0].toString();
    });
    
    _.each(subjectsList, function(subject) {
        $('#update-member-focus').append($('<option>', {
            value: subject[0],
            text: subject[1]
        }));
    });
    
    $('#confirm-update-member').attr('data-id', $(this).attr('data-id'));
    $('#confirm-update-member').attr('data-index', $(this).attr('data-index'));
    $('#update-member-focus').valSafe(foci);
    
    $('#update-member-role').valSafe(selectRole);
    if (selectRole !== 'Editor') $('#update-member-focus').parent().hide();
});

$(document).on('change', '#update-member-role', function(event) {
    event.preventDefault();
    var selectRole = $('#update-member-role').val();
    if (selectRole !== 'Editor') $('#update-member-focus').parent().hide();
    else $('#update-member-focus').parent().show();
});

$(document).on('click', '#confirm-update-member', function(event) {
    event.preventDefault();
    var request = {
        role : $('#update-member-role').val(),
        focus : _.map($('#update-member-focus').val(), function(subject) {
            return parseInt(subject);
        })
    };
    
    var MID = $(this).attr('data-id');
    var context = this;
    
    makePUT('/api/sets/' + state.SID + '/members/' + MID, request, function(reply) {
        if (!reply.success) {
            addErrors(reply.data.errors, reply.data.errorParams);
            $('.modal').modal('hide');
        }
        
        else {
            var row = $('#set-members').DataTable()
                .row(parseInt($(context).attr('data-index')))
            
            var edit = row.data();
            edit.role = request.role;
            edit.focus = _.filter(subjectsList, function(subject) {
                if (edit.role === 'Editor' &&
                    request.focus.indexOf(subject[0]) !== -1) return true;
                else return false;
            });
            
            row.data(edit).draw();
            $('.modal').modal('hide');
        }
    });
});