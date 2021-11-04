function zip(array1, array2) {
	if (array1.length !== array2.length) return;
	let newArray = [];
	for (let i = 0; i < array1.length; i++) {
		newArray.push([array1[i], array2[i]]);
	}
	return newArray;
}


