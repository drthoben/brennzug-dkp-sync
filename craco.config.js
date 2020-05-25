const lessPlugin = require('craco-less');


module.exports = {
	plugins: [
		{
			plugin: lessPlugin,
			options: {
				lessLoaderOptions: {
					javascriptEnabled: true,
				},
			},
		},
	],
};
