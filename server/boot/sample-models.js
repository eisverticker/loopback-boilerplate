module.exports = function(server){
  var User = server.models.AppUser,
      Role = server.models.Role,
      RoleMapping = server.models.RoleMapping;

  /**
   * First create the user named Admin
   * then create the role administrator
   * then assign this role to user Admin
   */
  console.log("findOrCreate");
  var adminUserName = 'Administrator';
  User.findOrCreate(
    {
      where: {
        'username': adminUserName
      }
    },{
      username: adminUserName,
      email: 'foobar3@no-spam.ws',
      password: '+rA4uswatHaP',
      emailVerified: true
    }, function(err, user){
      if(err) throw err;
      console.log('Created User:', user);

      Role.findOrCreate({
        where: {
          name: 'administrator'
        }
      },{
        name: 'administrator'
      },function(err, role){
        if(err) throw err;
        console.log('Created role:', role);

        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: user.id
        }, function(err, principal){
          if(err) throw err;
          console.log('Created principal:', principal);
          /*Role.isInRole('administrator', ctx, function(){
            console.log("wwwoowww");
          });*/
        });
      });
    }
  );


}
