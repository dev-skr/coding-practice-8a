const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let path = require("path");
let dbPath = path.join(__dirname + "/todoApplication.db");
let app = express();
app.use(express.json());
let db = null;
async function start() {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => console.log("server running at 3000"));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}
start();

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;

  const query = `select * from todo where 
  status like "%${status}%" and priority like "%${priority}%" and todo like "%${search_q}%";`;
  const result = await db.all(query);
  response.send(result);
});

app.get("/todos/:todoId", async (request, response) => {
  let { todoId } = request.params;
  const query = `select * from todo where id=${todoId}`;
  let result = await db.get(query);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status } = request.body;
  const query = `insert into todo (id,todo,priority,status)
    values(${id},"${todo}","${priority}","${status}");`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { todo, status, priority } = request.body;
  let vals = [
    { todo: todo, val: todo },
    { status: status, val: status },
    { priority: priority, val: priority },
  ];
  let req = vals.filter((ele) => ele.val !== undefined);
  let updateItem = req[0];
  if (updateItem.todo !== undefined) {
    const query = `update todo set todo="${todo}" where id=${todoId};`;
    await db.run(query);
    response.send("Todo Updated");
  } else if (updateItem.status !== undefined) {
    const query = `update todo set status="${status}" where id=${todoId};`;
    await db.run(query);
    response.send("Status Updated");
  } else if (updateItem.priority !== undefined) {
    const query = `update todo set priority="${priority}" where id=${todoId};`;
    await db.run(query);
    response.send("Priority Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  const query = `delete from todo where id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
