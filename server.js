let express = require("express"),
    path = require('path'),
    nodeMailer = require('nodemailer'),
    bodyParser = require('body-parser');
    fetch = require('node-fetch');
    moment = require('moment');
    cron = require("node-cron");
require('dotenv').config()
let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const isSecure = String(process.env.SMTP_SECURE) === 'true'
function sendEmail(req, emailUser, data){
    const dateStart = data.waktumulai.split(" ")
    const dateEnd = data.waktuselesai.split(" ")
    let transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: isSecure,
      auth: {
          user: process.env.AWS_SES_ACCESS_KEY_ID,
          pass: process.env.AWS_SES_SECRET_ACCESS_KEY
      }
    });
    let mailOptions = {
        from: `"JDS" <${process.env.EMAIL_FROM}>`,
        to: emailUser,
        subject: 'Informasi jadwal APBD',
        html: `<p>Tahapan ${data.namatahap} - ${data.namasubtahap} berlangsung pada tanggal ${dateStart[0]} pukul ${dateStart[1]}:00 WIB dan berakhir pada tanggal ${dateEnd[0]} pukul ${dateEnd[1]}:00 WIB.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

function checkDetilJadwal(data) {
    if (data.setstatus === "Aktif"){
        moment.locale('id')
        var dateNow = moment()
        const dateStart = data.waktumulai.split(" ")
        const dateEnd = data.waktuselesai.split(" ")
        const dateStartMomentObject = moment(dateStart[0] +" "+dateStart[1], "DD/MM/YYYY")
        const dateEndMomentObject = moment(dateEnd[0] +" "+dateEnd[1], "DD/MM/YYYY")
        const dateStartObject = dateStartMomentObject.toDate();
        const dateEndObject = dateEndMomentObject.toDate();
        if ((moment(dateStartObject) <= dateNow) && (moment(dateEndObject) >= dateNow)) {
            return true
        }
        return false
    }
}

cron.schedule("*/59 * * * *", function(req) {
  // console.log("running a task every 1 hours");
  fetch('http://167.71.217.150/main/jadwal/2020/detil-jadwal/8/0')
    .then((res) => {
       return res.json()
    })
    .then(async (json) => {
      const lastIndex = json.data.length - 1
      const detailNotif = json.data[lastIndex]
      if (detailNotif !== undefined) {
        const response = await checkDetilJadwal(detailNotif)
        // if (response){
          let listEmail = process.env.LIST_EMAIL.split(',')
          for (let i = 0; i < listEmail.length;i++) {
            sendEmail(req, listEmail[i], detailNotif)
          }
        // }
      }
    });
});

app.listen("3128");
