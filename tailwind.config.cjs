const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./node_modules/flowbite/**/*.js'
	],
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Rubik', ...defaultTheme.fontFamily.sans],
				'mono': ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
			}
		},
	},
	plugins: [
		require('flowbite-typography'),
		require('flowbite/plugin')
	],
}
