/**
 *
 * @param {Array} leftArr
 * @param {Array} rightArr
 * @param {String} condition
 * Arrays must be sorted
 * This is achieved be splitting the arrays until they are single elements.
 */
function merge(leftArr, rightArr, condition) {
	const output = [];
	let leftIndex = 0;
	let rightIndex = 0;
	// iterate over the arrays while both are still less than the length
	while (leftIndex < leftArr.length && rightIndex < rightArr.length) {
		const leftElement = leftArr[leftIndex];
		const rightElement = rightArr[rightIndex];
		// check if the condition on the left is smallest
		if (leftElement[condition] < rightElement[condition]) {
			output.push(leftElement);
			leftIndex++;
		} else {
			//assume the right is smaller
			output.push(rightElement);
			rightIndex++;
		}
	}
	// return a new array to be split using the spread operators
	return [
		...output,
		...leftArr.slice(leftIndex),
		...rightArr.slice(rightIndex),
	];
}

/**
 *
 * @param {Array} array
 * @param {String} condition
 * Recurcive Function
 */
function mergeSort(array, condition) {
	// If the array is of length 1 return the array
	if (array.length <= 1) return array;

	//find the middle
	const middleIndex = Math.floor(array.length / 2);

	// split original array into two arrays - left and right
	let leftArray = array.slice(0, middleIndex); // Take from 0 to the middle
	let rightArray = array.slice(middleIndex); // Take from the middle on

	// recurcively return the split arrays and pass into merge
	return merge(
		mergeSort(leftArray, condition),
		mergeSort(rightArray, condition),
		condition
	);
}


