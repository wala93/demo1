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

app.post('/searches',creatSearch);










//-----------------------------------------------------------------------
function Book(info) {
  this.title = info.title || 'No title available'; // shortcircuit
  this.author = info.authors || 'No author available';
  this.description = info.description || 'No description available';
  this.image = (info.imageLinks) ? info.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}




//------------------------------------------------------------------------------------

function renderHomePage(req,res){

  res.render('pages/index');
}

function showForm(req,res){

  res.render('pages/searches/new');
}

// function creatSearch (req,res){
//   let url='https://www.googleapis.com/books/v1/volumes?q=';
//   console.log(req.body.search);
//   if (req.body.search[1]==='title'){url += `intitle:${req.body.search[0]}`;}
//   if (req.body.search[1]==='author'){url += `inauthor:${req.body.search[0]}`;}

//   superagent.get(url).then(
//     y=>{
//     //   console.log(y.body.items);
//       y.body.items.map(resultApi=>{new Book(resultApi.volumeInfo);
//         // console.log(resultApi.volumeInfo);
//       });}
//   ).then(results=>{
//     console.log(results);
//     res.render('pages/index',{searchResults:results});
//   });


// }

function creatSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  // can we convert this to ternary?
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/index', { searchResults: results }))
    .catch(error => response.status(500).send(`somthing wrong ${error}`));
}
