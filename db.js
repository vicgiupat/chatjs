// JavaScript source code
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatjs');

const UserSchema = new mongoose.Schema({
	nome: String,
	sobrenome: String,
	email: String,
	senhaHash: String,
}, { collection: 'users' }
);

module.exports = { Mongoose: mongoose, UserSchema: UserSchema }