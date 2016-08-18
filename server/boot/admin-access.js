(function () {
    'use strict';

    // Relevant resource: https://gist.github.com/spencermefford/bc73812f216e0e254ad1
    module.exports = function (server, callback) {
        var ACL = server.models.ACL,
            AppUser = server.models.AppUser,
            Role = server.models.Role,
            RoleMapping = server.models.RoleMapping;

        // Ensure that the `administrator` role has access to list users.
        /*ACL.findOrCreate(
            {
                model: 'AppUser',
                principalType: 'ROLE',
                principalId: 'administrator',
                property: '*',
                accessType: '*',
                permission: 'ALLOW'
            },
            callback
        );

        // Relate Users to Roles so that they can be queried using the `include` filter.
        AppUser.hasMany(
            Role,
            {
                through: RoleMapping,
                foreignKey: 'principalId'
            }
        );*/

        // Remove unwanted remote methods that we are overriding
        AppUser.disableRemoteMethod('__create__roles', false);
        AppUser.disableRemoteMethod('__delete__roles', false);
        AppUser.disableRemoteMethod('__link__roles', false);
        AppUser.disableRemoteMethod('__unlink__roles', false);
        AppUser.disableRemoteMethod('__findById__roles', false);
        AppUser.disableRemoteMethod('__updateById__roles', false);
        AppUser.disableRemoteMethod('__destroyById__roles', false);
        AppUser.disableRemoteMethod('__exists__roles', false);

        callback();
    };
}());
