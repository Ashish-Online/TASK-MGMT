import {asyncHandler} from "../utils/asyncHandler.js";
import { getPermissionsService } from "../services/permission.service.js";


export const getPermissions = asyncHandler(async (req, res) => {
  const permissions = await getPermissionsService();

  return res.status(200).json({
    success: true,
    data: permissions,
  });
});
