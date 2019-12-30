let express = require("express"),
  path = require('path'),
  nodeMailer = require('nodemailer'),
  bodyParser = require('body-parser');
  fetch = require('node-fetch');
  moment = require('moment');
require('dotenv').config()
let app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function sendEmail(req, emailUser, data){
  const dateEnd = data.waktuselesai.split(" ")
  let transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
          // should be replaced with real sender's account
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
      }
  });
  let mailOptions = {
      // should be replaced with real recipient's account
      to: emailUser,
      subject: 'Informasi jadwal APBD',
      html: `<p>Tahapan ${data.namatahap} - ${data.namasubtahap} berlangsung dan berakhir tanggal ${dateEnd[0]} pukul ${dateEnd[1]}:00 WIB.</p>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

app.get('/send-email', function(req, res) {
  let response
  fetch('http://167.71.217.150/main/jadwal/2020/detil-jadwal/8/0')
    .then((res) => {
       return res.json()
    })
    .then((json) => {
      const lastIndex = json.data.length - 1
      const detailNotif = json.data[lastIndex]
      let listEmail = process.env.LIST_EMAIL.split(',')
      for (let i = 0; i < listEmail.length;i++) {
        sendEmail(req, listEmail[i], detailNotif)
      }
      res.json({'status':'success'})
    });

})

let server = app.listen(8081, function(){
    let port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});
