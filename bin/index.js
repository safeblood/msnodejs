#!/usr/bin/env node

// read in env settings
const Koa = require('koa')
const app = new Koa()
require('dotenv').config();
const dayjs = require('dayjs')
const yargs = require('yargs');

const fetch = require('./fetch');
const auth = require('./auth');
// const options = yargs
//     .usage('Usage: --op <operation_name>')
//     .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
//     .argv;
const requestBody = {
    "schedules": [
        "RS-WUX-D9-Conf1025@bioduro-sundia.com",
        "RS-WUX-D9-Conf4020@bioduro-sundia.com",
        "RS-WUX-D9-Conf6018@bioduro-sundia.com",
        "RS-WUX-D9-Conf6023@bioduro-sundia.com",
        "RS-WUX-D9-Conf6024@bioduro-sundia.com",
        "RS-WUX-D9-Conf6025@bioduro-sundia.com",
        "RS-WUX-D9-Conf6026@bioduro-sundia.com",
        "RS-WUX-D9-Conf6027-A@bioduro-sundia.com",
        "RS-WUX-D9-Conf6027-B@bioduro-sundia.com"
    ],
    "startTime": {
        "dateTime": dayjs().format(),
        "timeZone": "Asia/Shanghai"
    },
    "endTime": {
        "dateTime": dayjs().add(2,"day").format(),
        "timeZone": "Asia/Shanghai"
    },
    "availabilityViewInterval": 60
}
// async function main() {
//     console.log(`You have selected: ${options.op}`);

//     switch (yargs.argv['op']) {
//         case 'getUsers':

//             try {
//                 const authResponse = await auth.getToken(auth.tokenRequest);
//                 const users = await fetch.callApi(auth.apiConfig.uri,requestBody, authResponse.accessToken);
//                 console.dir(users,{depth:null});
//             } catch (error) {
//                 console.log(error);
//             }

//             break;
//         default:
//             console.log('Select a Graph operation first');
//             break;
//     }
// };
app.use(async ctx => {
    const authResponse = await auth.getToken(auth.tokenRequest);
    const schedules = await fetch.callApi(auth.apiConfig.uri,requestBody,authResponse.accessToken)
    ctx.body = schedules
})

app.listen(4000)
console.log("start-quick is starting at port 4000");
// main();