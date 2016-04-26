const Errors        = require('../misc/errors');
const EventEmitter  = require('../misc/event_emitter');

class Model {
	constructor() {
		this.emitter_ = new EventEmitter();
		this.value_ = null;
		this.constraints_ = [];
	}

	getEmitter() {
		return this.emitter_;
	}

	getValue() {
		return this.value_;
	}

	static validate(value) {
		return value !== null;
	}

	constrain_() {
		this.value_ = this.constraints_.reduce((v, constraint) => {
			return constraint.constrain(v);
		}, this.value_);
		this.emitter_.notifyObservers(
			Model.EVENT_CHANGE,
			[this.value_]
		);
	}

	setValue(value) {
		if (!this.constructor.validate(value)) {
			return false;
		}

		this.value_ = value;
		this.constrain_();

		return true;
	}

	getConstraints() {
		return this.constraints_;
	}

	findConstraintByClass(ConstraintClass) {
		const result = this.constraints_.filter((constraint) => {
			return constraint instanceof ConstraintClass;
		});
		return (result.length > 0) ?
			result[0] :
			null;
	}

	addConstraint(constraint) {
		if (this.findConstraintByClass(constraint.constructor)) {
			throw Errors.constraintAlreadyExists(constraint);
		}

		this.constraints_.push(constraint);

		this.constrain_();
	}
}

Model.EVENT_CHANGE = 'change';

module.exports = Model;