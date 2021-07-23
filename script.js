
const APIController = (function() {
	const _authorize = (async function() {
		let params = {
			client_id: CLIENT_ID,
			response_type: 'token',
			redirect_uri: REDIRECT_URI,
		}
		window.location.replace('https://accounts.spotify.com/authorize?' + new URLSearchParams(params));
	})

	const _getToken = (function() {
		const resp = String(window.location).split('#')[1];
		if (resp) {
			let params = new URLSearchParams(resp);
			let accessToken = params.get('access_token');
			return accessToken;
		} else {
			return false;
		}

	})
	
	const _getTracks = (async function (token, query) {

		const params = {
			q: query,
			type: 'track',
			limit: 50,
			offset: 50,
		}
		
		const options = {
			method: 'GET',
			headers: new Headers({
				'Authorization': `Bearer ${token}`
			})
		}
		
		const resp = await fetch('https://api.spotify.com/v1/search?' + new URLSearchParams(params), options);
		const data = await resp.json();
		return data;

	})


	return {
		authorize() {
			return _authorize()
		},
		getToken() {
			return _getToken()
		},
		getTracks(token, query) {
			return _getTracks(token, query)
		}
	}
})();

const UIController = (function() {
	const _displaySong = (async function (token) {
		let q = await APPController.generateQuery();
		let data = await APIController.getTracks(token, q);
		let track = await APPController.getRandomTrack(data);
		let trackId = await APPController.getTrackId(track);
		APPController.playSong(trackId);
		APPController.displayImage(track);
	})



	return {
		displaySong(token) {
			return _displaySong(token)
		},
	}
})();

const APPController = (function(UIController, APIController) {
	const _getChar = (function(){
			let alphabet = 'abcdefghijklmnopqrstuvwxyz'
			let arr = alphabet.split('');
			let char = arr[Math.floor(Math.random()*arr.length)];
			return char;
		})
	
	const _generateQuery = (function() {
		let query = _getChar() + _getChar();
		return query; 
	})

	const _getRandomTrack = (function(data) {
		let tracks = data["tracks"]["items"]
		let track = tracks[Math.floor(Math.random()*tracks.length)];
		return track;
	})

	const _getTrackId = (function(track) {
		let trackId = track["id"]
		return trackId;
	})

	// displays widget in browser
	const _playSong = (function(trackId) {
		const url = `https://open.spotify.com/embed/track/${trackId}`;
		document.getElementById('player').src = url;
	})

	const _displayImage = (function(track) {
		const url = track["album"]["images"][0]["url"]
		document.body.style.backgroundImage = `url(${url})`;
		document.body.style.backgroundSize = '100%';
		document.body.style.backgroundPosition= 'center';
	})

	document.getElementById("button").addEventListener('click', function() {
		const token = APIController.getToken();
		if (token) {
			UIController.displaySong(token);
		} else {
			APIController.authorize();
		}
	})

	document.addEventListener('DOMContentLoaded', function() {
		let token = APIController.getToken()
		if (token) {
			UIController.displaySong(token);
		}

		}
	)

	return {
		generateQuery() {
			return _generateQuery()
		},
		playSong(trackId) {
			return _playSong(trackId)
		},
		displayImage(track) {
			return _displayImage(track)
		},
		getTrackId(track) {
			return _getTrackId(track)
		},
		getRandomTrack(data) {
			return _getRandomTrack(data)
		},
		init(){
		}
	}


})(UIController, APIController);


APPController.init()

