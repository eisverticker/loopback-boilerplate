var config = require('../../server/config.json');
var path = require('path');

module.exports = function(user) {

  var senderMail = 'eisverticker@gmail.com';
  /*user.afterRemote('create', function(context, user, next){
    console.log("Registrierung!" + JSON.stringify(context));
  })*/

  //send verification email after registration
  user.afterRemote('create', function(context, user, next) {
    console.log('> user.afterRemote triggered');

    var options = {
      type: 'email',
      to: user.email,
      from: config.custom.senderMail,
      subject: 'Bestätigung der Registrierung',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) return next(err);

      console.log('> verification email sent:', response);
      return next();
    });
  });


  //send password reset link when requested
  user.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
        info.accessToken.id + '">here</a> to reset your password';

    user.app.models.Email.send({
      to: info.email,
      from: config.custom.senderMail,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

};
