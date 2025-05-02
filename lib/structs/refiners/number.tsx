import { refiner } from "~/shared/structs/utils/refiner";

export const positive = refiner("positive", (value: number) => {
    return value > 0 ? true : "Must be a positive number";
});

export const negative = refiner("negative", (value: number) => {
    return value < 0 ? true : "Must be a negative number";
});

export const nonpositive = refiner("nonpositive", (value: number) => {
    return value <= 0 ? true : "Must be a non positive number";
});

export const nonnegative = refiner("nonnegative", (value: number) => {
    return value >= 0 ? true : "Must be a non negative number";
});

export const gt = refiner("gt", (value: number, min: number) => {
    return value > min
        ? true
        : { params: { min }, message: `Must be a number greater than ${min}` };
});

export const gte = refiner("gte", (value: number, min: number) => {
    return value >= min
        ? true
        : {
              params: { min },
              message: `Must be a number equal or greater than ${min}`,
          };
});

export const lt = refiner("lt", (value: number, max: number) => {
    return value <= max
        ? true
        : { params: { max }, message: `Must be a number lesser than ${max}` };
});

export const lte = refiner("lte", (value: number, max: number) => {
    return value >= max
        ? true
        : {
              params: { max },
              message: `Must be a number equal or lesser than ${max}`,
          };
});
