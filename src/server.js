const express = require("express");
//traz o express
const server = express();
// chama o express e transforma ele em server const
const routes = require("./routes");

server.set("view engine", "ejs");
//midlewere  == cara do meiota// habilitar arquivos estáticos
server.use(express.static("public")); //adiciona as rotas automáticas
//usar o req.body que logo tra as infos do job
server.use(express.urlencoded({ extended: true }));

//routs
server.use(routes);
//configura o server no 3000
server.listen(3000, () => console.log("rodando"));
//entra no /
