import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/sequelize.js";

import {
  Organization,
  Permission,
  Role,
  RolePermission,
  User,
  Task,
  Notification,
  TaskComment, 
  TaskActivity, 
  TaskAttachment
} from "./models/index.js";

import { seedPermissions } from "./utils/seedPermissions.js";
import { initializeSocket } from "./socket/index.js";
import { registerSocketEvents } from "./socket/socketEvents.js";
import { waitForDebugger } from "inspector";
// auto run system for send notificaiton
import { startJobs } from "./jobs/index.js";


startJobs();


const startServer = async () => {
  await connectDatabase();

  
  await Organization.sync();
  await Permission.sync();
  await Role.sync();
  await RolePermission.sync();
  await User.sync();
  await Task.sync();
  await Notification.sync();
  await TaskComment.sync();
  await TaskActivity.sync();
  await TaskAttachment.sync();
  
  await seedPermissions();


  /*
  |--------------------------------------------------------------------------
  | Create HTTP Server
  |--------------------------------------------------------------------------
  */

  const server = http.createServer(app);

  /*
  |--------------------------------------------------------------------------
  | Initialize Socket.IO
  |--------------------------------------------------------------------------
  */

  const io = initializeSocket(server);
  // global.io = io;
  registerSocketEvents(io);

  /*
  |--------------------------------------------------------------------------
  | Start Server
  |--------------------------------------------------------------------------
  */

  server.listen(env.PORT, () => {
    console.log(`
================================================
🚀 Server Started Successfully
🌍 Environment : ${env.NODE_ENV}
📡 Port        : ${env.PORT}
================================================
`);
  });
};

startServer();