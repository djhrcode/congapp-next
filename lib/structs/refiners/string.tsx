import { refiner } from "~/shared/structs/utils/refiner";

export const regexps = {
    emailAddress: /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
};

export const emailAddress = refiner("emailAddress", (value: string) => {
    return regexps.emailAddress.test(value)
        ? true
        : `Must be a valid email address`;
});

export const pattern = refiner(
    "pattern",
    (value: string, pattern: RegExp, tag: string) => {
        return pattern.test(value)
            ? true
            : {
                  params: { tag },
                  message: `Must match the given pattern called ${tag}`,
              };
    }
);

export const size = refiner("size", (value: string, size: number) => {
    return value.length === size
        ? true
        : {
              params: { size },
              message: `Must be a text of ${size} characters`,
          };
});
