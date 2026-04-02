/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./views/**/*.blade.php',
		'./public/viewjs/**/*.js',
		'./public/js/**/*.js',
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Roboto', 'sans-serif'],
			},
			colors: {
				'grocy-blue': '#337ab7',
				'sidebar': '#e5e5e5',
				'sidebar-border': '#d6d6d6',
				'dark-bg': '#333131',
				'dark-bg-light': '#383838',
			},
			zIndex: {
				'tooltip': '99999',
				'modal': '99998',
				'sticky': '1030',
			},
		},
	},
	safelist: [
		'show',
		'active',
		'disabled',
		'fade',
		'collapse',
		'hidden',
	],
	plugins: [
		require('@tailwindcss/forms'),
	],
};
