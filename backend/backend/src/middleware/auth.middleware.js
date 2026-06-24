import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "Authentication required",
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "organizationId",
        "roleId",
        "isActive"
      ],

      include: [
        {
          model: Role,
          as: "role",

          attributes: [
            "id",
            "name",
            "isActive"
          ],

          include: [
            {
              model: Permission,
              as: "permissions",

              attributes: [
                "id",
                "name",
                "code"
              ],

              through: {
                attributes: []
              }
            }
          ]
        }
      ]
    });

    if (!user) {
      return next(
        new AppError(
          "User not found",
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | User Active Check
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      return next(
        new AppError(
          "Account is inactive",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Role Exists Check
    |--------------------------------------------------------------------------
    */

    if (!user.role) {
      return next(
        new AppError(
          "Role not found",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Role Active Check
    |--------------------------------------------------------------------------
    */

    if (!user.role.isActive) {
      return next(
        new AppError(
          "Role is inactive",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    req.user = user;

    next();

  } catch (error) {
    next(
      new AppError(
        "Invalid or expired token",
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }
};

export default auth;