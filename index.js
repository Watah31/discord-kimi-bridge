// index.js  – discord → kimi → discord
const express = require('express');
const axios   = require('axios');
const FormData= require('form-data');
const app     = express();
app.use(express.json({limit:'10mb'}));

const DISCORD = process.env.WEBHOOK_URL;
const KEY     = process.env.MOONSHOT_KEY;

app.post('/kimi', async (req,res)=>{
  try{
    const {content,attachments} = req.body;
    const form = new FormData();
    form.append('model','kimi-latest');
    form.append('message', content || 'Analyse image');
    if (attachments?.length){
       const img = await axios.get(attachments[0].url,{responseType:'arraybuffer'});
       form.append('image', img.data, {filename:attachments[0].filename});
    }
    const {data} = await axios.post('https://api.moonshot.cn/v1/chat', form,
       {headers:{...form.getHeaders(), Authorization:`Bearer ${KEY}`}});
    const reply = data.choices?.[0]?.message || 'No response';
    await axios.post(DISCORD, {content: reply});
    res.status(204).send();
  }catch(e){
    console.error(e.message);
    res.status(500).send('Server error');
  }
});

app.get('/', (_,r)=>r.send('OK'));
app.listen(process.env.PORT||3000);
