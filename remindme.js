<<<<<<< HEAD
var addItem = function() {
  var inputs = $("#" + defaults.formId + " :input"),
      errorMessage = "Title can not be empty",
      id, title, description, date, tempData;

  if (inputs.length !== 4) {
    return;
  }

  title = inputs[0].value;
  description = inputs[1].value;
  date = inputs[2].value;

  if (!title) {
    generateDialog(errorMessage);
    return;
  }

  id = new Date().getTime();

  tempData = {
    id : id,
    code: "1",
    title: title,
    date: date,
    description: description
  };

  // Saving element in local storage
  data[id] = tempData;
  localStorage.setItem("todoData", JSON.stringify(data));

  // Generate Todo Element
  generateElement(tempData);

  // Reset Form
  inputs[0].value = "";
  inputs[1].value = "";
  inputs[2].value = "";
};
=======
function get_todos() {
    var todos = new Array;
    var todos_str = localStorage.getItem('todo');
    if (todos_str !== null) {
        todos = JSON.parse(todos_str); 
    }
    return todos;
}
 
function add() {
    var task = document.getElementById('task').value;
 
    var todos = get_todos();
    todos.push(task);
    localStorage.setItem('todo', JSON.stringify(todos));
 
    show();
 
    return false;
}
 
function remove() {
    var id = this.getAttribute('id');
    var todos = get_todos();
    todos.splice(id, 1);
    localStorage.setItem('todo', JSON.stringify(todos));
    
    show().click(function(){
        todos.fadeOut();
    });
 
    return false;
}
 
function show() {
    var todos = get_todos();
 
    var html = '<ul>';
    for(var i=0; i<todos.length; i++) {
        html += '<li>' + todos[i] + '<button class="remove" id="' + i  + '">x</button></li>';
    };
    html += '</ul>';
 
    document.getElementById('todos').innerHTML = html;
 
    var buttons = document.getElementsByClassName('remove');
    for (var i=0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', remove);
    };
}
 
document.getElementById('add').addEventListener('click', add);
show();
>>>>>>> origin/master
