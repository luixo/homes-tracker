let STOP_SIGNAL = false;
export const changeStopSignal = (nextSignal: boolean) => {
	STOP_SIGNAL = nextSignal;
};

export const getStopSignal = () => STOP_SIGNAL;
