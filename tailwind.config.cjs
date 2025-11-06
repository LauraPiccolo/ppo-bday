const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
			},
			spacing: {
			}
		},
		screens: {
			s: { min: '0px', max: '767px' },
			m: { min: '768px', max: '1049px' },
			l: { min: '1050px' }
		}
	},

	plugins: [],
	darkmode: false // or 'media' or 'class'
};

module.exports = config;
