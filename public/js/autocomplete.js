//재사용가능한 코드로 정의
const createAutoComplete = ({ root, renderOption, onOptionSelect, inputValue, fetchData }) => {
	// 드랍다운을 심어주는 코드
	root.innerHTML = `
	<div class="input-group mb-3">
 		<div class="input-group-prepend">
    		<span class="input-group-text" id="inputGroup-sizing-default">Search Movies</span>
  		</div>
  		<input type="text" class="form-control" aria-label="Default" placeholder="eg) Harry Poter, Avengers.." aria-describedby="inputGroup-sizing-default">
	</div>
	
	<div class="dropdown">
		<div class="dropdown-menu">
			<div class="dropdown-content results">
			</div>
		</div>
	</div>
`;

	const input = root.querySelector('input');
	const dropdown = root.querySelector('.dropdown');
	const resultWrapper = root.querySelector('.results');

	//debounce의 (func)로 이벤트 콜백을 보내자
	const onInput = async (event) => {
		const items = await fetchData(event.target.value);

		//검색한 선택지가 없을시 자동완성창을 닫음
		if (!items.length) {
			dropdown.classList.remove('is-acive');
			return;
		}

		//rander  data list
		resultWrapper.innerHTML = '';
		dropdown.classList.add('is-active');
		for (let item of items) {
			const option = document.createElement('a');

			option.classList.add('dropdown-item');
			option.innerHTML = renderOption(item);
			//선택시 드랍다운 제거
			option.addEventListener('click', () => {
				dropdown.classList.remove('is-active');
				input.value = inputValue(item);
				onOptionSelect(item);
			});

			resultWrapper.appendChild(option);
		}
	};
	input.addEventListener('input', debounce(onInput, 1000)); //delay의 값을 여기에서 정의 전달

	document.addEventListener('click', (event) => {
		//루트=자동완성창이 클릭이 일어나지 않았으면 창을 닫아라
		if (!root.contains(event.target)) {
			dropdown.classList.remove('is-active');
		}
	});
};
