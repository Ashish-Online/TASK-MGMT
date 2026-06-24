import {
  registerOrganizationService,
  loginService,
  changePasswordService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Register Organization controller
export const registerOrganization = asyncHandler(async (req, res) => {
  const result = await registerOrganizationService(req.body);

  return res.status(201).json({
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

// Login Controller
export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

// change password controller
export const changePasswordController = asyncHandler(async (req, res) => {
  const data = await changePasswordService(req.body, req.user);
  return res.status(200).json({ success: true, ...data });
});
