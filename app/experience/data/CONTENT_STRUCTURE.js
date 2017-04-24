// COLOURS: Muted Warmer Grey-tones for the bubbles, and more tonally stronger threads

export const threads = [
	{	
		title: "Jaynie and Leaonado",
		subtitle: "Local business owners",
		colors: {
			// anchor: '#9094a0',
			anchor: '#6c61ad',
			jump: '#5545b2', //blue
			lighting: '#5545b2', //blue
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{	
				id:'J1',
				theme: 'More than moving walls',
				depth: 0,
				jumpPoints: []
			},
			{	
				id:'J2',
				theme: 'Everything is moving',
				depth: 0.05,
				jumpPoints: []
			},
			{	
				id:'J3',
				theme: 'Restoring the architecture',
				depth: 0.12,
				jumpPoints: []
			},
			{	
				id:'J4',
				theme: 'Respecting cultural heritage',
				depth: 0.18,
				jumpPoints: []
			},
			{	
				id:'J5',
				theme: 'Preserving monuments',
				depth: 0.2,
				jumpPoints: []
			},
			{	
				id:'J6',
				theme: 'Staying in the wonderful landscape',
				depth: 0.23,
				jumpPoints: []
			},
			{	
				id:'J7',
				theme: 'Cannot forget',
				depth: 0.25,
				jumpPoints: []
			},
			{	
				id:'J8',
				theme: 'Private and public buildings',
				depth: 0.4,
				jumpPoints: []
			},
			{	
				id:'J9',
				theme: 'Seperating work and memories',
				depth: 0.5,
				jumpPoints: []
			},
			{	
				id:'J10',
				theme: 'We have to go on',
				depth: 0.6,
				jumpPoints: []
			},
			{	
				id:'J11',
				theme: 'Moving on from the past',
				depth: 0.65,
				jumpPoints: []
			},
			{	
				id:'J12',
				theme: 'Learning something useful',
				depth: 0.69,
				jumpPoints: []
			},
			{	
				id:'J13',
				theme: 'A duty of reconstruction',
				depth: 0.72,
				jumpPoints: []
			},
			{	
				id:'J14',
				theme: 'Building a new community',
				depth: 0.8,
				jumpPoints: []
			},
			{	
				id:'J15',
				theme: 'Generational differences',
				depth: 0.86,
				jumpPoints: []
			},
			{	
				id:'J16',
				theme: 'Social value of culture',
				depth: 0.95,
				jumpPoints: ['S17']
			},
			{	
				id:'J17',
				theme: 'Importance of environment',
				depth: 1,
				jumpPoints: []
			}
		]
	},
	{
		title: "Cecilia",
		subtitle: "Mayor of Fonteca",
		colors: {
			// anchor: '#c4a7a1', //orange
			anchor: '#e27d66',
			lighting: '#f97240',
			jump: '#f97240',
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{	
				id:'C1',
				theme: 'A community helping one-another',
				depth: 0,
				jumpPoints: ['C2', 'C5', 'C9']
			},
			{
				id: 'C2',
				theme: 'A project for the community',
				depth: 0.2,
				jumpPoints: ['C3', 'C14', 'S2']
			},
			{
				id: 'C3',
				theme: 'No public funding',
				depth: 0.25,
				jumpPoints: ['C4', 'C5', 'C7']
			},
			{
				id: 'C4',
				theme: 'Building temporary homes',
				depth: 0.3,
				jumpPoints: ['C5', 'C15']
			},
			{
				id: 'C5',
				theme: 'Volunteer workers',
				depth: 0.35,
				jumpPoints: ['C6', 'S7']
			},
			{
				id: 'C6',
				theme: 'A new community',
				depth: 0.4,
				jumpPoints: ['C7', 'C12']
			},
			{
				id: 'C7',
				theme: 'Challenges in building',
				depth: 0.45,
				jumpPoints: ['C8', 'S9']
			},
			{
				id: 'C8', 
				theme: 'Houses made of straw',
				depth: 0.5,
				jumpPoints: ['C9', 'C10']
			},
			{
				id: 'C9',
				theme: 'Moving to the earthquake zone',
				depth: 0.55,
				jumpPoints: ['C10', 'S12']
			},
			{
				id: 'C10',
				theme: 'Rebuilding homes',
				depth: 0.6,
				jumpPoints: ['C11', 'C14', 'C12']
			},
			{
				id: 'C11',
				theme: 'Rebuilding lives',
				depth: 0.65,
				jumpPoints: ['C12', 'S2', 'S16']
			},
			{
				id: 'C12',
				theme: 'Changes in occupancy',
				depth: 0.7,
				jumpPoints: ['C13', 'C17']
			},
			{
				id: 'C13',
				theme: 'Building more new houses',
				depth: 0.75,
				jumpPoints: ['C14', 'S17']
			},
			{
				id: 'C14',
				theme: 'Common property of the village',
				depth: 0.8,
				jumpPoints: ['C15', 'C17']
			},
			{
				id: 'C15',
				theme: 'From temporary to permanent',
				depth: 0.9,
				jumpPoints: ['C16']
			},
			{
				id: 'C16',
				theme: 'Removing temporary accommodation',
				depth: 0.95,
				jumpPoints: ['C17']
			},
			{
				id: 'C17',
				theme: 'Sharing property and profits',
				depth: 1,
				jumpPoints: ['S17']
			},
		]
	},
	{
		title: "Sabrina",
		subtitle: "Architect",
		colors: {
			// anchor: '#85968c',
			anchor: '#99ddda',
			lighting: '#76e2cd',
			jump: '#76e2cd', //green
			renderer: '#243869',
			line: '#ffffff',
		},
		anchors: [
			{	
				id:'S1',
				theme: 'More than moving walls',
				depth: 0,
				jumpPoints: ['S2', 'C2']
			},
			{	
				id:'S2',
				theme: 'Everything is moving',
				depth: 0.05,
				jumpPoints: ['S3', 'S15']
			},
			{	
				id:'S3',
				theme: 'Restoring the architecture',
				depth: 0.12,
				jumpPoints: ['S4', 'S5', 'C7']
			},
			{	
				id:'S4',
				theme: 'Respecting cultural heritage',
				depth: 0.18,
				jumpPoints: ['S5', 'C9']
			},
			{	
				id:'S5',
				theme: 'Preserving monuments',
				depth: 0.2,
				jumpPoints: ['S6', 'S13']
			},
			{	
				id:'S6',
				theme: 'Staying in the wonderful landscape',
				depth: 0.23,
				jumpPoints: ['S7', 'S16']
			},
			{	
				id:'S7',
				theme: 'Cannot forget',
				depth: 0.25,
				jumpPoints: ['S8']
			},
			{	
				id:'S8',
				theme: 'Private and public buildings',
				depth: 0.4,
				jumpPoints: ['S9', 'S14', 'C8']
			},
			{	
				id:'S9',
				theme: 'Seperating work and memories',
				depth: 0.5,
				jumpPoints: ['S10']
			},
			{	
				id:'S10',
				theme: 'We have to go on',
				depth: 0.6,
				jumpPoints: ['S11', 'C11']
			},
			{	
				id:'S11',
				theme: 'Moving on from the past',
				depth: 0.65,
				jumpPoints: ['S12', 'S15']
			},
			{	
				id:'S12',
				theme: 'Learning something useful',
				depth: 0.69,
				jumpPoints: ['S13', 'C16']
			},
			{	
				id:'S13',
				theme: 'A duty of reconstruction',
				depth: 0.72,
				jumpPoints: ['S14', 'S17']
			},
			{	
				id:'S14',
				theme: 'Building a new community',
				depth: 0.8,
				jumpPoints: ['S15']
			},
			{	
				id:'S15',
				theme: 'Generational differences',
				depth: 0.86,
				jumpPoints: ['S16', 'C11']
			},
			{	
				id:'S16',
				theme: 'Social value of culture',
				depth: 0.95,
				jumpPoints: ['S17']
			},
			{	
				id:'S17',
				theme: 'Importance of environment',
				depth: 1,
				jumpPoints: ['C17']
			}
		]
	},
	{
		title: "Marco and Valerio",
		subtitle: "Military officer",
		colors: {
			// anchor: '#a8959d',
			anchor: '#d18398',
			jump: '#ce333b', //rasberry
			lighting: '#ce333b', //rasberry
			renderer: '#ffffff',
			line: '#ffffff',
		},
		anchors: [
			{	
				id:'J1',
				theme: 'More than moving walls',
				depth: 0,
				jumpPoints: []
			},
			{	
				id:'J2',
				theme: 'Everything is moving',
				depth: 0.05,
				jumpPoints: []
			},
			{	
				id:'J3',
				theme: 'Restoring the architecture',
				depth: 0.12,
				jumpPoints: []
			},
			{	
				id:'J4',
				theme: 'Respecting cultural heritage',
				depth: 0.18,
				jumpPoints: []
			},
			{	
				id:'J5',
				theme: 'Preserving monuments',
				depth: 0.2,
				jumpPoints: []
			},
			{	
				id:'J6',
				theme: 'Staying in the wonderful landscape',
				depth: 0.23,
				jumpPoints: []
			},
			{	
				id:'J7',
				theme: 'Cannot forget',
				depth: 0.25,
				jumpPoints: []
			},
			{	
				id:'J8',
				theme: 'Private and public buildings',
				depth: 0.4,
				jumpPoints: []
			},
			{	
				id:'J9',
				theme: 'Seperating work and memories',
				depth: 0.5,
				jumpPoints: []
			},
			{	
				id:'J10',
				theme: 'We have to go on',
				depth: 0.6,
				jumpPoints: []
			},
			{	
				id:'J11',
				theme: 'Moving on from the past',
				depth: 0.65,
				jumpPoints: []
			},
			{	
				id:'J12',
				theme: 'Learning something useful',
				depth: 0.69,
				jumpPoints: []
			},
			{	
				id:'J13',
				theme: 'A duty of reconstruction',
				depth: 0.72,
				jumpPoints: []
			},
			{	
				id:'J14',
				theme: 'Building a new community',
				depth: 0.8,
				jumpPoints: []
			},
			{	
				id:'J15',
				theme: 'Generational differences',
				depth: 0.86,
				jumpPoints: []
			},
			{	
				id:'J16',
				theme: 'Social value of culture',
				depth: 0.95,
				jumpPoints: ['S17']
			},
			{	
				id:'J17',
				theme: 'Importance of environment',
				depth: 1,
				jumpPoints: []
			}
		]
	},
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