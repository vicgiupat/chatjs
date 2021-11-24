const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app); 			//DECLARA PROTOCOLO HTTP

const io = require('socket.io')(server);		  			//DECLARA PROTOCOLO WSS - - > WEB SOCKET SERVER
app.use(express.static(path.join(__dirname, 'public')));  	//DEFINE PASTA ONDE VAI FICAR OS ARQUIVOS PUBLICO  - - > HTML, EJS
app.set('views', path.join(__dirname, 'public'));			//PONTA AS VIEWS PARA PASTA ESTATICA PUBLIC
app.engine('html', require('ejs').renderFile);				//DEFININDO HTML PARA USO COM EXTENSÃO EJS
app.set('view engine', 'html');

app.use('/', (req, res) =>{									//DEFINE QUE O ENDEREÇO PADRÃO DO SERVIDOR RETORNA A PAGINA INDEX.HTML
	res.render('index.html');
});

io.on('connection', socket =>{
	console.log(`socket conectado: ${socket.id}`);

	socket.on('sendMessage', data =>{
		console.log(data)
	});
});

server.listen(3000);