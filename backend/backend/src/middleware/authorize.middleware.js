import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {

    /*
    |--------------------------------------------------------------------------
    | User Exists
    |--------------------------------------------------------------------------
    */

    if (!req.user) {
      return next(
        new AppError(
          "Authentication required",
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Role Exists
    |--------------------------------------------------------------------------
    */

    if (!req.user.role) {
      return next(
        new AppError(
          "Role not found",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Permissions Exists
    |--------------------------------------------------------------------------
    */

    const permissions =
      req.user.role.permissions || [];

    const userPermissions =
      permissions.map(
        permission => permission.code
      );

    /*
    |--------------------------------------------------------------------------
    | Permission Check
    |--------------------------------------------------------------------------
    */

    const hasPermission =
      requiredPermissions.some(
        permission =>
          userPermissions.includes(permission)
      );

    if (!hasPermission) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};

export default authorize;