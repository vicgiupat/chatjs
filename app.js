require('dotenv').config()
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
/*----------------------------------------------------------------------------------------------*/
/* EXTRAI O MODEL DE USUARIO */
const db = require('./db');
const Users = db.Mongoose.model('users', db.UserSchema, 'users');

/*----------------------------------------------------------------------------------------------*/
/* GET home page. */
app.get('/', async (req, res) => {
	const db = require('./db');
	const Users = db.Mongoose.model('users', db.UserSchema, 'users');

	const docs = await Users.find({}).lean().exec();
	res.render('index', { docs });
});

/*----------------------------------------------------------------------------------------------*/
/* GET Login page. */

app.get('/login', (req, res) => {
	res.render('login');
})

/*----------------------------------------------------------------------------------------------*/
/* GET Cadastro page. */

app.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: 'Cadastro de usuário: chat Serramar' })
});

app.get('/:id', verificaToken, async (req, res) => {
	const id = req.params.id


	try {
		//VERIFICAR SE O USUARIO EXISTE
		const user = await Users.findById(id, '-senhaHash')

		if (!user) {
			return res.status(404).json({ msg: 'Usuário não encontrado' })
		}

		res.status(200).json({ user })
	} catch (err) {
		console.log(err)
	}
})

function verificaToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ msg: 'Acesso negado!!' })
	}
}
/*----------------------------------------------------------------------------------------------*/
/*POST CADASTRO PAGE*/

app.post('/cadastro', async (req, res) => {
	 
	const { nome, sobrenome, email, senha, c_senha } = req.body

/*----------------------------------------------------------------------------------------------*/
	//CRIPTOGRAFA E ENVIA PARA O BD A SENHA INSERIDA NO BODY DA APLICAÇÃO
	const senhaHash = await bcrypt.hash(req.body.senha, 10)
/*----------------------------------------------------------------------------------------------*/
	//const db = require('./db');
	//const Users = db.Mongoose.model('users', db.UserSchema, 'users');
	const usuario = new Users({ nome, sobrenome, email, senhaHash }); 
/*----------------------------------------------------------------------------------------------*/
	//CONFERE SE O EMAIL JA ESTA EM USO
	const usuarioExistente = await Users.findOne({ email: email })
	if (usuarioExistente) {
		return res.status(402).json({ msg: 'E-mail ja esta em uso!!' })
	}
/*----------------------------------------------------------------------------------------------*/
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
/*----------------------------------------------------------------------------------------------*/
/*POST LOGIN PAGE*/

app.post('/login', async (req, res) => {

	const { email, senha } = req.body;
/*----------------------------------------------------------------------------------------------*/

	//VALIDAÇÃO DE CAMPOS -- EMAIL -- SENHA --//
	if (!email) {
		return res.status(404).json({msg: 'E-mail é obrigatório!'})
	}

	if (!senha) {
		return res.status(404).json({ msg: 'A senha é obrigatória!' })
	}
/*----------------------------------------------------------------------------------------------*/
	//VALIDAR SE O USUARIO EXISTE

	const user = await Users.findOne({ email: email })

	if (!user) {
		return res.status(404).json({ msg: 'Usuario não encontrado!!' })
	}
/*----------------------------------------------------------------------------------------------*/
	//VERIFICA SE A SENHA CORRESPONDE A DO USUARIO
	try {
		const senhaExiste = await bcrypt.compare(senha, user.senhaHash)

		if (!senhaExiste) {
			return res.status(404).json({ msg: 'Usuário e/ou senha não conferem' })
		}
	} catch (err) {
		return res.status(404)
	}

	//CRIA O TOKEN SE O LOGIN RETORNAR 200-OK
	try {
		const secret = process.env.SECRET
		const token = jwt.sign({ id: user._id, }, secret)

		res.status(200).json({ msg: 'Usuario autenticado com sucesso', token })

	} catch (err) {
		console.log(err)
	}
})


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