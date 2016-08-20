var config = require('../../server/config.json');
var path = require('path');

module.exports = function(user) {

  user.afterRemote('confirm', function(context, result, next){

    //if the user is confirmed he will get the first role in the list
    var role = config.custom.roles[0];

    user.app.models.AppUser.addRole(context.req.query.uid, role, function(err){
      if(err) throw err;

      return next();
    });
  });

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

  //user.disableRemoteMethod('__get__roles', false);

  /**
   * Get all Roles (name and id) of a user (by userId)
   */
  user.roles = function(id, cb) {
    user.app.models.RoleMapping.find({
      where: {
        'principalId': id,
        'principalType': 'USER'
      },
      include: ['role']
    }, function(err, roles){

        cb(null,
          roles.map(
            function(role){
              var roleObj = role.toJSON();
              return {
                "id": roleObj.role.id,
                "name": roleObj.role.name
              };
            }
          )
        );
      }
    );
  }

  /*user.remoteMethod(
      'roles',
      {
        accessType: 'READ',
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'string'},
        http: {path: '/:id/roles', verb: 'get'}
      }
  );*/


  /**
   * Add the user to the given role by name.
   * (original source: https://gist.github.com/leftclickben/aa3cf418312c0ffcc547)
   * @param {string} roleName
   * @param {Function} callback
   */
  user.addRole = function(id, rolename, callback) {
      var Role = user.app.models.Role;
      var RoleMapping = user.app.models.RoleMapping;

      var error, userId = id;
      Role.findOne(
          {
              where: { name: rolename }
          },
          function(err, role) {
              if (err) {
                  return callback(err);
              }

              if (!role) {
                  error = new Error('Role ' + rolename + ' not found.');
                  error['http_code'] = 404;
                  return callback(error);
              }

              RoleMapping.findOne(
                  {
                      where: {
                          principalType: RoleMapping.USER,
                          principalId: userId,
                          roleId: role.id
                      }
                  },
                  function(err, roleMapping) {
                      if (err) {
                          return callback(err);
                      }

                      if (roleMapping) {
                          return callback();
                      }
                      role.principals.create(
                          {
                              principalType: RoleMapping.USER,
                              principalId: userId
                          },
                          callback
                      );
                  }
              );
          }
      );
  };
  user.remoteMethod(
      'addRole',
      {
        accepts: [
          {arg: 'id', type: 'string'},
          {arg: 'rolename', type: 'string' }
        ],
        http: {path: '/:id/roles', verb: 'put'}
      }
  );

  /**
   * Remove the user from the given role by name.
   * (original source: https://gist.github.com/leftclickben/aa3cf418312c0ffcc547)
   *
   * @param {string} roleName
   * @param {Function} callback
   */
  user.removeRole = function(id, rolename, callback) {
    var Role = user.app.models.Role;
    var RoleMapping = user.app.models.RoleMapping;

      var error, userId = id;
      console.log("delete", rolename);
      console.log("from", id);
      Role.findOne(
          {
              where: { name: rolename }
          },
          function(err, roleObj) {
              if (err) {
                  return callback(err);
              }

              if (!roleObj) {
                  error = new Error('Role ' + rolename + ' not found.');
                  error['http_code'] = 404;
                  return callback(error);
              }
              console.log(roleObj);
              RoleMapping.findOne(
                  {
                      where: {
                          principalType: RoleMapping.USER,
                          principalId: userId,
                          roleId: roleObj.id
                      }
                  },
                  function(err, roleMapping) {
                      if (err) {
                          return callback(err);
                      }

                      if (!roleMapping) {
                          return callback();
                      }
                      console.log(roleMapping);

                      roleMapping.destroy(callback);
                  }
              );
          }
      );
  };
  user.remoteMethod(
      'removeRole',
      {
          description: 'Remove User to the named role',
          accessType: 'WRITE',
          accepts: [
            {arg: 'id', type: 'string' },
            {arg: 'rolename', type: 'string' }
          ],
          http: {path: '/:id/roles/:rolename', verb: 'delete'}
      }
  );

  user.disableRemoteMethod('__create__roles', false);
  user.disableRemoteMethod('__delete__roles', false);
  user.disableRemoteMethod('__link__roles', false);
  user.disableRemoteMethod('__unlink__roles', false);
  user.disableRemoteMethod('__findById__roles', false);
  user.disableRemoteMethod('__updateById__roles', false);
  user.disableRemoteMethod('__destroyById__roles', false);
  user.disableRemoteMethod('__exists__roles', false);

};
