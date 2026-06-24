import {Permission} from "../models/index.js";

export const getPermissionsService = async () => {
  return await Permission.findAll({
    attributes: ["id", "name", "code"],

    order: [["id", "ASC"]],
  });
};
