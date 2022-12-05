#!/usr/bin/env node

// read in env settings
const Koa = require("koa");
const app = new Koa();
const bodyParser = require("koa-bodyparser");
require("dotenv").config();
const dayjs = require("dayjs");
const yargs = require("yargs");

const fetch = require("./fetch");
const auth = require("./auth");
const Router = require("koa-router");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");
const home = new Router();
// const options = yargs
//     .usage('Usage: --op <operation_name>')
//     .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
//     .argv;
// "RS-WUX-D9-Conf1025@bioduro-sundia.com",
// "RS-WUX-D9-Conf4020@bioduro-sundia.com",
// "RS-WUX-D9-Conf6018@bioduro-sundia.com",
// "RS-WUX-D9-Conf6023@bioduro-sundia.com",
// "RS-WUX-D9-Conf6024@bioduro-sundia.com",
// "RS-WUX-D9-Conf6025@bioduro-sundia.com",
// "RS-WUX-D9-Conf6026@bioduro-sundia.com",
// "RS-WUX-D9-Conf6027-A@bioduro-sundia.com",
// "RS-WUX-D9-Conf6027-B@bioduro-sundia.com"
const scheduleBody = {
  schedules: [""],
  startTime: {
    dateTime: "",
    timeZone: "Asia/Shanghai",
  },
  endTime: {
    dateTime: "",
    timeZone: "Asia/Shanghai",
  },
  availabilityViewInterval: 60,
};
const requestBody = {
  schedules: [],
  startTime: {
    dateTime: dayjs().format(),
    timeZone: "Asia/Shanghai",
  },
  endTime: {
    dateTime: dayjs().add(2, "day").format(),
    timeZone: "Asia/Shanghai",
  },
  availabilityViewInterval: 60,
};
const MeetingBody = {
  subject: "",
  start: {
    dateTime: dayjs().format(),
    timeZone: "Asia/Shanghai",
  },
  end: {
    dateTime: dayjs().add(60, "minute").format(),
    timeZone: "Asia/Shanghai",
  },
  location: {
    displayName: "",
    locationEmailAddress: "",
  },
};
app.use(bodyParser());

home
  .get("/rooms", async (ctx) => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    const rooms = await fetch.findRoom(
      auth.apiConfig.room_uri,
      authResponse.accessToken
    );
    ctx.body = rooms;
  })
  .post("/", async (ctx) => {
    //   console.dir(ctx.request.body);
    requestBody.schedules[0] = ctx.request.body.room;
    let startTime = dayjs().subtract(2, "hours").format();
    requestBody.startTime.dateTime = startTime;
    let endTime = dayjs().add(2, "day").format();
    requestBody.endTime.dateTime = endTime;
    const authResponse = await auth.getToken(auth.tokenRequest);
    const schedules = await fetch.callApi(
      auth.apiConfig.uri,
      requestBody,
      authResponse.accessToken
    );
    ctx.body = schedules;
  })
  .post("/meeting/:id", async (ctx) => {
    MeetingBody.subject = ctx.params.id;
    let interval = ctx.request.body.interval;
    // MeetingBody.location.displayName = ctx.params.id;
    MeetingBody.location.displayName = ctx.params.id;
    MeetingBody.location.locationEmailAddress =
      ctx.params.id + "@bioduro-sundia.com";
    let startTime = dayjs().format();
    MeetingBody.start.dateTime = startTime;
    let endTime = dayjs().add(interval, "minute").format();
    MeetingBody.end.dateTime = endTime;
    const authResponse = await auth.getToken(auth.tokenRequest);
    const meetingUri =
      process.env.GRAPH_ENDPOINT +
      `v1.0/users/${ctx.params.id}@bioduro-sundia.com/calendar/events`;
    const meeting = await fetch.scheduleMeeting(
      meetingUri,
      MeetingBody,
      authResponse.accessToken
    );
    ctx.body = meeting;
  })
  // 查询详细会议信息
  .get("/events/:id", async (ctx) => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    const uri =
      // process.env.GRAPH_ENDPOINT + `beta/users/${ctx.params.id}/events`;
      process.env.GRAPH_ENDPOINT +
      `beta/users/${ctx.params.id}/events?$select=id,subject,start,end,location,locations,organizer`;
    const events = await fetch.callGetApi(uri, authResponse.accessToken);
    ctx.body = events;
    // ctx.body = ctx.params.id
  })
  .post("/Schedules/", async (ctx) => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    const uri =
      process.env.GRAPH_ENDPOINT +
      `beta/users/${ctx.request.body.room}/calender/getSchedule`;
    scheduleBody.schedules[0] = ctx.request.body.room;
    // scheduleBody.startTime.dateTime = dayjs().subtract(1, "hours");
    scheduleBody.startTime.dateTime = dayjs();
    scheduleBody.endTime.dateTime = dayjs().add(24, "hours");
    const schedules = await fetch.callPostApi(
      uri,
      scheduleBody,
      authResponse.accessToken
    );
    ctx.body = schedules;
  })
  .get("/calendars/:id", async (ctx) => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    let uri =
      process.env.GRAPH_ENDPOINT +
      `v1.0/users/${ctx.params.id}@bioduro-sundia.com/calendars?$select=id`;
    const token = authResponse.accessToken;
    const calendars = await fetch.callGetApi(uri, token);
    // ctx.body = calendars
    calendarId = calendars.value[0].id;
    uri =
      process.env.GRAPH_ENDPOINT +
      `v1.0/users/${
        ctx.params.id
      }@bioduro-sundia.com/calendars/${calendarId}/calendarView?startDateTime=${dayjs()
        .subtract(2, "day")
        .toISOString()}&endDateTime=${dayjs().add(2, "day").toISOString()}&$select=start,end,organizer`;
    const calendarViews = await fetch.callGetApi(uri, token);
    ctx.body = calendarViews;
  })
  .get("/calendar/:id",async (ctx) => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    const uri = process.env.GRAPH_ENDPOINT + `v1.0/users/${ctx.params.id}@bioduro-sundia.com/calendars?$select=id`

  })

app.use(home.routes(), home.allowedMethods());
app.listen(4000, () => console.log("start-quick is starting at port 4000"));
// main();
