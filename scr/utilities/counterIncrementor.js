// const CounterModel = require("../modules/counter/counter.model");

// const counterIncrementor = async (name) => {
// 	try {
// 		let counter = await CounterModel.findOneAndUpdate({ name: name }, { $inc: { seq: 1 }, name: name });
// 		if (counter) {
// 			return counter.seq + 1;
// 		} else {
// 			CounterModel.create({ seq: 1, name: name })
// 			return 1;
// 		}
// 	} catch (error) {
// 		return null
// 	}
// }
// module.exports = counterIncrementor