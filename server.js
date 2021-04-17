'use strict ';

require('dotenv').config();
const PORT = process.env.PORT|| 3000;
const express =require('express');
const pg =require('pg');
const superagent = require('superagent');
const methodOverride=require('method-override');
const {query} = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine','ejs');
app.set('views', 'views/');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//----------------------------------------------------------------------------------------------


client.connect().then( () => {

  app.listen(PORT,console.log(`app is listen now on port ${PORT}`));
});


//-----------------------------------------------------------------------------------------

app.get('/hello',renderHomePage);

app.get('/searches/new',showForm);
















//------------------------------------------------------------------------------------

function renderHomePage(req,res){

  res.render('pages/index');
}

function showForm(req,res){

  res.render('pages/searches/new');
}
