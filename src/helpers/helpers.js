export const generateRandomValues = (total, numValues) => {
    const values = [];
    let sum = 0;

    for (let i = 0; i < numValues - 1; i++) {
        const value = Math.floor(Math.random() * (total - sum));
        values.push(value);
        sum += value;
    }

    values.push(total - sum);

    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    return values;
}
