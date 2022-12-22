const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find( (users) => users.username === username );
  if(!user){
      return response.status(400).json({error : "User not found!"});
  }
  request.user = user;
  return next();
}

function checksExistsUserNameAccount(request, response, next) {
  const { username } = request.body;
  const user = users.find( (users) => users.username === username );
  if(user){
      return response.status(400).json({error : "User already exists !"});
  }
  request.user = user;
  return next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;
 
  const todo = user.todos.find( (todo) => todo.id === id );

  if(!todo){
      return response.status(404).json({error : "Todo not found!"});
  }
  request.user = user;
  return next();
}

app.post('/users', checksExistsUserNameAccount, (request, response) => {
  const {name, username} = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title , deadline } = request.body;
  const { user } = request;
  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline + " 00:00"), 
    created_at: new Date()
}
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline  } = request.body;

  for (let index = 0; index < user.todos.length; index++) {
    
     if(user.todos[index].id === id){
      user.todos[index].title = title;
      user.todos[index].deadline = new Date(deadline);
     }
  }

  return response.status(201).send();
});

app.patch('/todos/:id/:done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id, done} = request.params;
  const { title, deadline  } = request.body;

  for (let index = 0; index < user.todos.length; index++) {
     if(user.todos[index].id == id){
      user.todos[index].done = done;
     }
  }

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;


  for (let index = 0; index < user.todos.length; index++) {
     const todo = user.todos[index];
     if(user.todos[index].id == id){
      user.todos.splice(todo,1);
     }
  }

  return response.status(204).send();
});

module.exports = app;