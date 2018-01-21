import {MouseCaster} from './MouseCaster.js'
import {Signal} from '../lib/Signal.js'

export class SelectionManager{
// 'utils/Tools', 'lib/LinkedList', 'utils/MouseCaster', 'lib/Signal'
	constructor(mouse) {
		this.mouse = mouse;

		this.onSelect = new Signal();
		this.onDeselect = new Signal();

		this.selected = null;
		// deselect if player clicked on the same thing twice
		this.toggleSelection = false;

		// allow multiple entities to be selected at once
		// this.multiselect = false; // todo
		// this.allSelected = new LinkedList();

		this.mouse.signal.add(this.onMouse, this);
	}


	select(obj, fireSignal) {
		if (!obj) return;
		fireSignal = fireSignal || true;

		if (this.selected !== obj) {
			// deselect previous object
			this.clearSelection(fireSignal);
		}
		if (obj.selected) {
			if (this.toggleSelection) {
				if (fireSignal) {
					this.onDeselect.dispatch(obj);
				}
				obj.deselect();
			}
		}
		else {
			obj.select();
		}

		this.selected = obj;
		if (fireSignal) {
			this.onSelect.dispatch(obj);
		}
	}

	clearSelection(fireSignal) {
		fireSignal = fireSignal || true;
		if (this.selected) {
			if (fireSignal) {
				this.onDeselect.dispatch(this.selected);
			}
			this.selected.deselect();
		}
		this.selected = null;
	}

	onMouse(type, obj) {
		switch (type) {
			case MouseCaster.DOWN:
				if (!obj) {
					this.clearSelection();
				}
				break;

			case MouseCaster.CLICK:
				this.select(obj);
				break;
		}
	}
}
