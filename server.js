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

app.post('/',myList);
app.get('/books/:id', showBook);







//-----------------------------------------------------------------------

function Book (info){

  this.title=info.title ||'no title available';
  this.author=info.author || 'no author available';
  this.description=info.description || 'no description available';
  this.image=(info.imageLinks)?info.imageLinks.smallThumbnail :`https://i.imgur.com/J5LVHEL.jpg`;
  this.isbn=info.industryIdentifiers.type|| 'no isbn';
}




//------------------------------------------------------------------------------------

function renderHomePage(req,res){
  // console.log(' in homepage');
  let SQL='SELECT * FROM books';
  client.query(SQL).then( x=> res.render('pages/index',{books:x.rows})).catch(error=>res.send(error));

}

function showForm(req,res){

  res.render('pages/searches/new');
}



function creatSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  // console.log(request.body);
  // console.log(request.body.search);

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


function myList(req,res){
  // console.log(req.body);
  let data=req.body;
  let SQL=`INSERT INTO books (author,title,isbn,image_url,description) VALUES ($1,$2,$3,$4,$5) RETURNING id;`;
  let values=[data.author,data.title,data.isbn,data.image,data.description];
  client.query(SQL,values).then(x=>{
    console.log(x.rows[0].id);
    res.redirect(`book/${x.rows[0].id}`);});

}
function showBook(request, response){
  const sql ='SELECT * FROM books WHERE id = $1';
  const idDB =[request.params.id];
  console.log(request.params.id);
  client.query(sql,idDB).then(data => {
    // console.log(data.Results);
    console.log(data.rows);
    // response.send(data.rows)
    response.render('pages/books/show' ,{books :data.rows});
  }).catch((error=>{
    console.log(error);
    response.send('error');
  }));
}

