const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app); 			//DECLARA PROTOCOLO HTTP
const io = require('socket.io')(server);					//DECLARA PROTOCOLO WSS - - > WEB SOCKET SERVER
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




app.use(express.static(path.join(__dirname, 'public')));  	//DEFINE PASTA ONDE VAI FICAR OS ARQUIVOS PUBLICO  - - > HTML, EJS
app.set('views', path.join(__dirname, 'public'));			//APONTA AS VIEWS PARA PASTA ESTATICA PUBLIC
app.engine('html', require('ejs').renderFile);				//DEFININDO HTML PARA USO COM EXTENSÃO EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




/* GET home page. */
app.get('/', async (req, res) => {
	const db = require('./db');
	const Users = db.Mongoose.model('users', db.UserSchema, 'users');

	const docs = await Users.find({}).lean().exec();
	res.render('index', { docs });
});''


/* GET Login page. */

app.get('/login', (req, res) => {
	res.render('login');
})

/* GET Cadastro page. */

app.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: 'Cadastro de usuário: chat Serramar' })
});

/*POST CADASTRO PAGE*/
app.post('/cadastro', async (req, res) => {
	 
	const { nome, sobrenome, email, senha, c_senha } = req.body


	//CRIPTOGRAFA E ENVIA PARA O BD A SENHA INSERIDA NO BODY DA APLICAÇÃO
	const senhaHash = await bcrypt.hash(req.body.senha, 10)	
	
	const db = require('./db');
	const Users = db.Mongoose.model('users', db.UserSchema, 'users');
	const usuario = new Users({ nome, sobrenome, email, senhaHash }); 

	//CONFERE SE O EMAIL JA ESTA EM USO
	const usuarioExistente = await Users.findOne({ email: email })
	if (usuarioExistente) {
		return res.status(402).json({ msg: 'E-mail ja esta em uso!!' })
	}

	//COMPARA SE AS SENHAS CONFEREM OU NÃO
	if (c_senha !== senha) {
		return res.status(404).json({ msg: 'As senhas não conferem!!' })
	}
		try {
			usuario.save();
			res.redirect("/login");
		} catch (err) {
			console.log(err)
	}
});

let messages = [];

io.on('connection', socket =>{

	socket.emit('previousMessage', messages);
	socket.emit('previousDataHora', messages)

	socket.on('sendMessage', data =>{
		messages.push(data);
		socket.broadcast.emit('receivedMessage', data)
		socket.broadcast.emit('receivedDataHora', data)
		console.log(data)

	});

	console.log(`socket conectado: ${socket.id}`)
});

server.listen(3000);

module.exports = app;