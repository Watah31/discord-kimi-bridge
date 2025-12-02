// index.js  – 40-line bridge
const express = require('express');
const axios   = require('axios');
const FormData= require('form-data');
const app     = express();
app.use(express.json({limit:'10mb'}));

const DISCORD = process.env.WEBHOOK_URL;
const KEY     = process.env.MOONSHOT_KEY;

app.post('/kimi', async (req,res)=>{
  const {content,attachments} = req.body;
  const form = new FormData();
  form.append('model','kimi-latest');
  form.append('message', content || 'Analyse image');
  if (attachments?.length){
     const img = await axios.get(attachments[0].url,{responseType:'arraybuffer'});
     form.append('image', img.data, {filename:attachments[0].filename});
  }
  const {data} = await axios.post('https://api.moonshot.ai/v1/chat', form,
     {headers:{...form.getHeaders(), Authorization:`Bearer ${KEY}`}});
  await axios.post(DISCORD, {content: data.choices[0].message});
  res.status(204).send();
});
app.get('/', (_,r)=>r.send('OK'));
app.listen(process.env.PORT||3000);
