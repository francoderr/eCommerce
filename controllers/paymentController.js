import axios from 'axios';

let token 

export const createToken = async (req, res, next) => {
    try {
      const secret = process.env.secret
      const consumer = process.env.consumer
      const auth = Buffer.from(`${consumer}:${secret}`).toString('base64');
      
      const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }); 

      if(response) {
        // res.status(200).json({
        //     Status: "Success",
        //     message: "fetched access token successfully!",
        //     access_token: response.data.access_token,
        //   });
          token = response.data.access_token
          next()
      } else {
        res.status(500).json({
            Status: "Failed",
            message: "Could not get access token",
          });
      }
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  };

export const stkPush = async (req, res) => {
  const shortCode = 174379;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  const passkey = process.env.passkey;
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://mydomain.com/path",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };

  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      console.log(data);
      res.status(200).json(data.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};
