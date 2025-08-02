class Launcher {
	static neighborhoodTypeNames = new Map([
		["square", "SQUARE"],
		["orthogonal", "ORTHOGONAL"],
		["diagonal", "DIAGONAL"],
		["triagonal", "TRIAGONAL"],
		["quadragonal", "QUADRAGONAL"],
		["vertices", "VERTICES"],
		["knight", "KNIGHT"],
		["ultraknight", "ULTRAKNIGHT"]
	]);

	static neighborhoodWrapNames = new Map([
		["no", "NO"],
		["torus", "TORUS"],
		["reflect on cell", "REFLECT_CELL"],
		["reflect on edge", "REFLECT_EDGE"]
	]);

	constructor() {
		this.dimensions = 1;
		
		// Create main container
		this.container = document.createElement('div');
		this.container.style.display = 'flex';
		this.container.style.gap = '20px';
		
		// Create options panel
		this.pnOptions = document.createElement('div');
		this.pnOptions.style.display = 'grid';
		this.pnOptions.style.gridTemplateRows = 'repeat(12, 1fr)';
		this.pnOptions.style.gap = '10px';
		this.pnOptions.style.width = '200px';
		this.pnOptions.style.padding = '20px';
		this.pnOptions.style.backgroundColor = 'white';
		this.pnOptions.style.borderRadius = '8px';
		
		// Create dimensions controls
		this.addLabel("dimensions:");
		this.spDimensions = this.createNumberInput(1, 1, 9000, 1);
		this.spDimensions.addEventListener('input', (e) => {
			this.dimensions = parseInt(e.target.value);
			this.dimsField.update();
		});
		this.pnOptions.appendChild(this.spDimensions);
		
		// Create mines controls
		this.addLabel("mines:");
		this.spModelMines = { minimum: 0, maximum: 0, value: 0 };
		this.spMines = this.createNumberInput(0, 0, 0, 1);
		this.spMines.addEventListener('input', (e) => {
			this.slMines.value = e.target.value;
		});
		this.pnOptions.appendChild(this.spMines);
		
		this.slMines = document.createElement('input');
		this.slMines.type = 'range';
		this.slMines.min = 0;
		this.slMines.max = 0;
		this.slMines.value = 0;
		this.slMines.addEventListener('input', (e) => {
			this.spMines.value = e.target.value;
		});
		this.pnOptions.appendChild(this.slMines);
		
		// Create neighborhood controls
		this.addLabel("neighborhood:");
		this.cbNeigs = document.createElement('select');
		for (let [key, value] of Launcher.neighborhoodTypeNames) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = key;
			this.cbNeigs.appendChild(option);
		}
		this.pnOptions.appendChild(this.cbNeigs);
		
		// Create radius controls
		this.addLabel("radius:");
		this.spRadius = this.createNumberInput(1, 1, 9000, 1);
		this.pnOptions.appendChild(this.spRadius);
		
		// Create wrapping controls
		this.addLabel("wrapping:");
		this.cbWraps = document.createElement('select');
		for (let [key, value] of Launcher.neighborhoodWrapNames) {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = key;
			this.cbWraps.appendChild(option);
		}
		this.pnOptions.appendChild(this.cbWraps);
		
		// Create launch button
		this.btRun = document.createElement('button');
		this.btRun.textContent = 'launch game';
		this.btRun.style.padding = '10px';
		this.btRun.style.backgroundColor = '#4CAF50';
		this.btRun.style.color = 'white';
		this.btRun.style.border = 'none';
		this.btRun.style.borderRadius = '5px';
		this.btRun.style.cursor = 'pointer';
		this.btRun.addEventListener('click', () => this.launch());
		this.pnOptions.appendChild(this.btRun);
		
		// Create dimensions field
		this.dimsField = new DimsField();
		
		// Assemble the UI
		this.container.appendChild(this.pnOptions);
		this.container.appendChild(this.dimsField.element);
		
		// Add to document
		document.body.appendChild(this.container);
	}
	
	addLabel(text) {
		const label = document.createElement('label');
		label.textContent = text;
		label.style.fontWeight = 'bold';
		this.pnOptions.appendChild(label);
	}
	
	createNumberInput(value, min, max, step) {
		const input = document.createElement('input');
		input.type = 'number';
		input.value = value;
		input.min = min;
		input.max = max;
		input.step = step;
		input.style.width = '100%';
		input.style.padding = '5px';
		return input;
	}
	
	launch() {
		try {
			const fieldSize = this.dimsField.getValue();
			const mineCount = parseInt(this.spMines.value);
			const neighborhoodType = Launcher.neighborhoodTypeNames.get(this.cbNeigs.value);
			const radius = parseInt(this.spRadius.value);
			const neighborhoodWrap = Launcher.neighborhoodWrapNames.get(this.cbWraps.value);
			
			const game = new Game(fieldSize, mineCount, neighborhoodType, radius, neighborhoodWrap);
			console.log('Game launched:', game);
			
		} catch (error) {
			console.error(error);
			alert(`Error: ${error.message}`);
		}
	}
}

class DimsField {
	constructor() {
		this.spinners = [];
		this.element = document.createElement('div');
		this.element.style.padding = '20px';
		this.element.style.backgroundColor = 'white';
		this.element.style.borderRadius = '8px';
		this.element.style.minWidth = '200px';
		this.update();
	}
	
	update() {
		const launcher = window.launcher || this.launcher;
		const targetDimensions = launcher ? launcher.dimensions : 2;
		
		if (this.spinners.length < targetDimensions) {
			const spinner = document.createElement('input');
			spinner.type = 'number';
			spinner.min = 1;
			spinner.max = 9000;
			spinner.value = 1;
			spinner.style.width = '100%';
			spinner.style.padding = '5px';
			spinner.style.marginBottom = '5px';
			
			spinner.addEventListener('input', () => {
				if (launcher && launcher.spModelMines) {
					const volume = this.getVolume();
					launcher.spModelMines.maximum = volume - 1;
					launcher.slMines.max = volume - 1;
					launcher.spMines.max = volume - 1;
				}
			});
			
			this.spinners.push(spinner);
			this.element.appendChild(spinner);
			this.update(); // Recursive call like in Java
			
		} else if (this.spinners.length > targetDimensions) {
			const removed = this.spinners.pop();
			this.element.removeChild(removed);
			this.update(); // Recursive call like in Java
			
		} else {
			// Set layout
			this.element.style.display = 'grid';
			this.element.style.gridTemplateRows = `repeat(${targetDimensions}, 1fr)`;
			this.element.style.gap = '5px';
		}
	}
	
	getValue() {
		const result = [];
		for (let spinner of this.spinners) {
			result.push(parseInt(spinner.value) || 1);
		}
		return result;
	}
	
	getVolume() {
		let result = 1;
		for (let spinner of this.spinners) {
			result *= parseInt(spinner.value) || 1;
		}
		return result;
	}
}

// Usage:
// const launcher = new Launcher();
// window.launcher = launcher; // Make it globally accessible for DimsField