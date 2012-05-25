var bigSum = function (n) {
    return trampoline(sumThunk(n, thunkValue));
};