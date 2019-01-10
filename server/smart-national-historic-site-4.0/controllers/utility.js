let utility = {};

utility.getFullHour = () => {
	let d = new Date();
	d.setMinutes(0, 0, 0);
	return d;
};

module.exports = utility;