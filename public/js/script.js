	var socket = io('http://172.23.1.150:3000');


	function renderMessage(message){
	$('.messages').append('<div class="message"><strong>'+ message.author +'</strong>: '+ message.message + '</div>')
	}	

	function renderDataHora(d) {
		$('.messages').append('<div class="data_mensagem"><i>' + d.data[3] + '/' + d.data[4] + '/' + d.data[5] + '........' + d.data[0] + ':' +
			d.data[1] + ':'+ d.data[2] + '</i></div>')
}
	$('.messages')

	/*function move_up() {
	document.getElementById('#messages').scrollTop += 10;
	}*/

	socket.on('previousMessage', function(message){
		for(message of message){
			renderMessage(message);
		}
	})

	socket.on('receivedMessage', function(message){
		renderMessage(message);
	});


	socket.on('previousDataHora', function (message) {
	for (message of message) {
		renderDataHora(message)
    }
	});
	
   socket.on('receivedDataHora', function (message) {
	renderDataHora(message)
   })

	$('#chat').submit(function(event) {
		event.preventDefault();

		var dt_hr = new Date();				

		let atr_dt_hr = [

			hr_hora = dt_hr.getHours(),
			hr_min = dt_hr.getMinutes(),
			hr_seg = dt_hr.getSeconds(),
			dt_dia = dt_hr.getDate(),
			dt_mes = dt_hr.getMonth() + 1,
		    dt_ano = dt_hr.getFullYear()
		];

		var author = $('input[name=username]').val();  //ATRIBUI UMA VARIAVEL QUE RECEBE O VALOR DO FORMULÁRIO "NOME"
		var message = $('input[name=message]').val();   //ATRIBUI UMA VARIAVEL QUE RECEBE O VALOR DO FORMULÁRIO "MESSAGE"	
		
		if(author.length && message.length){		   //VERIFICA SE OS CAMPOS ESTÃO PREENCHIDOS
			var messageObject = {					   //CRIAÇÃO DE UM OBJETO QUE VAI SE CONECTAR NO WEB SOCKET	
				author:author,
				message: message,
				data: atr_dt_hr
			};

			renderMessage(messageObject);
			renderDataHora(messageObject);

			socket.emit('sendMessage', messageObject); 

			$('#input_message').val('');				//LIMPA INPUT DE MENSAGENS ASSIM QUE ÚMA É ENVIADA
		}    	
	});

