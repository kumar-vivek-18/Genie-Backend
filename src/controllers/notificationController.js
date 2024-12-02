import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const RetailerNotifyAccessToken=async(req,res)=>{
    console.log("jii")
  const auth = new GoogleAuth({
      keyFile: path.join(__dirname, '../../genie-retailer-firebase.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
//   console.log("access",accessToken);
  return res.json({ accessToken: accessToken.token });
}

export const CustomerNotifyAccessToken =async(req,res) => {
    console.log("jii")
  const auth = new GoogleAuth({
      keyFile: path.join(__dirname, '../../genie-customer-firebase.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
//   console.log("access",accessToken);
  return res.json({ accessToken: accessToken.token });
}