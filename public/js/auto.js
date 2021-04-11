

const autoCompleteConfig = {
	// 다른 api 렌더용으로 수정하고 싶을 때에는 이 부분을 설정하면 됨
	renderOption(movie) {
		//포스터가 NA일 경우 '', 이미지가 존재할시 불러옴
		const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
		return `
				<img src = "${imgSrc}"/>
				${movie.Title} (${movie.Year})
				`;
	},
	inputValue(movie) {
		return movie.Title;
	},

	//make request for API
	//network async opperation
	//아시오스를 이용하여 해당주소api에서 원하는 정보를 가져온다
	//find movie
	async fetchData(searchTerm) {
		const response = await axios.get('https://www.omdbapi.com/', {
			params: {
				apikey: '59c6bd8f',
				//인풋에서 받아온 발류값을 받아 서치
				s: searchTerm,
			},
		});

		if (response.data.Error) {
			//에러핸들링
			return [];
		}
		return response.data.Search; //api로부터 받아온 서치데이터를 리턴
	},
};

//  루트지정을 이용한 코드의 재사용
createAutoComplete({
	...autoCompleteConfig, //make a copy of every objects in autoCompleteCofig and throw it into this obj.
	root: document.querySelector('#autocomplete'),
	onOptionSelect(movie) {
		onMovieSelect(movie, document.querySelector('#summary'));
	},
});

let Movie;

//자동완성에서 선택한 item의 정보를 불러옴
const onMovieSelect = async (movie, summaryElement) => {
	const response = await axios.get('https://www.omdbapi.com/', {
		params: {
			apikey: '59c6bd8f',
			//인풋에서 받아온 발류값을 받아 서치
			i: movie.imdbID,
		},
	});

	//api에서 받아온 데이터 덩어리를 무비템플릿으로 걸러준후 html div id= summary 안에 넣어줌
	summaryElement.innerHTML = movieTemplet(response.data);
};


//무비정보를 화면에 보여줄 템플릿
const movieTemplet = (movieDetail) => {
	//data-value에 넣어줄 값을 정의
	const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, '')); //달러사인과 ,을 찾아서 빈스트링으로 대체-> 숫자화
	const metascore = parseInt(movieDetail.Metascore);
	const imdbRating = parseInt(movieDetail.imdbRating);
	const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

	// split을 이용해 스페이스 간격기준으로 어레이화
	const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
		//발류값이 숫자가 아닐시 NaN을 반환
		const value = parseInt(word);

		if (isNaN(value)) {
			return prev;
		}
		else {
			return prev + value;
		}
	}, 0);

	return `
	
		<article class="media">
			<figure class="media-left">
				<p class="image">
				<img src="${movieDetail.Poster}"/>
					<input type="hidden" value="${movieDetail.Poster}" name='poster'>
				</p>
			</figure>
			<div class="media-content">
				
			
				<div class="movieName text-right text-uppercase">
					${movieDetail.Title} (${movieDetail.Year})
					<input type="hidden"  name='name' value='${movieDetail.Title} (${movieDetail.Year})'>
				</div>
				
				<div class="text-right">
					Director : ${movieDetail.Director}
					<input type="hidden"  name='director' value='${movieDetail.Director}'>
				</div>
				
				<div class="text-right">
					Actors : ${movieDetail.Actors}
				</div>
				
				<div class="text-right">
					Genre : ${movieDetail.Genre}
				</div>
				<div class="text-right">
					 ${movieDetail.Plot}
					 <input type="hidden" name='plot' value='${movieDetail.Plot}'>
				</div>
		
			</div>	
		</article>
		<article data-value=${dollars} class ="notification is-primary">
			<p class="title">BoxOffice: ${movieDetail.BoxOffice}</p>
		</article>
		<article data-value=${awards} class ="notification is-primary">
			<p class="title">${movieDetail.Awards}</p>
		</article>
		
		<article data-value=${metascore} class ="notification is-primary">
			<p class="title">Metascore Rating : ${movieDetail.Metascore}</p>
		</article>
		<article data-value=${imdbRating} class ="notification is-primary">
			<p class="title" name="bbsRating">IMDB Rating : ${movieDetail.imdbRating}</p>
		</article>
		<article data-value=${imdbVotes} class ="notification is-primary">
			<p class="title">IMDB Votes : ${movieDetail.imdbVotes}</p>
		</article>

		
	`;
};


