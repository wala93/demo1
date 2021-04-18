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

app.get('/',renderHomePage);

app.get('/searches/new',showForm);

app.post('/searches',creatSearch);










//-----------------------------------------------------------------------
// function Book(info) {
//   this.title = info.title || 'No title available'; // shortcircuit
//   this.author = info.authors || 'No author available';
//   this.description = info.description || 'No description available';
//   this.image = (info.imageLinks) ? info.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
// }

function Book (info){

  this.title=info.title ||'no title available';
  this.author=info.author || 'no author available';
  this.description=info.description || 'no description available';
  this.image=(info.imageLinks)?info.imageLinks.smallThumbnail :`https://i.imgur.com/J5LVHEL.jpg`;
this.isbn=info.industryIdentifiers.type;
}




//------------------------------------------------------------------------------------

function renderHomePage(req,res){
  console.log(' in homepage');

  res.render('pages/index');
}

function showForm(req,res){

  res.render('pages/searches/new');
}



function creatSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  // can we convert this to ternary?
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url).then(y=> y.body.items.map(bookData=>new Book(bookData.volumeInfo) ) ).then(
    results=>response.render('pages/searches/show',{searchResults:results})
  ).catch(handelError(response));
}


function handelError (response){
  return (error)=>{

    console.log(error);
    response.status(500).send(`there is an error ${error}` );
  };
}



