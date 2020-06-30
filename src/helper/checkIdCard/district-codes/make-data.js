/* this is a command line tool */
/* eslint-disable */
const data = require('./source.js');
const fs = require('fs');
const path = require('path');

const map = {};
data.forEach(line => {
	const a1 = short(line.substr(0,2));
	const a2 = short(line.substr(2,2));
	if (!a1 || !a2) {
		return;
	}
	if (!map[a1]){
		map[a1] = {};
	}
	if (!map[a1][a2]) {
		map[a1][a2] = [];
	}
	map[a1][a2].push(Number(line.substr(4,2)));
});
function short(num) {
	if (num === -1) return '-';
	num = Number(num);
	if (!num) {
		return null;
	}
	if (num < 80) {
		return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()_=+[{]}|;:,<.>/?'[num];
	}
	return '' + num;
}

for (const a1 in map) {
	for (const a2 in map[a1]) {
		const arr = map[a1][a2];
		let start = null;
		let curr;
		const r = [];
		let i;
		for (i = 0; i < arr.length; i ++) {
			if (start === null) {
				curr = arr[i];
				start = i;
			} else if (arr[i] - curr === 1) {
				curr = arr[i];
			} else {
				const end = i - 1;
				if (end - start > 1) {
					const removeLength = end - start - 2;
					arr.splice(start + 1, removeLength + 1, -1);
					i -= removeLength;
				}
				start = i;
				curr = arr[i];
			}
		}
		const end = i - 1;
		if (end - start > 1) {
			const removeLength = end - start - 2;
			arr.splice(start + 1, removeLength + 1, -1);
			i -= removeLength;
		}
		map[a1][a2] = arr.map(short).join('');
	}
}
let result = JSON.stringify(map);
const header = "/*eslint-disable*/\n//本文件是压缩后的数据文件，由 make-data.js 自动生成，请勿直接修改本文件。\n//如果要修改数据，请在 source.js 中修改，然后运行 make-data.js 即可生成本文件\n\nmodule.exports=";
fs.writeFileSync(path.resolve(__dirname, "data.js"), header + result, "utf-8");
console.log("data length", result.length);
