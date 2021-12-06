const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app); 			//DECLARA PROTOCOLO HTTP
const io = require('socket.io')(server);					//DECLARA PROTOCOLO WSS - - > WEB SOCKET SERVER


require('./auth')(passport);
app.use(session({
	secret: '123',
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 30 * 60 * 1000}
}))
app.use(passport.initialize());
app.use(passport.session());

		  			


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
});

app.get('/login', (req, res) => {
	res.render('login');
})

app.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: 'Cadastro de usuário: chat Serramar' })
});

app.get('/login', (req, res, next) => {
	if (req.query.fail)
		res.render('login', { message: 'Usuário e/ou senha incorretos!' });
	else
		res.render('login', { message: null })
});

app.post('/login',
	passport.authenticate('local', {
		sucessRedirect: 'index',
		failureRedirect: '/login?fail=true'
	})
)


app.post('/cadastro', async (req, res) => {
	const nome		= req.body.nome;
	const sobrenome = req.body.sobrenome;
	const email		= req.body.email;
	const senha		= req.body.senha;
	const c_senha	= req.body.c_senha;

	const db = require('./db');
	const Users = db.Mongoose.model('users', db.UserSchema, 'users');
	const usuario = new Users({ nome, sobrenome, email, senha, c_senha });

	try {
		await usuario.save();
		res.redirect("/");
	} catch(err) {
		console.log(err)
	}

});

/*app.use('/', (req, res) =>{									//DEFINE QUE O ENDEREÇO RAIZ DO SERVIDOR RETORNA A PAGINA INDEX.HTML
	res.render('index');
});*/

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