
var Info = function( title, description ) {

	var infoIcon = document.createElement('div');
	infoIcon.id = 'info-icon';
	infoIcon.textContent = 'i';
	document.body.appendChild( infoIcon );

	var info = document.createElement('div');
	info.id = 'info';
	document.body.appendChild( info );

	var header = document.createElement('h1');
	header.innerHTML = title;
	info.appendChild( header );

	var body = document.createElement('div');
	body.innerHTML = description;
	info.appendChild( body );

	// how to fade without jQuery?
	// $( infoIcon ).click(function(){
	// 	$( info ).fadeToggle('fast');
	// });

	infoIcon.addEventListener('click', function(e){
		info.classList.toggle('visible');
	}, false);

};