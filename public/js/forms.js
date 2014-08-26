/* Form Handlers */

$(document).ready(function() {

    $('#register-form').submit(function(event) {
        event.preventDefault();
        $('.content').remove('.alert');
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
                _.each(reply.data.errors, addError);
                $('#register-button').prop('disabled', false);
            }
            
            else {
                addSuccess('Please check your email to confirm your registration.');
            }
        });
    });

});