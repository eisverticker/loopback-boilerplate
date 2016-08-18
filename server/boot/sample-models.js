var config = require('../config.json');

module.exports = function(server){
  var User = server.models.AppUser,
      Role = server.models.Role,
      RoleMapping = server.models.RoleMapping;

  /**
   * First create the user named Admin
   * then create the role administrator
   * then assign this role to user Admin
   */
  var roles = config.custom.rbac.roles.slice();
  var isHierachical = config.custom.rbac.hierachical;

  var createRoles = function(roles, lastRoleObj, callback){
    if(roles.length > 0){

      var roleName = roles.pop();

      Role.findOrCreate({
        where: {
          "name": roleName
        }
      },{
        "name": roleName
      }, function(err, roleObj){
        if(err) return err;

        if(lastRoleObj !== null && isHierachical){
          lastRoleObj.principals.create(
              {
                  principalType: RoleMapping.ROLE,
                  principalId: roleObj.id
              },
              function(err){
                if(err) throw err;

                createRoles(roles, roleObj, callback);
              }
          );
        }else{
          createRoles(roles, roleObj, callback);
        }

      });

    }else{

      callback();

    }
  };

  createRoles(roles, null, function(){

    User.findOne({
      where: {
        'username': config.custom.admin.username
      }
    }, function(err, user){
      if(err) throw err;

      if(!user){

        User.create(
          {
            username: config.custom.admin.username,
            email: config.custom.admin.email,
            password: config.custom.admin.password,
            emailVerified: true
          }, function(err, user){
            if(err) throw err;

            User.addRole(user.id, 'administrator', function(err){
              if(err) throw err;

              console.log("Administrator was successfully created");
            });

          }
        );

      }
    });

  });

}
