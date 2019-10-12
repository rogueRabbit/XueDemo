import warn from './utils/warn';

function Xue(options) {
    if (typeof options !== 'object') return warn(`options should be an object rather than a/an ${ typeof options }`);
    this.init(this, options);
}

export default Xue;