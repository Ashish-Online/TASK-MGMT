import Permission from '../models/permission.model.js';

import { PERMISSIONS }
from '../constants/permissions.js';

export const seedPermissions = async () => {

  const permissions = Object.values(
    PERMISSIONS
  );

  for (const permission of permissions) {

    await Permission.findOrCreate({
      where: {
        code: permission
      },

      defaults: {
        name: permission
          .replaceAll('_', ' ')
          .toUpperCase(),

        code: permission
      }
    });

  }

  console.log(
    '✅ Permissions Seeded'
  );

};