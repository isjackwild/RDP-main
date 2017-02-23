// COLOURS: Muted Warmer Grey-tones for the bubbles, and more tonally stronger threads

export const threads = [
	{
		colors: {
			anchor: '#a0998e',
			jump: '#FFA925',
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{id: 'a0', depth: 0, jumpPoints: ['a1', 'a6']},
			{id: 'a1', depth: 0.1, jumpPoints: ['a2']},
			{id: 'a2', depth: 0.12, jumpPoints: ['a3']},
			{id: 'a3', depth: 0.13, jumpPoints: ['a4', 'a6']},
			{id: 'a4', depth: 0.14, jumpPoints: ['a5']},
			{id: 'a5', depth: 0.15, jumpPoints: ['a8', 'a10']},
			{id: 'a6', depth: 0.2, jumpPoints: ['a7', 'a14']},
			{id: 'a7', depth: 0.22, jumpPoints: ['a8']},
			{id: 'a8', depth: 0.26, jumpPoints: ['a9', 'a21']},
			{id: 'a9', depth: 0.27, jumpPoints: []},
			{id: 'a10', depth: 0.3, jumpPoints: ['a11']},
			{id: 'a11', depth: 0.4, jumpPoints: ['a12']},
			{id: 'a12', depth: 0.5, jumpPoints: ['a13']},
			{id: 'a13', depth: 0.56, jumpPoints: []},
			{id: 'a14', depth: 0.65, jumpPoints: ['a20', 'a15', 'a17']},
			{id: 'a15', depth: 0.67, jumpPoints: ['a16']},
			{id: 'a16', depth: 0.8, jumpPoints: []},
			{id: 'a17', depth: 0.82, jumpPoints: ['a20', 'a18']},
			{id: 'a18', depth: 0.84, jumpPoints: ['a19', 'a20']},
			{id: 'a19', depth: 0.85, jumpPoints: []},
			{id: 'a20', depth: 0.9, jumpPoints: ['a21']},
			{id: 'a21', depth: 1, jumpPoints: []},
		]
	},
	// {	
	// 	colors: {
	// 		anchor: '#9094a0',
	// 		jump: '#5545b2', //blue
	// 		renderer: '#243869',
	// 		line: '#ffffff',
	// 	},
	// 	anchors: [
	// 		{id: 'b0', depth: 0, jumpPoints: ['b1', 'b2']},
	// 		{id: 'b1', depth: 0.2, jumpPoints: ['a3']},
	// 		{id: 'b2', depth: 0.8, jumpPoints: []},
	// 	]
	// },
	// {
	// 	colors: {
	// 		anchor: '#c4a7a1', //orange
	// 		jump: '#fc7d67',
	// 		renderer: '#243869',
	// 		line: '#ffffff',
	// 	},
	// 	anchors: [
	// 		{id: 'c0', depth: 0, jumpPoints: ['c1', 'c2', 'c3']},
	// 		{id: 'c1', depth: 0.2, jumpPoints: ['c4']},
	// 		{id: 'c2', depth: 0.3, jumpPoints: ['c4']},
	// 		{id: 'c3', depth: 0.8, jumpPoints: ['d1', 'b2']},
	// 		{id: 'c4', depth: 1, jumpPoints: []},
	// 	]
	// },
	// {
	// 	colors: {
	// 		anchor: '#85968c',
	// 		jump: '#76e2cd', //green
	// 		renderer: '#243869',
	// 		line: '#ffffff',
	// 	},
	// 	anchors: [
	// 		{id: 'd0', depth: 0, jumpPoints: ['d1']},
	// 		{id: 'd1', depth: 0.8, jumpPoints: []},
	// 	]
	// },
	// {
	// 	colors: {
	// 		anchor: '#a8959d',
	// 		jump: '#ce333b', //rasberry
	// 		renderer: '#ffffff',
	// 		line: '#ffffff',
	// 	},
	// 	anchors: [
	// 		{id: 'e0', depth: 0, jumpPoints: ['d1', 'c3', 'e1']},
	// 		{id: 'e1', depth: 0.1, jumpPoints: ['e3']},
	// 		{id: 'e2', depth: 0.2, jumpPoints: ['e4', 'e5', 'c4']},
	// 		{id: 'e3', depth: 0.4, jumpPoints: ['a2']},
	// 		{id: 'e4', depth: 0.8, jumpPoints: ['e5', 'e5']},
	// 		{id: 'e5', depth: 1, jumpPoints: ['b2']},
	// 	]
	// },
]

// export const groups = [
// 	[
// 		paths[0],
// 		paths[1],
// 		paths[2],
// 		paths[3],
// 	],
// ];
// 
// 



export const structure = [
	{id: 'c0', depth: 0, jumpPoints: ['c1', 'c2', 'c3']},
	{id: 'c1', depth: 1, jumpPoints: ['c4']},
	{id: 'c2', depth: 1, jumpPoints: ['c4']},
	{id: 'c3', depth: 1, jumpPoints: []},
	{id: 'c4', depth: 2, jumpPoints: []},
];