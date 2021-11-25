
	
	var socket = io('http://172.23.1.150:3000');


	function renderMessage(message){
	$('.messages').append('<div class="message"><strong>'+ message.author +'</strong>: '+ message.message +'</div>')
	}

	socket.on('previousMessage', function(message){
		for(message of message){
			renderMessage(message);
		}
	})

	socket.on('receivedMessage', function(message){
		renderMessage(message);
	});

	$('#chat').submit(function(event) {
		event.preventDefault();

		var author = $('input[name=username]').val();  //ATRIBUI UMA VARIAVEL QUE RECEBE O VALOR DO FORMULÁRIO "NOME"
		var message =$('input[name=message]').val();   //ATRIBUI UMA VARIAVEL QUE RECEBE O VALOR DO FORMULÁRIO "MESSAGE"	       	 
		if(author.length && message.length){		   //VERIFICA SE OS CAMPOS ESTÃO PREENCHIDOS
			var messageObject = {					   //CRIAÇÃO DE UM OBJETO QUE VAI SE CONECTAR NO WEB SOCKET	
				author:author,
				message:message,
			};

			renderMessage(messageObject);

			socket.emit('sendMessage', messageObject); 
		}    	
	});

