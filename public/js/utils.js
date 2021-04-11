//재실행이 계속되는 debounce화
const debounce = (func, delay) => {
	let timeoutId;
	return (...args) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			func.apply(null, args); //apply가 받아온 모든 args들을 분배해줌
		}, delay);
	};
};
